# Commands

Verified against `gh` 2.72 on github.com and GitHub Enterprise. Set once:

```bash
REPO=owner/name          # from the arg, or: gh repo view --json nameWithOwner -q .nameWithOwner
PR=87
HOST=$(git remote get-url origin | sed -E 's#^[a-z]+://##; s#^[^@/]+@##; s#[:/].*$##')
[ "$HOST" != "github.com" ] && export GH_HOST="$HOST"
```

`gh api graphql` needs `GH_HOST` on an Enterprise host; `gh pr` and `gh issue` resolve it
from the remote on their own. Export it either way and both paths work.

The three-step strip (scheme, then userinfo, then path) is deliberate — it's what makes
`https://`, `ssh://…:22/`, and credentialed remotes yield the host instead of the org.

## Phase 0 — resolve

```bash
gh pr view "$PR" --repo "$REPO" --json \
  number,title,body,isDraft,state,baseRefName,headRefName,headRefOid,mergeable,labels,commits,url

BASE=$(gh pr view "$PR" --repo "$REPO" --json baseRefName -q .baseRefName)
HEAD=$(gh pr view "$PR" --repo "$REPO" --json headRefName -q .headRefName)
SHA=$(gh pr view "$PR" --repo "$REPO" --json headRefOid -q .headRefOid)   # move-detection baseline

git fetch origin "$BASE" "$HEAD"
```

Gate file — read from the PR's own tree, never the working directory:

```bash
for p in docs/definition-of-done.md docs/DEFINITION-OF-DONE.md DEFINITION-OF-DONE.md \
         .github/definition-of-done.md CONTRIBUTING.md; do
  git show "origin/$HEAD:$p" 2>/dev/null | head -1 && echo "  ^ gate candidate: $p"
done
```

Verification commands — enumerate, don't assume:

```bash
node -e "console.log(Object.keys(require('./package.json').scripts||{}).join('\n'))"  # JS
ls pnpm-lock.yaml package-lock.json yarn.lock bun.lockb pom.xml build.gradle* \
   pyproject.toml go.mod Cargo.toml 2>/dev/null                                      # runner
```

| Marker | Gate commands |
|---|---|
| `pnpm-lock.yaml` | `pnpm install --frozen-lockfile`, then the scripts that exist |
| `package-lock.json` | `npm ci`, then the scripts that exist |
| `yarn.lock` / `bun.lockb` | `yarn install --immutable` / `bun install --frozen-lockfile` |
| `pom.xml` | `./mvnw -q verify` |
| `build.gradle*` | `./gradlew check` |
| `pyproject.toml` | `ruff check`, `mypy`, `pytest` — whichever are configured |
| `go.mod` | `go vet ./... && go test ./...` |

Run only what exists. A script you invented fails and looks like the PR's fault.

## Phase 1 — isolate

```bash
ORIGINAL_DIR=$PWD
SCRATCH="${SCRATCH:-$(mktemp -d)}"           # anywhere outside the repository
WT="$SCRATCH/pr$PR"
git worktree add --detach "$WT" "$SHA"      # --detach: the branch is checked out elsewhere
cd "$WT" || exit 1                          # a failed cd lands in the user's main checkout
git status -sb && git rev-parse HEAD        # confirm before the first edit
```

Teardown, after the PR is published and clean:

```bash
cd "$ORIGINAL_DIR" || exit 1
git worktree remove --force "$WT"
```

`worktree remove` never loses commits you pushed. If it refuses, something in the
directory is still running — stop it rather than deleting by hand.

## Phase 2 — investigate

```bash
git diff --stat "origin/$BASE...origin/$HEAD"
git diff "origin/$BASE...origin/$HEAD"
git log --oneline "origin/$BASE..origin/$HEAD"

# all three feedback endpoints — disjoint sets
gh api "repos/$REPO/issues/$PR/comments" --paginate    # PR conversation
gh api "repos/$REPO/pulls/$PR/comments"  --paginate    # inline
gh api "repos/$REPO/pulls/$PR/reviews"   --paginate    # review bodies

# who stacks on this branch
gh pr list --repo "$REPO" --state open --base "$HEAD" --json number,headRefName,isDraft
```

Threads with resolution state:

```bash
gh api graphql -f owner="${REPO%/*}" -f name="${REPO#*/}" -F pr="$PR" -f query='
query($owner:String!,$name:String!,$pr:Int!){
  repository(owner:$owner,name:$name){ pullRequest(number:$pr){
    reviewThreads(first:100){ nodes{
      id isResolved isOutdated path line
      comments(first:20){ nodes{ author{login} body createdAt } } } } } } }'
```

## Phase 6 — publish

```bash
git status --porcelain                                    # only this run's files
git add <explicit paths>                                  # never `git add <dir>` — see below
git commit -m "..."

# remote must not have moved
NOW=$(gh pr view "$PR" --repo "$REPO" --json headRefOid -q .headRefOid)
[ "$NOW" = "$SHA" ] || { echo "remote head moved: $SHA -> $NOW"; exit 1; }
git merge-base --is-ancestor "$SHA" HEAD || { echo "HEAD does not descend from $SHA"; exit 1; }

git push origin "HEAD:$HEAD"                              # fast-forward only, never --force
```

`git add <dir>` will commit a `node_modules` symlink even with `node_modules/` in
`.gitignore` — gitignore matches the directory, not a symlink of the same name. Verify:

```bash
git ls-tree -r HEAD --name-only | grep -n 'node_modules' && echo "REMOVE THESE"
```

Body — replace, never append:

```bash
gh pr edit "$PR" --repo "$REPO" --body-file /path/to/body.md
gh pr edit "$PR" --repo "$REPO" --title "..."
```

## Phase 7 — transition

```bash
# reply, then resolve — one thread at a time
gh api "repos/$REPO/pulls/comments/<comment-id>/replies" -f body='...'   # or the reviews API
gh api graphql -f t=<threadId> -f query='
mutation($t:ID!){ resolveReviewThread(input:{threadId:$t}){ thread{ isResolved } } }'

gh pr checks "$PR" --repo "$REPO" --watch
gh pr ready "$PR" --repo "$REPO"

# label: create it if missing. gh pr edit --add-label can 500 on GitHub Enterprise
# (Projects Classic); the issues API works
gh label create pr-ready-for-review --repo "$REPO" 2>/dev/null || true
gh api "repos/$REPO/issues/$PR/labels" -f "labels[]=pr-ready-for-review"
```

## Phase 8 — final state

```bash
gh pr view "$PR" --repo "$REPO" --json \
  number,url,state,isDraft,mergeable,headRefOid,labels,statusCheckRollup

gh api graphql -f owner="${REPO%/*}" -f name="${REPO#*/}" -F pr="$PR" -f query='
query($owner:String!,$name:String!,$pr:Int!){ repository(owner:$owner,name:$name){
  pullRequest(number:$pr){ reviewThreads(first:100){ nodes{ isResolved } } } } }' \
  | grep -o '"isResolved":false' | wc -l          # must be 0, or each one explained

git status --porcelain          # empty
git rev-parse HEAD              # equals headRefOid above
```
