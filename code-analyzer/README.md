# Intelligent Code Analysis System

A comprehensive multi-language code analysis tool that extracts insights, generates documentation, and identifies improvement opportunities.

## Features

- **Multi-Language Support**: Analyzes Java, Python, TypeScript, and C++
- **Code Extraction**: Extracts function signatures, parameters, return types
- **Complexity Metrics**: Calculates cyclomatic complexity, LOC, cognitive complexity
- **API Documentation**: Generates markdown API docs with examples
- **Architecture Diagrams**: Creates visual diagrams in Mermaid format
- **Code Smell Detection**: Identifies anti-patterns and problematic code
- **Refactoring Suggestions**: Provides actionable refactoring recommendations with code samples
- **CLI Interface**: Easy-to-use command-line tool

## Installation

```bash
pip install -r requirements.txt
```

## Usage

```bash
# Analyze a single file
python -m analyzer analyze /path/to/file.py

# Analyze a directory
python -m analyzer analyze /path/to/project --recursive

# Generate full report
python -m analyzer report /path/to/project --output ./report

# Analyze specific language
python -m analyzer analyze /path/to/file.py --language python
```

## Output

- **analysis.json**: Detailed code metrics and structure
- **API_DOCUMENTATION.md**: Generated API documentation
- **ARCHITECTURE.md**: Architecture diagram and overview
- **CODE_SMELLS.md**: Detected issues and anti-patterns
- **REFACTORING_SUGGESTIONS.md**: Refactoring recommendations

## Supported Languages

- Python (.py)
- Java (.java)
- TypeScript (.ts, .tsx)
- C++ (.cpp, .cc, .h, .hpp)
