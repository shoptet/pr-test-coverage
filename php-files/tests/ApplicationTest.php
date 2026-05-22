<?php

namespace App\Tests;

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../src/index.php';

class ApplicationTest extends TestCase
{
    private \Application $app;

    protected function setUp(): void
    {
        $this->app = new \Application();
    }

    public function testGetServiceGreeting(): void
    {
        $result = $this->app->getServiceGreeting("Test");
        $this->assertEquals("Hello, Test!", $result);
    }

    public function testPerformCalculationWithGreaterFirstNumber(): void
    {
        $result = $this->app->performCalculation(10, 5);
        $this->assertEquals(15, $result);
    }

    // Intentionally not testing processData to keep coverage around 50%
    // Intentionally not testing run method to keep coverage lower
}
