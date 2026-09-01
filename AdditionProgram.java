import java.util.Scanner;

public class AdditionProgram {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        boolean continueProgram = true;

        System.out.println("=== Addition Program ===\n");

        while (continueProgram) {
            try {
                // Get first number
                System.out.print("Enter first number: ");
                double num1 = scanner.nextDouble();

                // Get second number
                System.out.print("Enter second number: ");
                double num2 = scanner.nextDouble();

                // Perform addition
                double result = num1 + num2;

                // Display result
                System.out.println("\n" + num1 + " + " + num2 + " = " + result);
                System.out.println();

                // Ask if user wants to continue
                System.out.print("Do you want to add more numbers? (yes/no): ");
                String response = scanner.next().toLowerCase();

                if (!response.equals("yes") && !response.equals("y")) {
                    continueProgram = false;
                    System.out.println("\nThank you for using the Addition Program!");
                }
            } catch (Exception e) {
                System.out.println("Invalid input! Please enter valid numbers.\n");
                scanner.nextLine(); // Clear the invalid input
            }
        }

        scanner.close();
    }
}
