# Quick Start - 5 Minutes to Code Analysis

## Step 1: Basic Analysis

Run the analyzer on any code directory:

```bash
cd /home/user/September-Release-/code-analyzer

# Analyze the example files
python3 -m analyzer analyze examples/
```

Expected output:
```
============================================================
  Analyzing examples/
============================================================

🔍 Scanning files...

============================================================
  Analysis Results
============================================================

📊 Code Metrics:
   • Files analyzed: 2
   • Languages: python, typescript
   • Total LOC: 230
   • Functions: 47
   • Classes: 3

📈 Quality Metrics:
   • Quality Score: 17.5/100
   • Cyclomatic Complexity: 25
   • Maintainability Index: 37.5/100

⚠️  Issues:
   • Code Smells: 8
   • Refactoring Suggestions: 10
```

## Step 2: Generate Full Report

Get detailed documentation and recommendations:

```bash
python3 -m analyzer report examples/ --output ./my_report
```

This creates:
- `ANALYSIS_SUMMARY.md` - Overview
- `API_DOCUMENTATION.md` - Function signatures
- `ARCHITECTURE.md` - System design diagrams
- `CODE_SMELLS.md` - Issues found
- `REFACTORING_SUGGESTIONS.md` - How to improve
- `analysis.json` - Raw data

## Step 3: Review Results

### Check the summary
```bash
cat my_report/ANALYSIS_SUMMARY.md
```

### See quality issues
```bash
cat my_report/CODE_SMELLS.md
```

### Get improvement suggestions
```bash
cat my_report/REFACTORING_SUGGESTIONS.md
```

## Step 4: Analyze Your Own Code

```bash
# Single file
python3 -m analyzer analyze /path/to/your/file.py

# Entire directory
python3 -m analyzer analyze /path/to/your/project --recursive

# Generate full report
python3 -m analyzer report /path/to/your/project --output ./analysis
```

## Supported File Types

- Python (`.py`)
- TypeScript (`.ts`, `.tsx`)
- Java (`.java`)
- C++ (`.cpp`, `.cc`, `.h`, `.hpp`)

## Common Commands

```bash
# Quick check
python3 -m analyzer analyze ./src

# Full analysis with report
python3 -m analyzer report ./src --output ./results

# Analyze specific language
python3 -m analyzer analyze ./src --language python

# Non-recursive analysis
python3 -m analyzer analyze ./file.py

# View version
python3 -m analyzer --version

# Get help
python3 -m analyzer --help
python3 -m analyzer analyze --help
python3 -m analyzer report --help
```

## Understanding the Metrics

### Quality Score (0-100)

**What it means:**
- 90-100: Excellent code
- 70-89: Good, minor issues
- 50-69: Fair, refactoring suggested
- 30-49: Poor, significant work needed
- 0-29: Critical, needs major refactoring

### Cyclomatic Complexity

**What it means:** How many decision points (if/else/loops) your code has

**Good values:** 1-5 per function

**Why it matters:** Higher complexity = harder to test and maintain

### Maintainability Index (0-171)

**What it means:** Overall code quality score

**Good values:** 85+ is highly maintainable

### Lines of Code (LOC)

**What it means:** How long your functions and classes are

**Good practice:** Functions under 50 lines, classes under 200 lines

## Reading the Code Smells Report

Each smell shows:
- **Name**: Type of issue
- **Severity**: HIGH 🔴, MEDIUM 🟡, or LOW 🟢
- **Location**: Where in the code
- **Description**: What the problem is
- **Suggestion**: How to fix it

Example:
```
### Deep Nesting (MEDIUM)
Description: Code has 6 levels of nesting
Location: Line 42
Suggestion: Extract nested code into separate functions
```

## Reading Refactoring Suggestions

Each suggestion shows:
- **Current Code**: The problem code
- **Refactored Code**: The improved version
- **Why**: The reasoning
- **Benefits**: What you'll gain

Example:
```
## Extract Method

### Current Code
def process_user(user):
    # 80 lines mixing validation, transformation, storage
    
### Refactored Code
def process_user(user):
    validated = self._validate(user)
    transformed = self._transform(validated)
    return self._store(transformed)
```

## Interpreting the Architecture Diagram

The diagram shows:
- **Boxes**: Classes, modules, or components
- **Arrows**: Relationships and dependencies

Example:
```
User --> Auth --> API --> DB
```

Means: User data flows through Auth, then to API, then to Database.

## Tips for Improvement

1. **Start with HIGH severity issues** - Fix critical problems first
2. **Focus on one area** - Complete all issues in one file/module
3. **Extract long methods** - Most common fix
4. **Reduce nesting** - Use guard clauses instead of nested if/else
5. **Remove duplicate code** - Create shared functions
6. **Use meaningful names** - Code should be self-documenting
7. **Add comments** - Explain WHY, not WHAT
8. **Write unit tests** - Improves confidence and quality score

## Next Steps

1. ✅ Run analysis on your code
2. ✅ Review the CODE_SMELLS.md report
3. ✅ Prioritize issues by severity
4. ✅ Follow the refactoring suggestions
5. ✅ Re-analyze to track improvements

## Getting Help

See detailed documentation:
- `USAGE_GUIDE.md` - Complete user guide
- `IMPLEMENTATION_GUIDE.md` - Architecture and extending
- `README.md` - Overview and features

## Example: Real-World Analysis

```bash
# Analyze the login website backend
cd /home/user/September-Release-/code-analyzer
python3 -m analyzer report /home/user/September-Release-/login-website/backend \
  --output ./login_analysis

# Results show:
# - Quality Score: 78.1/100 (Good!)
# - 7 code smells (mostly low severity)
# - 7 refactoring suggestions

# Review:
cat login_analysis/ANALYSIS_SUMMARY.md
cat login_analysis/CODE_SMELLS.md
cat login_analysis/REFACTORING_SUGGESTIONS.md
```

## Troubleshooting

**"No files analyzed"**
- Check file extensions (.py, .ts, .java, .cpp)
- Try `--recursive` flag
- Check directory path

**"Low quality score"**
- This is normal for real-world code
- Review CODE_SMELLS.md for specific issues
- Follow refactoring suggestions

**"Permission denied"**
- Ensure analyzer has read access to files
- Check file permissions

Ready to analyze? Start with:
```bash
python3 -m analyzer report ./your-project --output ./analysis
```
