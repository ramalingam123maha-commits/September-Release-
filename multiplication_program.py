#!/usr/bin/env python3
"""
Multiplication Program
A simple program to perform multiplication operations with user input validation.
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


def get_number(prompt):
    """
    Get a number from user input with validation.
    
    Args:
        prompt: Message to display to the user
    
    Returns:
        The validated number (int or float)
    """
    while True:
        try:
            user_input = input(prompt)
            return float(user_input) if '.' in user_input else int(user_input)
        except ValueError:
            print("Error: Please enter a valid number.")


def main():
    """Main function to run the multiplication program."""
    print("=" * 50)
    print("Welcome to the Multiplication Program!")
    print("=" * 50)
    
    while True:
        try:
            # Get input from user
            num1 = get_number("Enter the first number: ")
            num2 = get_number("Enter the second number: ")
            
            # Perform multiplication
            result = multiply(num1, num2)
            
            # Display result
            print(f"\n{num1} × {num2} = {result}")
            print("-" * 50)
            
            # Ask if user wants to continue
            continue_choice = input("\nDo you want to perform another multiplication? (yes/no): ").strip().lower()
            if continue_choice not in ['yes', 'y']:
                print("\nThank you for using the Multiplication Program!")
                break
            print()
        
        except KeyboardInterrupt:
            print("\n\nProgram interrupted by user.")
            break


if __name__ == "__main__":
    main()
