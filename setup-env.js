const fs = require('fs');
const path = require('path');

const services = ['auth', 'user', 'inventory', 'borrow', 'audit'];

// Make sure frontend has its local env too
if (!fs.existsSync('frontend/.env.local')) {
    fs.writeFileSync('frontend/.env.local', 'NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1\n');
}

services.forEach((svc, index) => {
    const dir = path.join(__dirname, `services/${svc}-service`);
    const envExamplePath = path.join(dir, '.env.example');
    const envPath = path.join(dir, '.env');

    if (!fs.existsSync(envExamplePath)) {
        console.warn(`No .env.example found in ${svc}-service. Creating default .env locally...`);
        // Just write a default block assuming typical Laravel config
        const defaultEnv = `
APP_NAME=Laravel
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:800${index + 1}

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=${svc}_db
DB_USERNAME=inventory_user
DB_PASSWORD=inventory_pass

AUTH_SERVICE_URL=http://localhost:8001
INVENTORY_SERVICE_URL=http://localhost:8003
AUDIT_SERVICE_URL=http://localhost:8005
`;
        fs.writeFileSync(envPath, defaultEnv.trim() + '\n');
    } else {
        let content = fs.readFileSync(envExamplePath, 'utf8');

        // Update DB_HOST from Docker service name to 127.0.0.1
        content = content.replace(/DB_HOST=postgres/g, 'DB_HOST=127.0.0.1');

        // Optional: Ensure correct DB name logic just in case
        content = content.replace(/DB_DATABASE=laravel/g, `DB_DATABASE=${svc}_db`);

        // Update cross-service internal URLs so they hit local node gateway or exact ports
        content = content.replace(/http:\/\/auth-service:8000/g, 'http://127.0.0.1:8001');
        content = content.replace(/http:\/\/inventory-service:8000/g, 'http://127.0.0.1:8003');
        content = content.replace(/http:\/\/audit-service:8000/g, 'http://127.0.0.1:8005');

        // Ensure inter-service URLs are present even if .env.example doesn't include them
        const serviceUrls = {
            AUTH_SERVICE_URL: 'http://127.0.0.1:8001',
            INVENTORY_SERVICE_URL: 'http://127.0.0.1:8003',
            AUDIT_SERVICE_URL: 'http://127.0.0.1:8005',
        };
        for (const [key, value] of Object.entries(serviceUrls)) {
            if (!content.includes(key)) {
                content = content.trimEnd() + `\n${key}=${value}\n`;
            }
        }

        fs.writeFileSync(envPath, content);
    }
    console.log(`✅ Initialized .env for ${svc}-service`);
});
