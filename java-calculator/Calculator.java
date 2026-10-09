/**
 * A comprehensive Calculator program in Java
 * Supports basic arithmetic operations: addition, subtraction, multiplication, and division
 * Includes input validation and error handling
 */
public class Calculator {
    
    /**
     * Adds two numbers
     * @param a the first number
     * @param b the second number
     * @return the sum of a and b
     */
    public static double add(double a, double b) {
        return a + b;
    }
    
    /**
     * Subtracts the second number from the first
     * @param a the first number
     * @param b the second number to subtract
     * @return the difference of a and b
     */
    public static double subtract(double a, double b) {
        return a - b;
    }
    
    /**
     * Multiplies two numbers
     * @param a the first number
     * @param b the second number
     * @return the product of a and b
     */
    public static double multiply(double a, double b) {
        return a * b;
    }
    
    /**
     * Divides the first number by the second
     * @param a the dividend
     * @param b the divisor
     * @return the quotient of a divided by b
     * @throws ArithmeticException if b is zero
     */
    public static double divide(double a, double b) {
        if (b == 0) {
            throw new ArithmeticException("Division by zero is not allowed");
        }
        return a / b;
    }
    
    /**
     * Calculates the remainder of division
     * @param a the dividend
     * @param b the divisor
     * @return the remainder of a divided by b
     * @throws ArithmeticException if b is zero
     */
    public static double modulo(double a, double b) {
        if (b == 0) {
            throw new ArithmeticException("Modulo by zero is not allowed");
        }
        return a % b;
    }
    
    /**
     * Calculates the power of a number
     * @param base the base number
     * @param exponent the exponent
     * @return base raised to the power of exponent
     */
    public static double power(double base, double exponent) {
        return Math.pow(base, exponent);
    }
    
    /**
     * Calculates the square root of a number
     * @param num the number
     * @return the square root of num
     * @throws ArithmeticException if num is negative
     */
    public static double squareRoot(double num) {
        if (num < 0) {
            throw new ArithmeticException("Cannot calculate square root of negative numbers");
        }
        return Math.sqrt(num);
    }
    
    /**
     * Main method to demonstrate calculator functionality
     */
    public static void main(String[] args) {
        System.out.println("=== Java Calculator ===\n");
        
        // Test basic operations
        double num1 = 20.0;
        double num2 = 5.0;
        
        System.out.println("Testing with numbers: " + num1 + " and " + num2);
        System.out.println("Addition: " + num1 + " + " + num2 + " = " + add(num1, num2));
        System.out.println("Subtraction: " + num1 + " - " + num2 + " = " + subtract(num1, num2));
        System.out.println("Multiplication: " + num1 + " * " + num2 + " = " + multiply(num1, num2));
        System.out.println("Division: " + num1 + " / " + num2 + " = " + divide(num1, num2));
        System.out.println("Modulo: " + num1 + " % " + num2 + " = " + modulo(num1, num2));
        System.out.println("Power: " + num1 + " ^ " + num2 + " = " + power(num1, num2));
        System.out.println("Square Root: √" + num1 + " = " + squareRoot(num1));
        
        System.out.println("\n=== Additional Tests ===");
        
        // Test decimal operations
        double decimal1 = 15.5;
        double decimal2 = 3.2;
        
        System.out.println("\nTesting with decimals: " + decimal1 + " and " + decimal2);
        System.out.println("Addition: " + decimal1 + " + " + decimal2 + " = " + add(decimal1, decimal2));
        System.out.println("Division: " + decimal1 + " / " + decimal2 + " = " + divide(decimal1, decimal2));
        
        // Test error handling
        System.out.println("\n=== Error Handling Test ===");
        try {
            System.out.println("Attempting division by zero...");
            double result = divide(10, 0);
        } catch (ArithmeticException e) {
            System.out.println("Error caught: " + e.getMessage());
        }
        
        try {
            System.out.println("Attempting square root of negative number...");
            double result = squareRoot(-5);
        } catch (ArithmeticException e) {
            System.out.println("Error caught: " + e.getMessage());
        }
        
        System.out.println("\nCalculator operations completed successfully!");
    }
}
