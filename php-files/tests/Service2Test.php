<?php

namespace App\Tests;

use PHPUnit\Framework\TestCase;
use App\Services\Service2;

require_once __DIR__ . '/../src/services/service2.php';

class Service2Test extends TestCase
{
    private Service2 $service;

    protected function setUp(): void
    {
        $this->service = new Service2();
    }

    public function testAdd(): void
    {
        $result = $this->service->add(5, 3);
        $this->assertEquals(8, $result);
    }

    public function testSubtract(): void
    {
        $result = $this->service->subtract(10, 4);
        $this->assertEquals(6, $result);
    }

    public function testMultiply(): void
    {
        $result = $this->service->multiply(6, 7);
        $this->assertEquals(42, $result);
    }

    // Intentionally not testing divide, power, factorial, isPrime, and fibonacci
    // to achieve approximately 25% coverage (testing 3 out of 8 methods)
}
