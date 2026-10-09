// Subtraction Program
// A simple program that performs subtraction operations

function subtract(a, b) {
  return a - b;
}

function main() {
  const num1 = 10;
  const num2 = 3;
  const result = subtract(num1, num2);
  
  console.log(`Subtraction: ${num1} - ${num2} = ${result}`);
}

if (require.main === module) {
  main();
}

module.exports = subtract;
