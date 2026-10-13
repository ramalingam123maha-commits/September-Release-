import java.util.Scanner;

public class Multiplication {
    public static double multiply(double a, double b) {
        return a * b;
    }

    public static long multiply(long a, long b) {
        return a * b;
    }

    public static void printTable(int number, int range) {
        System.out.println("Multiplication Table for " + number + ":");
        for (int i = 1; i <= range; i++) {
            System.out.printf("%d x %d = %d%n", number, i, (long) number * i);
        }
    }

    public static void main(String[] args) {
        if (args.length >= 2) {
            try {
                double num1 = Double.parseDouble(args[0]);
                double num2 = Double.parseDouble(args[1]);
                System.out.println("Result: " + multiply(num1, num2));
            } catch (NumberFormatException e) {
                System.err.println("Invalid numeric arguments provided.");
            }
            return;
        }

        Scanner scanner = new Scanner(System.in);
        System.out.println("--- Multiplication Program ---");
        System.out.print("Enter first number: ");
        if (!scanner.hasNextDouble()) {
            System.out.println("Invalid input. Please enter a valid number.");
            scanner.close();
            return;
        }
        double a = scanner.nextDouble();

        System.out.print("Enter second number: ");
        if (!scanner.hasNextDouble()) {
            System.out.println("Invalid input. Please enter a valid number.");
            scanner.close();
            return;
        }
        double b = scanner.nextDouble();

        double product = multiply(a, b);
        System.out.println("Product: " + product);

        if (a == Math.floor(a) && !Double.isInfinite(a) && b == Math.floor(b) && !Double.isInfinite(b)) {
            System.out.println();
            printTable((int) a, 10);
        }

        scanner.close();
    }
}
