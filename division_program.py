#!/usr/bin/env python3
"""
Division Program
A comprehensive utility for performing division operations with error handling,
support for different division types, and result analysis.
"""

import sys
from typing import Union, Tuple, Optional
from decimal import Decimal, ROUND_HALF_UP, DivisionByZero, InvalidOperation


class DivisionCalculator:
    """A calculator class for performing various division operations."""

    @staticmethod
    def simple_division(dividend: Union[int, float], divisor: Union[int, float]) -> Union[int, float]:
        """
        Perform simple division of two numbers.

        Args:
            dividend: The number to be divided
            divisor: The number to divide by

        Returns:
            The result of dividend / divisor

        Raises:
            ValueError: If divisor is zero
            TypeError: If inputs are not numbers
        """
        if not isinstance(dividend, (int, float)) or not isinstance(divisor, (int, float)):
            raise TypeError("Both dividend and divisor must be numbers")

        if divisor == 0:
            raise ValueError("Cannot divide by zero")

        return dividend / divisor

    @staticmethod
    def integer_division(dividend: int, divisor: int) -> int:
        """
        Perform integer division (floor division).

        Args:
            dividend: The number to be divided
            divisor: The number to divide by

        Returns:
            The integer result of dividend // divisor

        Raises:
            ValueError: If divisor is zero
            TypeError: If inputs are not integers
        """
        if not isinstance(dividend, int) or not isinstance(divisor, int):
            raise TypeError("Both dividend and divisor must be integers")

        if divisor == 0:
            raise ValueError("Cannot divide by zero")

        return dividend // divisor

    @staticmethod
    def modulo_operation(dividend: int, divisor: int) -> int:
        """
        Perform modulo operation (remainder after division).

        Args:
            dividend: The number to be divided
            divisor: The number to divide by

        Returns:
            The remainder of dividend % divisor

        Raises:
            ValueError: If divisor is zero
            TypeError: If inputs are not integers
        """
        if not isinstance(dividend, int) or not isinstance(divisor, int):
            raise TypeError("Both dividend and divisor must be integers")

        if divisor == 0:
            raise ValueError("Cannot divide by zero")

        return dividend % divisor

    @staticmethod
    def division_with_remainder(dividend: int, divisor: int) -> Tuple[int, int]:
        """
        Perform division and return both quotient and remainder.

        Args:
            dividend: The number to be divided
            divisor: The number to divide by

        Returns:
            A tuple of (quotient, remainder)

        Raises:
            ValueError: If divisor is zero
            TypeError: If inputs are not integers
        """
        if not isinstance(dividend, int) or not isinstance(divisor, int):
            raise TypeError("Both dividend and divisor must be integers")

        if divisor == 0:
            raise ValueError("Cannot divide by zero")

        quotient = dividend // divisor
        remainder = dividend % divisor
        return (quotient, remainder)

    @staticmethod
    def decimal_division(dividend: Union[int, float, str], divisor: Union[int, float, str], 
                        places: int = 2) -> Decimal:
        """
        Perform precise decimal division using Decimal for better precision.

        Args:
            dividend: The number to be divided
            divisor: The number to divide by
            places: Number of decimal places to round to

        Returns:
            The precise result as a Decimal object

        Raises:
            ValueError: If divisor is zero
            InvalidOperation: If conversion to Decimal fails
        """
        try:
            dec_dividend = Decimal(str(dividend))
            dec_divisor = Decimal(str(divisor))

            if dec_divisor == 0:
                raise ValueError("Cannot divide by zero")

            result = dec_dividend / dec_divisor
            if places >= 0:
                quantize_str = '0.' + '0' * places if places > 0 else '1'
                result = result.quantize(Decimal(quantize_str), rounding=ROUND_HALF_UP)

            return result
        except InvalidOperation as e:
            raise InvalidOperation(f"Cannot convert inputs to Decimal: {e}")

    @staticmethod
    def safe_division(dividend: Union[int, float], divisor: Union[int, float], 
                     default: Union[int, float] = 0) -> Union[int, float]:
        """
        Perform division with a default value if division by zero occurs.

        Args:
            dividend: The number to be divided
            divisor: The number to divide by
            default: The value to return if division by zero occurs

        Returns:
            The result of dividend / divisor, or default if divisor is zero
        """
        if divisor == 0:
            return default
        return dividend / divisor


class DivisionAnalyzer:
    """Analyze division results and provide insights."""

    @staticmethod
    def analyze_division(dividend: int, divisor: int) -> dict:
        """
        Analyze a division operation and provide comprehensive results.

        Args:
            dividend: The number to be divided
            divisor: The number to divide by

        Returns:
            A dictionary containing various division metrics

        Raises:
            ValueError: If divisor is zero
        """
        if divisor == 0:
            raise ValueError("Cannot divide by zero")

        calculator = DivisionCalculator()
        quotient, remainder = calculator.division_with_remainder(dividend, divisor)
        decimal_result = calculator.decimal_division(dividend, divisor, places=4)

        return {
            'dividend': dividend,
            'divisor': divisor,
            'quotient': quotient,
            'remainder': remainder,
            'decimal_result': float(decimal_result),
            'is_exact_division': remainder == 0,
            'percentage': float((Decimal(dividend) / Decimal(divisor) * 100).quantize(
                Decimal('0.01'), rounding=ROUND_HALF_UP)),
        }

    @staticmethod
    def batch_division(pairs: list) -> list:
        """
        Perform division on multiple pairs of numbers.

        Args:
            pairs: List of tuples (dividend, divisor)

        Returns:
            List of division results
        """
        analyzer = DivisionAnalyzer()
        results = []

        for dividend, divisor in pairs:
            try:
                result = analyzer.analyze_division(dividend, divisor)
                results.append(result)
            except ValueError as e:
                results.append({
                    'dividend': dividend,
                    'divisor': divisor,
                    'error': str(e)
                })

        return results


def main():
    """Main function to demonstrate the division program."""
    print("=" * 60)
    print("Division Program - Interactive Calculator")
    print("=" * 60)

    while True:
        print("\nOptions:")
        print("1. Simple Division")
        print("2. Integer Division")
        print("3. Division with Remainder")
        print("4. Decimal Division")
        print("5. Analyze Division")
        print("6. Batch Division")
        print("7. Exit")

        choice = input("\nEnter your choice (1-7): ").strip()

        try:
            if choice == '1':
                dividend = float(input("Enter dividend: "))
                divisor = float(input("Enter divisor: "))
                result = DivisionCalculator.simple_division(dividend, divisor)
                print(f"\nResult: {dividend} / {divisor} = {result}")

            elif choice == '2':
                dividend = int(input("Enter dividend: "))
                divisor = int(input("Enter divisor: "))
                result = DivisionCalculator.integer_division(dividend, divisor)
                print(f"\nResult: {dividend} // {divisor} = {result}")

            elif choice == '3':
                dividend = int(input("Enter dividend: "))
                divisor = int(input("Enter divisor: "))
                quotient, remainder = DivisionCalculator.division_with_remainder(dividend, divisor)
                print(f"\nResult: {dividend} / {divisor} = {quotient} remainder {remainder}")
                print(f"Verification: {quotient} * {divisor} + {remainder} = {quotient * divisor + remainder}")

            elif choice == '4':
                dividend = input("Enter dividend: ")
                divisor = input("Enter divisor: ")
                places = int(input("Enter decimal places (default 2): ") or "2")
                result = DivisionCalculator.decimal_division(dividend, divisor, places)
                print(f"\nResult: {dividend} / {divisor} = {result}")

            elif choice == '5':
                dividend = int(input("Enter dividend: "))
                divisor = int(input("Enter divisor: "))
                analysis = DivisionAnalyzer.analyze_division(dividend, divisor)
                print("\n" + "=" * 40)
                print("Division Analysis")
                print("=" * 40)
                for key, value in analysis.items():
                    print(f"{key.replace('_', ' ').title()}: {value}")
                print("=" * 40)

            elif choice == '6':
                num_pairs = int(input("How many pairs do you want to divide? "))
                pairs = []
                for i in range(num_pairs):
                    dividend = int(input(f"Pair {i+1} - Enter dividend: "))
                    divisor = int(input(f"Pair {i+1} - Enter divisor: "))
                    pairs.append((dividend, divisor))

                results = DivisionAnalyzer.batch_division(pairs)
                print("\n" + "=" * 40)
                print("Batch Division Results")
                print("=" * 40)
                for i, result in enumerate(results, 1):
                    print(f"\nPair {i}:")
                    for key, value in result.items():
                        print(f"  {key.replace('_', ' ').title()}: {value}")
                print("=" * 40)

            elif choice == '7':
                print("\nThank you for using the Division Program!")
                sys.exit(0)

            else:
                print("Invalid choice. Please enter a number between 1 and 7.")

        except ValueError as e:
            print(f"Error: {e}")
        except TypeError as e:
            print(f"Error: {e}")
        except Exception as e:
            print(f"Unexpected error: {e}")


if __name__ == "__main__":
    main()
