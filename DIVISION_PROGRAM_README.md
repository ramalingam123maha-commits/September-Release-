# Division Program

A comprehensive Python utility for performing various division operations with error handling, support for different division types, and result analysis.

## Features

### Core Division Operations

1. **Simple Division** - Basic floating-point division
2. **Integer Division** - Floor division (quotient only)
3. **Modulo Operation** - Remainder calculation
4. **Division with Remainder** - Both quotient and remainder
5. **Decimal Division** - High-precision decimal arithmetic
6. **Safe Division** - Division with default fallback values

### Analysis Features

- **Individual Analysis** - Detailed breakdown of division operations
- **Batch Processing** - Perform multiple divisions with error handling
- **Comprehensive Metrics** - Quotient, remainder, decimal result, percentage calculations

## Usage

### Running the Interactive Program

```bash
python division_program.py
```

### Using the DivisionCalculator Class

```python
from division_program import DivisionCalculator

# Simple division
result = DivisionCalculator.simple_division(10, 3)
print(result)  # Output: 3.3333...

# Integer division
quotient = DivisionCalculator.integer_division(10, 3)
print(quotient)  # Output: 3

# Division with remainder
quotient, remainder = DivisionCalculator.division_with_remainder(10, 3)
print(f"{quotient} remainder {remainder}")  # Output: 3 remainder 1

# Decimal division with precision
result = DivisionCalculator.decimal_division(10, 3, places=4)
print(result)  # Output: 3.3333

# Safe division with default
result = DivisionCalculator.safe_division(10, 0, default=0)
print(result)  # Output: 0
```

### Using the DivisionAnalyzer Class

```python
from division_program import DivisionAnalyzer

# Analyze a single division
analysis = DivisionAnalyzer.analyze_division(100, 3)
print(analysis)
# Output: {
#     'dividend': 100,
#     'divisor': 3,
#     'quotient': 33,
#     'remainder': 1,
#     'decimal_result': 33.3333,
#     'is_exact_division': False,
#     'percentage': 3333.33
# }

# Batch division analysis
pairs = [(10, 3), (20, 4), (100, 5)]
results = DivisionAnalyzer.batch_division(pairs)
for result in results:
    print(result)
```

## Menu Options

When running the interactive program, you have the following options:

| Option | Description |
|--------|-------------|
| 1 | Simple Division - Divide two numbers (supports decimals) |
| 2 | Integer Division - Floor division returning only the quotient |
| 3 | Division with Remainder - Get both quotient and remainder |
| 4 | Decimal Division - High-precision division with configurable decimal places |
| 5 | Analyze Division - Get comprehensive analysis of a division operation |
| 6 | Batch Division - Process multiple division operations at once |
| 7 | Exit - Close the program |

## Error Handling

The program handles various error scenarios:

- **Division by Zero** - Raises `ValueError` with descriptive message
- **Invalid Input Types** - Raises `TypeError` with guidance
- **Invalid Operations** - Gracefully catches and reports errors in batch mode

## Requirements

- Python 3.6+
- No external dependencies (uses only standard library)

## Example Output

```
============================================================
Division Program - Interactive Calculator
============================================================

Options:
1. Simple Division
2. Integer Division
3. Division with Remainder
4. Decimal Division
5. Analyze Division
6. Batch Division
7. Exit

Enter your choice (1-7): 5
Enter dividend: 100
Enter divisor: 3

========================================
Division Analysis
========================================
Dividend: 100
Divisor: 3
Quotient: 33
Remainder: 1
Decimal Result: 33.3333
Is Exact Division: False
Percentage: 3333.33
========================================
```

## Class Structure

### DivisionCalculator
Static methods for performing various division operations:
- `simple_division(dividend, divisor)` - Basic division
- `integer_division(dividend, divisor)` - Floor division
- `modulo_operation(dividend, divisor)` - Remainder
- `division_with_remainder(dividend, divisor)` - Quotient + remainder
- `decimal_division(dividend, divisor, places)` - High-precision
- `safe_division(dividend, divisor, default)` - Safe with fallback

### DivisionAnalyzer
Methods for analyzing division results:
- `analyze_division(dividend, divisor)` - Detailed analysis
- `batch_division(pairs)` - Multiple divisions with error handling

## Author Notes

This division program demonstrates:
- Clean object-oriented design
- Comprehensive error handling
- Type hints for better code documentation
- Support for high-precision arithmetic
- Interactive CLI interface
- Batch processing capabilities
