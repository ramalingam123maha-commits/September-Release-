import unittest
from subtraction import subtract

class TestSubtraction(unittest.TestCase):
    def test_positive_numbers(self):
        self.assertEqual(subtract(10, 4), 6)

    def test_negative_numbers(self):
        self.assertEqual(subtract(-5, -2), -3)

    def test_positive_and_negative(self):
        self.assertEqual(subtract(5, -3), 8)

    def test_zero(self):
        self.assertEqual(subtract(7, 0), 7)
        self.assertEqual(subtract(0, 7), -7)

    def test_floating_point(self):
        self.assertAlmostEqual(subtract(5.5, 2.3), 3.2, places=7)

if __name__ == '__main__':
    unittest.main()
