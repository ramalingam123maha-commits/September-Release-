"""
Addition Program
A simple program to perform addition operations on two numbers.
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


def main():
    """Main function to run the addition program."""
    print("=== Addition Program ===")
    print()
    
    try:
        # Get first number from user
        num1 = float(input("Enter first number: "))
        
        # Get second number from user
        num2 = float(input("Enter second number: "))
        
        # Perform addition
        result = add(num1, num2)
        
        # Display result
        print()
        print(f"{num1} + {num2} = {result}")
        print()
        
    except ValueError:
        print("Error: Please enter valid numbers.")


if __name__ == "__main__":
    main()
