<#
.SYNOPSIS
    Validate feature directory and required documentation

.DESCRIPTION
    check-prerequisites.ps1 - Validates the presence of required files
    and builds a list of available documentation for feature development.

.PARAMETER Json
    Output results as JSON format

.PARAMETER RequireTasks
    Fail if tasks.md doesn't exist

.PARAMETER IncludeTasks
    Include tasks.md in available docs list

.PARAMETER PathsOnly
    Only output paths, skip validation

.EXAMPLE
    .\check-prerequisites.ps1 -Json
    .\check-prerequisites.ps1 -RequireTasks -IncludeTasks
#>

param(
    [switch]$Json,
    [switch]$RequireTasks,
    [switch]$IncludeTasks,
    [switch]$PathsOnly
)

$ErrorActionPreference = "Stop"

# Get current git branch
try {
    $currentBranch = git rev-parse --abbrev-ref HEAD 2>$null
} catch {
    $currentBranch = "unknown"
}

# Determine feature directory based on branch or current directory
$featureDir = ""

if ($currentBranch -match '^claude/plan-(.+)-[A-Za-z0-9]+$') {
    # Extract feature name from branch
    $featureName = $matches[1]

    # Look for feature directory in production-readiness-specs/
    $possibleDirs = @(
        "production-readiness-specs/F002-$featureName",
        "production-readiness-specs/$featureName"
    )

    foreach ($dir in $possibleDirs) {
        if (Test-Path $dir -PathType Container) {
            $featureDir = (Resolve-Path $dir).Path
            break
        }
    }

    # Fallback: search for matching directory
    if (-not $featureDir) {
        $found = Get-ChildItem -Path "production-readiness-specs" -Directory -Filter "*$featureName*" -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($found) {
            $featureDir = $found.FullName
        }
    }
} else {
    # No feature branch detected, use current directory if it looks like a feature dir
    if ((Test-Path "spec.md") -and (Test-Path "impl-plan.md")) {
        $featureDir = (Get-Location).Path
    }
}

# Paths-only mode: just output the directory and exit
if ($PathsOnly) {
    if ($featureDir) {
        Write-Output "FEATURE_DIR=$featureDir"
    }
    exit 0
}

# Validate feature directory exists
if (-not $featureDir -or -not (Test-Path $featureDir -PathType Container)) {
    Write-Error "ERROR: Feature directory not found`nBranch: $currentBranch`nExpected: production-readiness-specs/F002-*/ or production-readiness-specs/*/"
    exit 1
}

# Check for required files
$planMd = Join-Path $featureDir "impl-plan.md"
$specMd = Join-Path $featureDir "spec.md"
$tasksMd = Join-Path $featureDir "tasks.md"

# Required files
if (-not (Test-Path $planMd)) {
    Write-Error "ERROR: Required file not found: impl-plan.md`nFeature directory: $featureDir"
    exit 1
}

if (-not (Test-Path $specMd)) {
    Write-Error "ERROR: Required file not found: spec.md`nFeature directory: $featureDir"
    exit 1
}

# Check tasks.md if required
if ($RequireTasks -and -not (Test-Path $tasksMd)) {
    Write-Error "ERROR: Required file not found: tasks.md`nFeature directory: $featureDir`nRun: /speckit.tasks to generate tasks.md"
    exit 1
}

# Build list of available optional docs
$availableDocs = @()

# Always include required docs
$availableDocs += "spec.md"
$availableDocs += "impl-plan.md"

# Include tasks.md if it exists and -IncludeTasks is set
if ($IncludeTasks -and (Test-Path $tasksMd)) {
    $availableDocs += "tasks.md"
}

# Check for optional docs
$optionalDocs = @(
    @{ Path = "research.md"; Name = "research.md" },
    @{ Path = "data-model.md"; Name = "data-model.md" },
    @{ Path = "quickstart.md"; Name = "quickstart.md" },
    @{ Path = "agent-context.md"; Name = "agent-context.md" },
    @{ Path = "contracts"; Name = "contracts/" }
)

foreach ($doc in $optionalDocs) {
    $fullPath = Join-Path $featureDir $doc.Path
    if (Test-Path $fullPath) {
        $availableDocs += $doc.Name
    }
}

# Output results
if ($Json) {
    # JSON output
    $output = @{
        FEATURE_DIR = $featureDir
        AVAILABLE_DOCS = $availableDocs
    }
    $output | ConvertTo-Json -Compress
} else {
    # Human-readable output
    Write-Output "Feature Directory: $featureDir"
    Write-Output ""
    Write-Output "Available Documentation:"
    foreach ($doc in $availableDocs) {
        Write-Output "  ✓ $doc"
    }
}

exit 0
