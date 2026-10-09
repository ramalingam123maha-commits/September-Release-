import React, { useState } from 'react';

/**
 * AdditionProgram Component
 * A simple React component that performs addition operations
 */
export default function AdditionProgram() {
  const [firstNumber, setFirstNumber] = useState('');
  const [secondNumber, setSecondNumber] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  /**
   * Handle addition operation
   */
  const handleAddition = (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    try {
      const num1 = parseFloat(firstNumber);
      const num2 = parseFloat(secondNumber);

      if (isNaN(num1) || isNaN(num2)) {
        setError('Please enter valid numbers');
        return;
      }

      const sum = num1 + num2;
      setResult(sum);
    } catch (err) {
      setError('An error occurred during calculation');
    }
  };

  /**
   * Reset form
   */
  const handleReset = () => {
    setFirstNumber('');
    setSecondNumber('');
    setResult(null);
    setError('');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Addition Program
        </h1>

        <form onSubmit={handleAddition} className="space-y-4">
          {/* First Number Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Number
            </label>
            <input
              type="number"
              value={firstNumber}
              onChange={(e) => setFirstNumber(e.target.value)}
              placeholder="Enter first number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="any"
            />
          </div>

          {/* Second Number Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Second Number
            </label>
            <input
              type="number"
              value={secondNumber}
              onChange={(e) => setSecondNumber(e.target.value)}
              placeholder="Enter second number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="any"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Result Display */}
          {result !== null && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-gray-700 text-sm mb-2">Result:</p>
              <p className="text-2xl font-bold text-green-600">
                {firstNumber} + {secondNumber} = {result}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Add
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
