/**
 * Unit tests for the Calculator class
 * Tests all arithmetic operations and error handling
 */
public class CalculatorTest {
    
    private static int testsPassed = 0;
    private static int testsFailed = 0;
    
    /**
     * Assert that two doubles are equal (with small epsilon for floating point comparison)
     */
    private static void assertEquals(double expected, double actual, String testName) {
        double epsilon = 0.01;
        if (Math.abs(expected - actual) < epsilon) {
            System.out.println("✓ PASS: " + testName);
            testsPassed++;
        } else {
            System.out.println("✗ FAIL: " + testName + " (expected: " + expected + ", got: " + actual + ")");
            testsFailed++;
        }
    }
    
    /**
     * Assert that an operation throws an exception
     */
    private static void assertThrows(String testName, TestOperation operation) {
        try {
            operation.execute();
            System.out.println("✗ FAIL: " + testName + " (expected exception but none was thrown)");
            testsFailed++;
        } catch (Exception e) {
            System.out.println("✓ PASS: " + testName + " (exception: " + e.getMessage() + ")");
            testsPassed++;
        }
    }
    
    /**
     * Functional interface for test operations
     */
    @FunctionalInterface
    interface TestOperation {
        void execute();
    }
    
    /**
     * Run all tests
     */
    public static void runTests() {
        System.out.println("=== Calculator Unit Tests ===\n");
        
        // Test Addition
        System.out.println("Testing Addition:");
        assertEquals(10, Calculator.add(5, 5), "5 + 5 = 10");
        assertEquals(0, Calculator.add(-5, 5), "-5 + 5 = 0");
        assertEquals(-10, Calculator.add(-5, -5), "-5 + (-5) = -10");
        assertEquals(25.5, Calculator.add(12.3, 13.2), "12.3 + 13.2 = 25.5");
        
        // Test Subtraction
        System.out.println("\nTesting Subtraction:");
        assertEquals(0, Calculator.subtract(5, 5), "5 - 5 = 0");
        assertEquals(10, Calculator.subtract(15, 5), "15 - 5 = 10");
        assertEquals(-10, Calculator.subtract(5, 15), "5 - 15 = -10");
        assertEquals(-1.1, Calculator.subtract(12.1, 13.2), "12.1 - 13.2 = -1.1");
        
        // Test Multiplication
        System.out.println("\nTesting Multiplication:");
        assertEquals(25, Calculator.multiply(5, 5), "5 * 5 = 25");
        assertEquals(-25, Calculator.multiply(-5, 5), "-5 * 5 = -25");
        assertEquals(25, Calculator.multiply(-5, -5), "-5 * -5 = 25");
        assertEquals(0, Calculator.multiply(0, 100), "0 * 100 = 0");
        assertEquals(39.06, Calculator.multiply(6.3, 6.2), "6.3 * 6.2 = 39.06");
        
        // Test Division
        System.out.println("\nTesting Division:");
        assertEquals(1, Calculator.divide(5, 5), "5 / 5 = 1");
        assertEquals(2, Calculator.divide(10, 5), "10 / 5 = 2");
        assertEquals(-2, Calculator.divide(-10, 5), "-10 / 5 = -2");
        assertEquals(0, Calculator.divide(0, 5), "0 / 5 = 0");
        
        // Test Division by Zero
        System.out.println("\nTesting Division by Zero:");
        assertThrows("10 / 0 should throw ArithmeticException", () -> Calculator.divide(10, 0));
        
        // Test Modulo
        System.out.println("\nTesting Modulo:");
        assertEquals(1, Calculator.modulo(10, 3), "10 % 3 = 1");
        assertEquals(0, Calculator.modulo(10, 5), "10 % 5 = 0");
        assertEquals(2, Calculator.modulo(17, 5), "17 % 5 = 2");
        
        // Test Modulo by Zero
        System.out.println("\nTesting Modulo by Zero:");
        assertThrows("10 % 0 should throw ArithmeticException", () -> Calculator.modulo(10, 0));
        
        // Test Power
        System.out.println("\nTesting Power:");
        assertEquals(25, Calculator.power(5, 2), "5 ^ 2 = 25");
        assertEquals(8, Calculator.power(2, 3), "2 ^ 3 = 8");
        assertEquals(1, Calculator.power(5, 0), "5 ^ 0 = 1");
        assertEquals(0.25, Calculator.power(2, -2), "2 ^ -2 = 0.25");
        
        // Test Square Root
        System.out.println("\nTesting Square Root:");
        assertEquals(5, Calculator.squareRoot(25), "√25 = 5");
        assertEquals(2, Calculator.squareRoot(4), "√4 = 2");
        assertEquals(0, Calculator.squareRoot(0), "√0 = 0");
        assertEquals(3.162, Calculator.squareRoot(10), "√10 ≈ 3.162");
        
        // Test Square Root of Negative
        System.out.println("\nTesting Square Root of Negative:");
        assertThrows("√(-5) should throw ArithmeticException", () -> Calculator.squareRoot(-5));
        
        // Print summary
        System.out.println("\n=== Test Summary ===");
        System.out.println("Tests Passed: " + testsPassed);
        System.out.println("Tests Failed: " + testsFailed);
        System.out.println("Total Tests: " + (testsPassed + testsFailed));
        
        if (testsFailed == 0) {
            System.out.println("\n✓ All tests passed!");
        } else {
            System.out.println("\n✗ Some tests failed!");
        }
    }
    
    public static void main(String[] args) {
        runTests();
    }
}
