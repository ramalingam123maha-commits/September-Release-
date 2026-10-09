"""Core division calculator module."""


class DivisionError(Exception):
    """Custom exception for division-related errors."""
    pass


def divide(dividend, divisor):
    """
    Perform basic division operation.
    
    Args:
        dividend (int, float): The number to be divided
        divisor (int, float): The number to divide by
        
    Returns:
        float: The result of division
        
    Raises:
        DivisionError: If divisor is zero or inputs are invalid
    """
    if not isinstance(dividend, (int, float)):
        raise DivisionError(f"Dividend must be a number, got {type(dividend).__name__}")
    if not isinstance(divisor, (int, float)):
        raise DivisionError(f"Divisor must be a number, got {type(divisor).__name__}")
    
    if divisor == 0:
        raise DivisionError("Cannot divide by zero")
    
    return dividend / divisor


def safe_divide(dividend, divisor, default=None):
    """
    Perform division with error handling, returning a default value on error.
    
    Args:
        dividend (int, float): The number to be divided
        divisor (int, float): The number to divide by
        default: Value to return if division fails (default: None)
        
    Returns:
        float or default: The result of division, or default value if error occurs
    """
    try:
        return divide(dividend, divisor)
    except DivisionError:
        return default


def batch_divide(operations, skip_errors=False):
    """
    Perform multiple division operations in batch.
    
    Args:
        operations (list): List of tuples containing (dividend, divisor) pairs
        skip_errors (bool): If True, skip failed operations; if False, raise on first error
        
    Returns:
        list: List of division results
        
    Raises:
        DivisionError: If skip_errors is False and an operation fails
        
    Examples:
        >>> batch_divide([(10, 2), (15, 3), (20, 4)])
        [5.0, 5.0, 5.0]
    """
    if not operations:
        raise DivisionError("Operations list cannot be empty")
    
    results = []
    for i, (dividend, divisor) in enumerate(operations):
        try:
            result = divide(dividend, divisor)
            results.append(result)
        except DivisionError as e:
            if skip_errors:
                results.append(None)
            else:
                raise DivisionError(f"Error in operation {i}: {str(e)}")
    
    return results


def integer_divide(dividend, divisor):
    """
    Perform integer division (floor division).
    
    Args:
        dividend (int, float): The number to be divided
        divisor (int, float): The number to divide by
        
    Returns:
        int: The integer result of division
        
    Raises:
        DivisionError: If divisor is zero or inputs are invalid
    """
    result = divide(dividend, divisor)
    return int(result)
