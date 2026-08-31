def add(a, b):
    return a + b


def main():
    try:
        num1 = float(input("Enter the first number: "))
        num2 = float(input("Enter the second number: "))
    except ValueError:
        print("Please enter valid numbers.")
        return

    result = add(num1, num2)

    if result == int(result):
        result = int(result)

    print(f"The sum of {num1} and {num2} is {result}")


if __name__ == "__main__":
    main()
