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
#     'percentage': 3333.33,
#     'analysis': '100 ÷ 3 = 33 remainder 1 (33.3333)'
# }

# Batch process multiple divisions
operations = [(10, 3), (20, 4), (15, 5)]
results = DivisionAnalyzer.batch_division(operations)
print(results)
```

## Class Reference

### DivisionCalculator

#### Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `simple_division()` | dividend, divisor | float | Basic division |
| `integer_division()` | dividend, divisor | int | Floor division |
| `modulo_operation()` | dividend, divisor | int | Remainder only |
| `division_with_remainder()` | dividend, divisor | Tuple[int, int] | Quotient and remainder |
| `decimal_division()` | dividend, divisor, places | Decimal | High-precision result |
| `safe_division()` | dividend, divisor, default | float/int | Safe division with fallback |

### DivisionAnalyzer

#### Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `analyze_division()` | dividend, divisor, decimal_places | dict | Detailed analysis |
| `batch_division()` | operations (list of tuples) | dict | Multiple operations |

## Error Handling

The program handles the following error cases:

- **Division by Zero** - Raises ValueError or returns default value
- **Type Errors** - Raises TypeError for invalid input types
- **Invalid Precision** - Validates decimal places parameter
- **Batch Errors** - Continues processing and reports errors separately

## Examples

### Example 1: Simple Division
```python
>>> from division_program import DivisionCalculator
>>> DivisionCalculator.simple_division(10, 3)
3.3333333333333335
```

### Example 2: Division with Remainder
```python
>>> quotient, remainder = DivisionCalculator.division_with_remainder(17, 5)
>>> print(f"{quotient} R {remainder}")
3 R 2
```

### Example 3: Batch Processing
```python
>>> from division_program import DivisionAnalyzer
>>> ops = [(100, 4), (50, 3), (75, 5)]
>>> results = DivisionAnalyzer.batch_division(ops)
>>> print(f"Processed: {results['successful']} / {results['total_operations']}")
Processed: 3 / 3
```

## Requirements

- Python 3.6+
- No external dependencies

## Installation

Simply copy `division_program.py` to your project directory.

## License

This utility is provided as-is for educational and practical use.
