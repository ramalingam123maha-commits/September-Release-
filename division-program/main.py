"""Main entry point for the division program."""

import sys
import argparse
from division_program.calculator import divide, batch_divide, DivisionError
from division_program.utils import parse_number_input, format_result


def main():
    """Parse command line arguments and execute division operations."""
    # Handle simple case: python main.py 10 2
    if len(sys.argv) == 3 and sys.argv[1] not in ["-h", "--help", "divide", "batch"]:
        try:
            dividend = parse_number_input(sys.argv[1])
            divisor = parse_number_input(sys.argv[2])
            result = divide(dividend, divisor)
            print(f"{dividend} / {divisor} = {format_result(result)}")
        except (ValueError, DivisionError) as e:
            print(f"Error: {e}", file=sys.stderr)
            sys.exit(1)
        return
    
    parser = argparse.ArgumentParser(
        description="Perform division operations with error handling"
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Simple division command
    simple_parser = subparsers.add_parser("divide", help="Perform simple division")
    simple_parser.add_argument("dividend", type=str, help="The number to be divided")
    simple_parser.add_argument("divisor", type=str, help="The number to divide by")
    simple_parser.add_argument(
        "--decimals", 
        type=int, 
        default=2, 
        help="Number of decimal places to display"
    )
    
    # Batch division command
    batch_parser = subparsers.add_parser("batch", help="Perform batch division")
    batch_parser.add_argument(
        "operations", 
        type=str, 
        help="Batch operations as JSON list of [dividend, divisor] pairs"
    )
    batch_parser.add_argument(
        "--skip-errors",
        action="store_true",
        help="Skip operations that fail instead of stopping"
    )
    
    args = parser.parse_args()
    
    if args.command == "divide":
        handle_simple_division(args)
    elif args.command == "batch":
        handle_batch_division(args)
    else:
        parser.print_help()


def handle_simple_division(args):
    """Handle simple division operation."""
    try:
        dividend = parse_number_input(args.dividend)
        divisor = parse_number_input(args.divisor)
        result = divide(dividend, divisor)
        formatted = format_result(result, args.decimals)
        print(f"{dividend} / {divisor} = {formatted}")
    except (ValueError, DivisionError) as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


def handle_batch_division(args):
    """Handle batch division operations."""
    try:
        import json
        operations = json.loads(args.operations)
        
        if not isinstance(operations, list):
            raise ValueError("Operations must be a JSON list")
        
        results = batch_divide(operations, skip_errors=args.skip_errors)
        
        for i, (dividend, divisor) in enumerate(operations):
            result = results[i]
            if result is None:
                print(f"Operation {i}: {dividend} / {divisor} = ERROR")
            else:
                print(f"Operation {i}: {dividend} / {divisor} = {format_result(result)}")
    
    except (ValueError, DivisionError, json.JSONDecodeError) as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
