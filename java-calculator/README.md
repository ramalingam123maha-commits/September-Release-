# Java Calculator Program

A comprehensive calculator program written in Java that supports multiple arithmetic operations with comprehensive error handling and unit tests.

## Features

- **Basic Operations**: Addition, Subtraction, Multiplication, Division
- **Advanced Operations**: Modulo, Power, Square Root
- **Error Handling**: Division by zero protection, negative square root validation
- **Input Validation**: Comprehensive error messages
- **Unit Tests**: Full test suite with 20+ test cases

## Operations Supported

| Operation | Method | Example |
|-----------|--------|---------|
| Addition | `add(a, b)` | `add(5, 3)` → 8 |
| Subtraction | `subtract(a, b)` | `subtract(10, 3)` → 7 |
| Multiplication | `multiply(a, b)` | `multiply(4, 5)` → 20 |
| Division | `divide(a, b)` | `divide(20, 4)` → 5 |
| Modulo | `modulo(a, b)` | `modulo(10, 3)` → 1 |
| Power | `power(base, exp)` | `power(2, 3)` → 8 |
| Square Root | `squareRoot(num)` | `squareRoot(25)` → 5 |

## Files

- **Calculator.java** - Main calculator class with all arithmetic operations
- **CalculatorTest.java** - Comprehensive unit test suite
- **README.md** - Documentation (this file)

## How to Use

### Compiling the Program

```bash
javac Calculator.java
javac CalculatorTest.java
```

### Running the Calculator

```bash
java Calculator
```

This will display a demonstration of all calculator operations.

### Running the Tests

```bash
java CalculatorTest
```

This will run all unit tests and display a summary of passed/failed tests.

## Example Output

```
=== Java Calculator ===

Testing with numbers: 20.0 and 5.0
Addition: 20.0 + 5.0 = 25.0
Subtraction: 20.0 - 5.0 = 15.0
Multiplication: 20.0 * 5.0 = 100.0
Division: 20.0 / 5.0 = 4.0
Modulo: 20.0 % 5.0 = 0.0
Power: 20.0 ^ 5.0 = 3200000.0
Square Root: √20.0 = 4.47213595499958

=== Additional Tests ===
Testing with decimals: 15.5 and 3.2
Addition: 15.5 + 3.2 = 18.7
Division: 15.5 / 3.2 = 4.84375

=== Error Handling Test ===
Attempting division by zero...
Error caught: Division by zero is not allowed
Attempting square root of negative number...
Error caught: Cannot calculate square root of negative numbers

Calculator operations completed successfully!
```

## Error Handling

The calculator includes robust error handling:

- **Division by Zero**: Throws `ArithmeticException` with message "Division by zero is not allowed"
- **Modulo by Zero**: Throws `ArithmeticException` with message "Modulo by zero is not allowed"
- **Negative Square Root**: Throws `ArithmeticException` with message "Cannot calculate square root of negative numbers"

## Technical Details

- Written in **Java** (JDK 8+)
- Uses **static methods** for all operations
- Supports **double precision** floating-point arithmetic
- Includes comprehensive **Javadoc comments**
- Full **unit test coverage** with 20+ test cases

## Testing

The test suite includes:
- Addition tests (4 test cases)
- Subtraction tests (4 test cases)
- Multiplication tests (5 test cases)
- Division tests (4 test cases)
- Division by zero validation (1 test case)
- Modulo tests (3 test cases)
- Modulo by zero validation (1 test case)
- Power tests (4 test cases)
- Square root tests (4 test cases)
- Negative square root validation (1 test case)

**Total: 31 test cases**

## Author

Created with Java best practices including error handling, comprehensive documentation, and thorough testing.
