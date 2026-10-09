"""Unit tests for the utils module."""

import pytest
from division_program.utils import (
    validate_number,
    parse_number_input,
    format_result
)


class TestValidateNumber:
    """Tests for the validate_number function."""
    
    def test_validate_integer(self):
        """Test validation of integer numbers."""
        assert validate_number(10) is True
        assert validate_number(-5) is True
        assert validate_number(0) is True
    
    def test_validate_float(self):
        """Test validation of floating point numbers."""
        assert validate_number(10.5) is True
        assert validate_number(-3.14) is True
    
    def test_validate_string_fails(self):
        """Test that string validation fails."""
        with pytest.raises(ValueError, match="must be a number"):
            validate_number("10")
    
    def test_validate_boolean_fails(self):
        """Test that boolean validation fails."""
        with pytest.raises(ValueError, match="cannot be a boolean"):
            validate_number(True)
    
    def test_validate_none_fails(self):
        """Test that None validation fails."""
        with pytest.raises(ValueError, match="must be a number"):
            validate_number(None)


class TestParseNumberInput:
    """Tests for the parse_number_input function."""
    
    def test_parse_integer(self):
        """Test parsing integer strings."""
        assert parse_number_input("10") == 10
        assert parse_number_input("-5") == -5
        assert parse_number_input("0") == 0
    
    def test_parse_float(self):
        """Test parsing float strings."""
        assert parse_number_input("10.5") == 10.5
        assert parse_number_input("-3.14") == pytest.approx(-3.14)
    
    def test_parse_invalid_string(self):
        """Test that invalid strings raise an error."""
        with pytest.raises(ValueError, match="not a valid number"):
            parse_number_input("abc")
    
    def test_parse_empty_string(self):
        """Test that empty string raises an error."""
        with pytest.raises(ValueError):
            parse_number_input("")


class TestFormatResult:
    """Tests for the format_result function."""
    
    def test_format_whole_number(self):
        """Test formatting of whole numbers."""
        assert format_result(5.0) == "5"
        assert format_result(10.0) == "10"
    
    def test_format_decimal_number(self):
        """Test formatting of decimal numbers."""
        assert format_result(5.333) == "5.33"
        assert format_result(3.14159) == "3.14"
    
    def test_format_with_custom_decimal_places(self):
        """Test formatting with custom decimal places."""
        assert format_result(3.14159, decimal_places=3) == "3.142"
        assert format_result(5.333, decimal_places=1) == "5.3"
    
    def test_format_zero(self):
        """Test formatting of zero."""
        assert format_result(0.0) == "0"
