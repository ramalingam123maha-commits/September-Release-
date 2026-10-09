import java.util.Scanner;

public class Addition {
    
    /**
     * Adds two integers and returns the result.
     * 
     * @param a the first number
     * @param b the second number
     * @return the sum of a and b
     */
    public static int add(int a, int b) {
        return a + b;
    }
    
    /**
     * Adds two double values and returns the result.
     * 
     * @param a the first number
     * @param b the second number
     * @return the sum of a and b
     */
    public static double add(double a, double b) {
        return a + b;
    }
    
    /**
     * Main method to demonstrate the addition program.
     * Takes user input for two numbers and displays their sum.
     * 
     * @param args command line arguments (not used)
     */
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        try {
            System.out.println("=== Java Addition Program ===");
            System.out.print("Enter first number: ");
            double num1 = scanner.nextDouble();
            
            System.out.print("Enter second number: ");
            double num2 = scanner.nextDouble();
            
            double result = add(num1, num2);
            
            System.out.println("Result: " + num1 + " + " + num2 + " = " + result);
        } finally {
            scanner.close();
        }
    }
}
