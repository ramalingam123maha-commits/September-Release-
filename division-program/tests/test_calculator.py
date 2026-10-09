"""Unit tests for the calculator module."""

import pytest
from division_program.calculator import (
    divide, 
    safe_divide, 
    batch_divide, 
    integer_divide,
    DivisionError
)


class TestDivide:
    """Tests for the divide function."""
    
    def test_basic_division(self):
        """Test basic division operation."""
        assert divide(10, 2) == 5.0
        assert divide(15, 3) == 5.0
        assert divide(20, 4) == 5.0
    
    def test_division_with_floats(self):
        """Test division with floating point numbers."""
        assert divide(10.5, 2.5) == pytest.approx(4.2)
        assert divide(7, 2) == 3.5
    
    def test_division_by_zero(self):
        """Test that division by zero raises an error."""
        with pytest.raises(DivisionError, match="Cannot divide by zero"):
            divide(10, 0)
    
    def test_invalid_dividend(self):
        """Test that non-numeric dividend raises an error."""
        with pytest.raises(DivisionError, match="Dividend must be a number"):
            divide("10", 2)
    
    def test_invalid_divisor(self):
        """Test that non-numeric divisor raises an error."""
        with pytest.raises(DivisionError, match="Divisor must be a number"):
            divide(10, "2")
    
    def test_division_with_negative_numbers(self):
        """Test division with negative numbers."""
        assert divide(-10, 2) == -5.0
        assert divide(10, -2) == -5.0
        assert divide(-10, -2) == 5.0


class TestSafeDivide:
    """Tests for the safe_divide function."""
    
    def test_safe_divide_success(self):
        """Test safe division when operation succeeds."""
        assert safe_divide(10, 2) == 5.0
    
    def test_safe_divide_by_zero(self):
        """Test safe division with zero divisor returns default."""
        assert safe_divide(10, 0) is None
        assert safe_divide(10, 0, default=0) == 0
        assert safe_divide(10, 0, default=-1) == -1
    
    def test_safe_divide_invalid_input(self):
        """Test safe division with invalid input returns default."""
        assert safe_divide("10", 2) is None
        assert safe_divide(10, "2", default=0) == 0


class TestBatchDivide:
    """Tests for the batch_divide function."""
    
    def test_batch_divide_success(self):
        """Test batch division with valid operations."""
        results = batch_divide([(10, 2), (15, 3), (20, 4)])
        assert results == [5.0, 5.0, 5.0]
    
    def test_batch_divide_empty(self):
        """Test that empty operations list raises an error."""
        with pytest.raises(DivisionError, match="Operations list cannot be empty"):
            batch_divide([])
    
    def test_batch_divide_with_error_raise(self):
        """Test batch division with error raises when skip_errors is False."""
        with pytest.raises(DivisionError, match="Error in operation 1"):
            batch_divide([(10, 2), (10, 0), (20, 4)])
    
    def test_batch_divide_with_error_skip(self):
        """Test batch division skipping errors."""
        results = batch_divide([(10, 2), (10, 0), (20, 4)], skip_errors=True)
        assert results == [5.0, None, 5.0]
    
    def test_batch_divide_single_operation(self):
        """Test batch division with a single operation."""
        results = batch_divide([(10, 2)])
        assert results == [5.0]


class TestIntegerDivide:
    """Tests for the integer_divide function."""
    
    def test_integer_divide(self):
        """Test integer division."""
        assert integer_divide(10, 2) == 5
        assert integer_divide(15, 3) == 5
    
    def test_integer_divide_with_remainder(self):
        """Test integer division with remainder."""
        assert integer_divide(10, 3) == 3
        assert integer_divide(7, 2) == 3
    
    def test_integer_divide_by_zero(self):
        """Test that integer division by zero raises an error."""
        with pytest.raises(DivisionError):
            integer_divide(10, 0)
