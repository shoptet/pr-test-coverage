<?php

// Application entry point
require_once __DIR__ . '/services/service1.php';

use App\Services\Service1;

class Application
{
    private Service1 $service;

    public function __construct()
    {
        $this->service = new Service1();
    }

    public function run(): void
    {
        echo $this->service->greet("World") . "\n";
    }

    public function processData(array $data): array
    {
        return $this->service->process($data);
    }

    public function performCalculation(int $x, int $y): int
    {
        return $this->service->calculate($x, $y);
    }

    public function getServiceGreeting(string $name): string
    {
        return $this->service->greet($name);
    }
}

// Only run if this is the main file
if (basename(__FILE__) === basename($_SERVER['PHP_SELF'] ?? '')) {
    $app = new Application();
    $app->run();
}
