#!/usr/bin/env python3
import sys

def subtract(a: float, b: float) -> float:
    """Subtract b from a."""
    return a - b

def main():
    if len(sys.argv) == 3:
        try:
            num1 = float(sys.argv[1])
            num2 = float(sys.argv[2])
            result = subtract(num1, num2)
            if result.is_integer():
                result = int(result)
            print(f"{num1} - {num2} = {result}")
        except ValueError:
            print("Error: Arguments must be valid numbers.", file=sys.stderr)
            sys.exit(1)
    elif len(sys.argv) == 1:
        try:
            first = input("Enter first number: ").strip()
            second = input("Enter second number: ").strip()
            num1 = float(first)
            num2 = float(second)
            result = subtract(num1, num2)
            if result.is_integer():
                result = int(result)
            print(f"Result: {num1} - {num2} = {result}")
        except (ValueError, EOFError, KeyboardInterrupt) as e:
            if isinstance(e, ValueError):
                print("Error: Input must be a valid number.", file=sys.stderr)
            sys.exit(1)
    else:
        print("Usage: python3 subtraction.py [num1] [num2]")
        sys.exit(1)

if __name__ == "__main__":
    main()
