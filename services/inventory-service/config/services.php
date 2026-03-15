<?php

return [
    'auth' => [
        'url' => env('AUTH_SERVICE_URL', 'http://auth-service:8000'),
    ],
    'inventory' => [
        'url' => env('INVENTORY_SERVICE_URL', 'http://inventory-service:8000'),
    ],
    'audit' => [
        'url' => env('AUDIT_SERVICE_URL', 'http://audit-service:8000'),
    ],
];