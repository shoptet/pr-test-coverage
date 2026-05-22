<?php

namespace App\Services;

class Service1
{
    public function greet(string $name): string
    {
        return "Hello, " . $name . "!";
    }

    public function calculate(int $a, int $b): int
    {
        if ($a > $b) {
            return $a + $b;
        } else {
            return $a - $b;
        }
    }

    public function process(array $data): array
    {
        $result = [];
        foreach ($data as $item) {
            if ($item > 0) {
                $result[] = $item * 2;
            } else {
                $result[] = $item;
            }
        }
        return $result;
    }
}
