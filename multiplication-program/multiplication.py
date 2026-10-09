#!/usr/bin/env python3
"""
Multiplication Program
A simple program to perform multiplication operations with user input.
"""


def multiply(a, b):
    """
    Multiply two numbers.
    
    Args:
        a: First number
        b: Second number
    
    Returns:
        The product of a and b
    """
    return a * b


def multiplication_table(number, limit=10):
    """
    Generate a multiplication table for a given number.
    
    Args:
        number: The number to generate the table for
        limit: How many rows to generate (default: 10)
    
    Returns:
        A list of multiplication results
    """
    table = []
    for i in range(1, limit + 1):
        table.append(multiply(number, i))
    return table


def print_multiplication_table(number, limit=10):
    """
    Print a formatted multiplication table.
    
    Args:
        number: The number to generate the table for
        limit: How many rows to generate (default: 10)
    """
    print(f"\nMultiplication Table for {number}:")
    print("-" * 30)
    for i in range(1, limit + 1):
        result = multiply(number, i)
        print(f"{number} × {i} = {result}")
    print("-" * 30)


def main():
    """Main function to run the multiplication program."""
    print("Welcome to the Multiplication Program!")
    print("=" * 40)
    
    while True:
        try:
            print("\nChoose an option:")
            print("1. Multiply two numbers")
            print("2. View multiplication table")
            print("3. Exit")
            
            choice = input("\nEnter your choice (1-3): ").strip()
            
            if choice == "1":
                num1 = float(input("Enter first number: "))
                num2 = float(input("Enter second number: "))
                result = multiply(num1, num2)
                print(f"\n{num1} × {num2} = {result}")
            
            elif choice == "2":
                number = int(input("Enter a number for the multiplication table: "))
                limit = int(input("How many rows? (default 10): ") or "10")
                print_multiplication_table(number, limit)
            
            elif choice == "3":
                print("\nThank you for using the Multiplication Program!")
                break
            
            else:
                print("Invalid choice. Please enter 1, 2, or 3.")
        
        except ValueError:
            print("Invalid input. Please enter valid numbers.")
        except KeyboardInterrupt:
            print("\n\nProgram interrupted by user.")
            break


if __name__ == "__main__":
    main()
