# Multiplication Program

A simple command-line program to perform multiplication operations.

## Features

- **Multiply Two Numbers**: Quick multiplication of any two numbers
- **Multiplication Table**: Generate and display multiplication tables for any number
- **Interactive Menu**: User-friendly command-line interface

## Usage

### Running the Program

```bash
python3 multiplication.py
```

### Menu Options

1. **Multiply two numbers**: Enter two numbers to get their product
2. **View multiplication table**: Generate a multiplication table for a number with customizable rows
3. **Exit**: Quit the program

## Examples

### Option 1: Multiply Two Numbers
```
Enter your choice (1-3): 1
Enter first number: 7
Enter second number: 8
7.0 × 8.0 = 56.0
```

### Option 2: Multiplication Table
```
Enter your choice (1-3): 2
Enter a number for the multiplication table: 5
How many rows? (default 10): 5

Multiplication Table for 5:
------------------------------
5 × 1 = 5
5 × 2 = 10
5 × 3 = 15
5 × 4 = 20
5 × 5 = 25
------------------------------
```

## Functions

### `multiply(a, b)`
Multiplies two numbers and returns the result.

### `multiplication_table(number, limit=10)`
Generates a list of multiplication results for a given number.

### `print_multiplication_table(number, limit=10)`
Prints a formatted multiplication table.

### `main()`
Main interactive function with menu-driven interface.

## Requirements

- Python 3.6 or higher

## License

This program is provided as-is for educational purposes.
