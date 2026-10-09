"""Utility functions for the division program."""


def validate_number(value, name="value"):
    """
    Validate that a value is a valid number.
    
    Args:
        value: The value to validate
        name (str): Name of the value for error messages
        
    Returns:
        bool: True if value is a valid number
        
    Raises:
        ValueError: If value is not a valid number
    """
    if not isinstance(value, (int, float)):
        raise ValueError(f"{name} must be a number, got {type(value).__name__}")
    if isinstance(value, bool):
        raise ValueError(f"{name} cannot be a boolean")
    return True


def parse_number_input(input_str):
    """
    Parse a string input into a number.
    
    Args:
        input_str (str): String representation of a number
        
    Returns:
        float: The parsed number
        
    Raises:
        ValueError: If the string cannot be parsed as a number
    """
    try:
        # Try integer first
        return int(input_str)
    except ValueError:
        try:
            # Try float
            return float(input_str)
        except ValueError:
            raise ValueError(f"'{input_str}' is not a valid number")


def format_result(result, decimal_places=2):
    """
    Format a division result for display.
    
    Args:
        result (float): The result to format
        decimal_places (int): Number of decimal places to show
        
    Returns:
        str: Formatted result string
    """
    if result == int(result):
        return str(int(result))
    return f"{result:.{decimal_places}f}"
