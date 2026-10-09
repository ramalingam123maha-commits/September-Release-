# Java Addition Program

A simple Java program that performs addition of two numbers.

## Features

- Accepts user input for two numbers
- Performs addition operation
- Displays the result in a formatted manner
- Supports both integer and decimal numbers

## Files

- `Addition.java` - Main Java source file containing the addition program

## How to Compile

```bash
javac Addition.java
```

This generates the `Addition.class` file.

## How to Run

```bash
java Addition
```

## Example Usage

```
=== Simple Addition Program ===

Enter the first number: 15
Enter the second number: 25

Result: 15.0 + 25.0 = 40.0
```

## Program Structure

- **main()** - Entry point that handles user input and displays output
- **add()** - Helper method that performs the actual addition calculation

## Input Requirements

- First number: Any real number (integer or decimal)
- Second number: Any real number (integer or decimal)

## Notes

- The program uses `Scanner` class for user input
- Results are displayed as floating-point numbers
- The program uses the `Scanner.close()` method to release system resources
