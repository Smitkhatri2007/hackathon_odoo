-- PostgreSQL Database Schema for TransitOps Users Table

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'DRIVER'
);

-- Note: In this Spring Boot application, Hibernate handles table creation automatically
-- because `spring.jpa.hibernate.ddl-auto=update` is set.
-- The default seeder creates an admin user on application startup:
-- admin@transitops.com / admin123
