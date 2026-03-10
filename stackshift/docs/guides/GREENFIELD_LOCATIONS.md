# Greenfield Build Locations

**Where should the new application be built?**

StackShift supports three approaches for greenfield implementations.

---

## Option A: Subfolder (Recommended)

**Build new app as subfolder of current repo**

### Examples

```
my-rails-app/
├── [rails code]           # Original app
├── .specify/              # Tech-agnostic specs
└── greenfield/            # NEW Next.js app
```

Or custom name:
```
my-app/
├── [original]
├── .specify/
└── v2/                    # NEW app
```

### Pros

✅ **Single repo** - Old and new together
✅ **Easy comparison** - Side-by-side
✅ **Works in Web** - Claude Code Web compatible
✅ **Git history** - Both versions tracked
✅ **Gradual migration** - Run both simultaneously

### Cons

❌ **Mixed concerns** - Two apps in one repo
❌ **Larger repo** - Contains both codebases

### Best For

- Gradual migrations
- Side-by-side comparison
- Claude Code Web users
- Learning/experimentation

### Configuration

```json
{
  "config": {
    "greenfield_location": "greenfield/"  // or "v2/", "new-app/", etc.
  }
}
```

---

## Option B: Separate Directory (Local Only)

**Build new app in completely separate location**

### Examples

**Sibling directory:**
```
git/
├── my-app/                    # Original (specs extracted here)
│   └── .specify/
└── my-app-v2/                 # NEW app (built here)
```

**Different location:**
```
~/projects/legacy-app/         # Original
  └── .specify/

~/new-projects/modern-app/     # NEW app
```

### Pros

✅ **Clean separation** - Completely independent
✅ **Independent git** - Separate repos, histories
✅ **Clear boundaries** - No mixing
✅ **Production ready** - Each deployable independently

### Cons

❌ **Doesn't work in Web** - Claude Code Web can't access multiple repos
❌ **Manual repo creation** - Need to create second repo
❌ **Cross-repo references** - Can't easily compare

### Best For

- Production migrations
- Team handoffs (legacy team vs new team)
- Different deployment pipelines
- Long-term separate maintenance

### Configuration

```json
{
  "config": {
    "greenfield_location": "~/git/my-new-app"  // Absolute path
    // or
    "greenfield_location": "../my-app-v2"      // Relative path
  }
}
```

### Setup

**StackShift will:**
1. Extract specs in original repo (.specify/)
2. Create the new directory if it doesn't exist
3. Initialize git repo (if not exists)
4. **COPY .specify/ to new repo**
5. Initialize target stack (npm init, etc.)
6. Build features from specs (now in new repo!)
7. Commit to the new repo

**Why copy .specify/?**
- New repo needs specs for ongoing development
- `/speckit.*` commands require .specify/ to be present
- Future features can be added with `/speckit.specify`
- New repo is self-contained and spec-driven from day one

**You provide:**
- Path to new directory
- StackShift handles the rest!

---

## Option C: Replace in Place (Not Recommended)

**Build new app in same directory, replacing old code**

### How It Works

```
my-app/              # Original Rails app
├── app/
├── config/
└── Gemfile

# StackShift extracts specs first
↓

my-app/              # Specs extracted
├── [rails code]
├── .specify/        # Specs saved
└── docs/

# Then replaces old with new
↓

my-app/              # NEW Next.js app
├── package.json     # New stack
├── app/             # New code (Rails deleted!)
└── .specify/        # Specs remain
```

### Pros

✅ **Same directory** - No reorganization
✅ **Clean result** - Only new code remains

### Cons

❌ **Destructive** - Old code deleted!
❌ **No comparison** - Can't reference old implementation
❌ **Risky** - What if new app has issues?
❌ **Git history lost** - Unless committed first

### Best For

- Prototypes/experiments (don't care about old code)
- When old code is backed up elsewhere
- You're absolutely sure about the rebuild

### Not Recommended Because

- Can't compare old vs new
- Can't fall back if issues
- Loses reference implementation
- Risky for production systems

---

## Comparison Table

| Aspect | Subfolder | Separate Directory | Replace in Place |
|--------|-----------|-------------------|------------------|
| **Claude Code Web** | ✅ Works | ❌ No | ✅ Works |
| **Side-by-side** | ✅ Yes | ❌ No | ❌ No |
| **Clean separation** | ⚠️ Same repo | ✅ Yes | N/A |
| **Risk** | Low | Low | ⚠️ High |
| **Comparison** | ✅ Easy | ⚠️ Manual | ❌ Impossible |
| **Production ready** | ✅ Both apps | ✅ Independent | ✅ One app |
| **Recommended** | ✅ Yes | ✅ For local | ❌ No |

---

## Recommendations

### For Claude Code Web

**Use subfolder:**
```
greenfield_location: "greenfield/"  (or custom name)
```

Web can only work on one repo, so everything must be in same repo.

### For Local Claude Code

**Either works:**

**Subfolder** (easier):
```
greenfield_location: "v2/"
```

**Separate directory** (cleaner):
```
greenfield_location: "~/git/my-new-app"
```

### For Production Migrations

**Start with subfolder, then separate:**

1. **Phase 1:** Build in subfolder
   ```
   my-app/
   ├── [old]
   └── v2/  # New app
   ```

2. **Phase 2:** Test and validate
   - Run both apps
   - Compare behavior
   - Gradually migrate users

3. **Phase 3:** Extract to separate repo
   ```bash
   # Move v2/ to own repo
   mv my-app/v2 ../my-app-v2
   cd ../my-app-v2
   git init
   git add .
   git commit -m "Initial commit: extracted from v1"
   ```

---

## Examples in Practice

### Gradual Migration (Subfolder)
```
stripe-clone/
├── legacy/              # Old PHP app
├── .specify/
└── nextjs-version/      # NEW Next.js app
    └── [both running, gradual user migration]
```

### Clean Break (Separate)
```
~/projects/
├── old-monolith/        # Specs extracted
│   └── .specify/
└── new-microservices/   # Built from specs
    ├── auth-service/
    ├── api-service/
    └── web-app/
```

### Quick Iteration (Subfolder)
```
experiment/
├── idea-v1/            # First try
├── idea-v2/            # Second try
├── idea-v3/            # Third try (the one!)
└── .specify/           # Same specs, different implementations
```

---

**Choose based on your needs!** StackShift supports all approaches. 🚗

**Default:** Subfolder (simplest, works everywhere)
**Power users:** Absolute paths (maximum flexibility)
