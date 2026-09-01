#!/usr/bin/env python3
"""Simple addition program"""

def add(a, b):
    """Add two numbers and return the result"""
    return a + b


def main():
    """Main function to perform addition"""
    print("Welcome to the Addition Program!")
    
    try:
        num1 = float(input("Enter first number: "))
        num2 = float(input("Enter second number: "))
        
        result = add(num1, num2)
        print(f"{num1} + {num2} = {result}")
        
    except ValueError:
        print("Error: Please enter valid numbers")


if __name__ == "__main__":
    main()
