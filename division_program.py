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
        Perform modulo operation to get remainder.

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
        return quotient, remainder

    @staticmethod
    def decimal_division(dividend: Union[int, float], divisor: Union[int, float], places: int = 4) -> Decimal:
        """
        Perform high-precision decimal division.

        Args:
            dividend: The number to be divided
            divisor: The number to divide by
            places: Number of decimal places to round to (default: 4)

        Returns:
            Decimal result rounded to specified places

        Raises:
            ValueError: If divisor is zero
            TypeError: If inputs are not numbers
        """
        if not isinstance(dividend, (int, float)) or not isinstance(divisor, (int, float)):
            raise TypeError("Both dividend and divisor must be numbers")

        if divisor == 0:
            raise ValueError("Cannot divide by zero")

        if places < 0:
            raise ValueError("Number of places must be non-negative")

        dividend_dec = Decimal(str(dividend))
        divisor_dec = Decimal(str(divisor))

        try:
            result = dividend_dec / divisor_dec
            quantize_str = Decimal(10) ** -places
            return result.quantize(quantize_str, rounding=ROUND_HALF_UP)
        except (InvalidOperation, DivisionByZero) as e:
            raise ValueError(f"Decimal division error: {e}")

    @staticmethod
    def safe_division(dividend: Union[int, float], divisor: Union[int, float], default: Union[int, float] = 0) -> Union[int, float]:
        """
        Perform safe division with default fallback value.

        Args:
            dividend: The number to be divided
            divisor: The number to divide by
            default: Default value to return if division fails (default: 0)

        Returns:
            The result of dividend / divisor, or default if division fails
        """
        try:
            if not isinstance(dividend, (int, float)) or not isinstance(divisor, (int, float)):
                return default

            if divisor == 0:
                return default

            return dividend / divisor
        except Exception:
            return default


class DivisionAnalyzer:
    """A class for analyzing division operations."""

    @staticmethod
    def analyze_division(dividend: int, divisor: int, decimal_places: int = 4) -> dict:
        """
        Analyze a division operation in detail.

        Args:
            dividend: The number to be divided
            divisor: The number to divide by
            decimal_places: Number of decimal places for decimal result

        Returns:
            Dictionary containing detailed analysis of the division

        Raises:
            ValueError: If divisor is zero
            TypeError: If inputs are not integers
        """
        if not isinstance(dividend, int) or not isinstance(divisor, int):
            raise TypeError("Both dividend and divisor must be integers")

        if divisor == 0:
            raise ValueError("Cannot divide by zero")

        quotient, remainder = DivisionCalculator.division_with_remainder(dividend, divisor)
        decimal_result = DivisionCalculator.decimal_division(dividend, divisor, decimal_places)
        is_exact = remainder == 0
        percentage = (dividend / divisor * 100) if divisor != 0 else 0

        return {
            'dividend': dividend,
            'divisor': divisor,
            'quotient': quotient,
            'remainder': remainder,
            'decimal_result': float(decimal_result),
            'is_exact_division': is_exact,
            'percentage': round(percentage, 2),
            'analysis': f"{dividend} ÷ {divisor} = {quotient} remainder {remainder} ({float(decimal_result)})"
        }

    @staticmethod
    def batch_division(operations: list) -> dict:
        """
        Perform multiple division operations and return results.

        Args:
            operations: List of tuples (dividend, divisor)

        Returns:
            Dictionary with results and summary

        Raises:
            TypeError: If operations is not a list
        """
        if not isinstance(operations, list):
            raise TypeError("Operations must be a list of tuples")

        results = []
        errors = []

        for i, (dividend, divisor) in enumerate(operations):
            try:
                analysis = DivisionAnalyzer.analyze_division(dividend, divisor)
                results.append(analysis)
            except (ValueError, TypeError) as e:
                errors.append({
                    'operation_index': i,
                    'dividend': dividend,
                    'divisor': divisor,
                    'error': str(e)
                })

        return {
            'total_operations': len(operations),
            'successful': len(results),
            'failed': len(errors),
            'results': results,
            'errors': errors
        }


def interactive_menu():
    """Display interactive menu for division operations."""
    calculator = DivisionCalculator()
    analyzer = DivisionAnalyzer()

    while True:
        print("\n" + "=" * 60)
        print("Division Program - Interactive Calculator")
        print("=" * 60)
        print("\nOptions:")
        print("1. Simple Division")
        print("2. Integer Division")
        print("3. Division with Remainder")
        print("4. Decimal Division")
        print("5. Analyze Division")
        print("6. Batch Division")
        print("7. Exit")
        print()

        choice = input("Enter your choice (1-7): ").strip()

        try:
            if choice == '1':
                dividend = float(input("Enter dividend: "))
                divisor = float(input("Enter divisor: "))
                result = calculator.simple_division(dividend, divisor)
                print(f"\nResult: {dividend} / {divisor} = {result}")

            elif choice == '2':
                dividend = int(input("Enter dividend: "))
                divisor = int(input("Enter divisor: "))
                result = calculator.integer_division(dividend, divisor)
                print(f"\nResult: {dividend} // {divisor} = {result}")

            elif choice == '3':
                dividend = int(input("Enter dividend: "))
                divisor = int(input("Enter divisor: "))
                quotient, remainder = calculator.division_with_remainder(dividend, divisor)
                print(f"\nResult: {dividend} ÷ {divisor} = {quotient} remainder {remainder}")

            elif choice == '4':
                dividend = float(input("Enter dividend: "))
                divisor = float(input("Enter divisor: "))
                places = int(input("Enter decimal places (default 4): ") or "4")
                result = calculator.decimal_division(dividend, divisor, places)
                print(f"\nResult: {dividend} / {divisor} = {result}")

            elif choice == '5':
                dividend = int(input("Enter dividend: "))
                divisor = int(input("Enter divisor: "))
                analysis = analyzer.analyze_division(dividend, divisor)
                print("\n--- Division Analysis ---")
                for key, value in analysis.items():
                    print(f"{key}: {value}")

            elif choice == '6':
                print("\nEnter division operations (format: dividend divisor, one per line)")
                print("Type 'done' when finished:")
                operations = []
                while True:
                    line = input().strip()
                    if line.lower() == 'done':
                        break
                    try:
                        parts = line.split()
                        if len(parts) == 2:
                            dividend, divisor = int(parts[0]), int(parts[1])
                            operations.append((dividend, divisor))
                    except ValueError:
                        print("Invalid input. Please enter two integers separated by space.")

                if operations:
                    results = analyzer.batch_division(operations)
                    print("\n--- Batch Division Results ---")
                    print(f"Total: {results['total_operations']}, Successful: {results['successful']}, Failed: {results['failed']}")
                    for result in results['results']:
                        print(f"  {result['analysis']}")
                    for error in results['errors']:
                        print(f"  Error at index {error['operation_index']}: {error['error']}")

            elif choice == '7':
                print("\nThank you for using the Division Program!")
                break

            else:
                print("\nInvalid choice. Please enter a number between 1 and 7.")

        except ValueError as e:
            print(f"\nError: {e}")
        except Exception as e:
            print(f"\nUnexpected error: {e}")


if __name__ == "__main__":
    interactive_menu()
