# Division Program

A Python utility program that performs mathematical division operations with comprehensive error handling and validation.

## Features

- Perform basic division operations
- Handle edge cases (division by zero, invalid inputs)
- Support for integer and floating-point division
- Batch division operations
- Comprehensive error messages

## Project Structure

```
division-program/
├── README.md                 # This file
├── requirements.txt          # Python dependencies
├── division_program/         # Main package
│   ├── __init__.py
│   ├── calculator.py         # Core division logic
│   └── utils.py              # Utility functions
├── tests/                    # Test suite
│   ├── __init__.py
│   ├── test_calculator.py    # Unit tests
│   └── test_utils.py         # Utility tests
└── main.py                   # Entry point
```

## Usage

### Basic Division

```python
from division_program.calculator import divide

result = divide(10, 2)
print(result)  # Output: 5.0
```

### Batch Operations

```python
from division_program.calculator import batch_divide

results = batch_divide([(10, 2), (15, 3), (20, 4)])
print(results)  # Output: [5.0, 5.0, 5.0]
```

### Command Line

```bash
python main.py 10 2
python main.py --batch "[(10,2), (15,3), (20,4)]"
```

## Error Handling

The program handles:
- Division by zero
- Non-numeric inputs
- Invalid operation types
- Empty batch operations

## Installation

```bash
pip install -r requirements.txt
```

## Testing

```bash
python -m pytest tests/
```

## License

MIT
