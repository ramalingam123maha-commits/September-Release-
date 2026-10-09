#!/usr/bin/env python3
"""
Simple Addition Program
This program takes user input and performs addition operations.
"""


def add(a, b):
    """
    Add two numbers and return the result.
    
    Args:
        a: First number
        b: Second number
    
    Returns:
        The sum of a and b
    """
    return a + b


def add_multiple(numbers):
    """
    Add multiple numbers together.
    
    Args:
        numbers: List of numbers to add
    
    Returns:
        The sum of all numbers
    """
    return sum(numbers)


def main():
    """Main function to run the addition program."""
    print("=== Simple Addition Program ===\n")
    
    while True:
        try:
            # Get user input
            num1 = float(input("Enter first number (or 'quit' to exit): "))
            num2 = float(input("Enter second number: "))
            
            # Perform addition
            result = add(num1, num2)
            
            # Display result
            print(f"\n{num1} + {num2} = {result}\n")
            
        except ValueError:
            print("Invalid input. Please enter valid numbers.\n")
        except KeyboardInterrupt:
            print("\nProgram terminated by user.")
            break


if __name__ == "__main__":
    main()
