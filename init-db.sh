#!/bin/bash
# Initialize all microservice databases in PostgreSQL

set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE DATABASE user_db;
  CREATE DATABASE inventory_db;
  CREATE DATABASE borrow_db;
  CREATE DATABASE audit_db;

  GRANT ALL PRIVILEGES ON DATABASE auth_db TO ceyntics;
  GRANT ALL PRIVILEGES ON DATABASE user_db TO ceyntics;
  GRANT ALL PRIVILEGES ON DATABASE inventory_db TO ceyntics;
  GRANT ALL PRIVILEGES ON DATABASE borrow_db TO ceyntics;
  GRANT ALL PRIVILEGES ON DATABASE audit_db TO ceyntics;
EOSQL

echo "✅ All microservice databases created."
