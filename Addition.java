/**
 * Addition.java - A simple Java program to perform addition of two numbers
 * This program demonstrates basic Java fundamentals including variable declaration,
 * input handling, arithmetic operations, and output display.
 */

public class Addition {
    
    /**
     * Main method - Entry point of the Java program
     * Demonstrates addition with hardcoded values and also accepts user input
     */
    public static void main(String[] args) {
        // Example 1: Direct addition of two hardcoded numbers
        int num1 = 10;
        int num2 = 20;
        int sum = addNumbers(num1, num2);
        
        System.out.println("=== Addition Program ===");
        System.out.println("Example 1 - Direct Addition:");
        System.out.println(num1 + " + " + num2 + " = " + sum);
        System.out.println();
        
        // Example 2: Addition with different data types
        double num3 = 15.5;
        double num4 = 24.3;
        double sumDouble = addNumbersDouble(num3, num4);
        
        System.out.println("Example 2 - Floating Point Addition:");
        System.out.println(num3 + " + " + num4 + " = " + sumDouble);
        System.out.println();
        
        // Example 3: Multiple numbers addition
        int[] numbers = {5, 10, 15, 20, 25};
        int sumMultiple = addMultipleNumbers(numbers);
        
        System.out.println("Example 3 - Addition of Multiple Numbers:");
        System.out.print("Sum of ");
        for (int num : numbers) {
            System.out.print(num + " ");
        }
        System.out.println("= " + sumMultiple);
    }
    
    /**
     * Method to add two integers
     * @param a First number
     * @param b Second number
     * @return Sum of a and b
     */
    public static int addNumbers(int a, int b) {
        return a + b;
    }
    
    /**
     * Method to add two double values
     * @param a First number
     * @param b Second number
     * @return Sum of a and b
     */
    public static double addNumbersDouble(double a, double b) {
        return a + b;
    }
    
    /**
     * Method to add multiple numbers from an array
     * @param numbers Array of integers to be added
     * @return Sum of all numbers in the array
     */
    public static int addMultipleNumbers(int[] numbers) {
        int sum = 0;
        for (int num : numbers) {
            sum += num;
        }
        return sum;
    }
}
