<?php

namespace App\Services;

class Service2
{
    public function add(int $a, int $b): int
    {
        return $a + $b;
    }

    public function subtract(int $a, int $b): int
    {
        return $a - $b;
    }

    public function multiply(int $a, int $b): int
    {
        return $a * $b;
    }

    public function divide(int $a, int $b): int
    {
        if ($b === 0) {
            throw new \InvalidArgumentException("Cannot divide by zero");
        }
        return intdiv($a, $b);
    }

    public function power(int $base, int $exponent): int
    {
        if ($exponent === 0) {
            return 1;
        }
        $result = 1;
        for ($i = 0; $i < $exponent; $i++) {
            $result *= $base;
        }
        return $result;
    }

    public function factorial(int $n): int
    {
        if ($n < 0) {
            throw new \InvalidArgumentException("Factorial is not defined for negative numbers");
        }
        if ($n === 0 || $n === 1) {
            return 1;
        }
        $result = 1;
        for ($i = 2; $i <= $n; $i++) {
            $result *= $i;
        }
        return $result;
    }

    public function isPrime(int $n): bool
    {
        if ($n < 2) {
            return false;
        }
        if ($n === 2) {
            return true;
        }
        if ($n % 2 === 0) {
            return false;
        }
        for ($i = 3; $i * $i <= $n; $i += 2) {
            if ($n % $i === 0) {
                return false;
            }
        }
        return true;
    }

    public function fibonacci(int $n): int
    {
        if ($n < 0) {
            throw new \InvalidArgumentException("Fibonacci is not defined for negative numbers");
        }
        if ($n === 0) {
            return 0;
        }
        if ($n === 1) {
            return 1;
        }
        $a = 0;
        $b = 1;
        for ($i = 2; $i <= $n; $i++) {
            $temp = $a + $b;
            $a = $b;
            $b = $temp;
        }
        return $b;
    }
}
