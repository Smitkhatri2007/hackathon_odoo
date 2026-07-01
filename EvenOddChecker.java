import java.util.Scanner;

public class EvenOddChecker {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.print("Enter a number: ");
        
        // Check if the input is actually an integer to prevent errors
        if (scanner.hasNextInt()) {
            int number = scanner.nextInt();
            
            if (isEven(number)) {
                System.out.println(number + " is even.");
            } else {
                System.out.println(number + " is odd.");
            }
        } else {
            System.out.println("Invalid input. Please enter an integer.");
        }

        scanner.close();
    }

    /**
     * Checks if a number is even.
     * 
     * @param number The integer to check.
     * @return true if the number is even, false otherwise.
     */
    public static boolean isEven(int number) {
        return number % 2 == 0;
    }
}
