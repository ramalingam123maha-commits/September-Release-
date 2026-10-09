import java.util.Scanner;

/**
 * A simple Java program to perform addition of two numbers
 */
public class Addition {
    
    /**
     * Main method - entry point of the program
     * @param args command line arguments
     */
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        System.out.println("=== Simple Addition Program ===");
        System.out.println();
        
        // Get first number from user
        System.out.print("Enter the first number: ");
        double firstNumber = scanner.nextDouble();
        
        // Get second number from user
        System.out.print("Enter the second number: ");
        double secondNumber = scanner.nextDouble();
        
        // Perform addition
        double sum = add(firstNumber, secondNumber);
        
        // Display result
        System.out.println();
        System.out.println("Result: " + firstNumber + " + " + secondNumber + " = " + sum);
        
        scanner.close();
    }
    
    /**
     * Method to add two numbers
     * @param num1 first number
     * @param num2 second number
     * @return the sum of num1 and num2
     */
    public static double add(double num1, double num2) {
        return num1 + num2;
    }
}
