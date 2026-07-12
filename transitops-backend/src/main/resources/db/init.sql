-- TransitOps Database Schema Initialization

-- Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    model VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    max_load_capacity DOUBLE PRECISION NOT NULL,
    odometer DOUBLE PRECISION NOT NULL,
    acquisition_cost DOUBLE PRECISION NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Available'
);

-- Drivers Table
CREATE TABLE IF NOT EXISTS drivers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Available'
);

-- Trips Table
CREATE TABLE IF NOT EXISTS trips (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
    cargo_weight DOUBLE PRECISION NOT NULL,
    distance DOUBLE PRECISION NOT NULL,
    revenue DOUBLE PRECISION NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Draft'
);

-- Maintenance Logs Table
CREATE TABLE IF NOT EXISTS maintenance_logs (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Active'
);

-- Fuel Logs Table
CREATE TABLE IF NOT EXISTS fuel_logs (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    liters DOUBLE PRECISION NOT NULL,
    cost DOUBLE PRECISION NOT NULL,
    date DATE NOT NULL
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    date DATE NOT NULL
);

-- Seed Data (only insert if tables are empty to prevent duplication on multiple runs)
INSERT INTO vehicles (id, registration_number, model, type, max_load_capacity, odometer, acquisition_cost, status)
SELECT 1, 'TRK-001', 'Volvo FH16', 'Truck', 25000, 150000, 120000.0, 'Available'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE id = 1);

INSERT INTO vehicles (id, registration_number, model, type, max_load_capacity, odometer, acquisition_cost, status)
SELECT 2, 'VAN-002', 'Ford Transit', 'Van', 3500, 80000, 45000.0, 'Available'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE id = 2);

INSERT INTO vehicles (id, registration_number, model, type, max_load_capacity, odometer, acquisition_cost, status)
SELECT 3, 'TRK-003', 'Scania R500', 'Truck', 26000, 120000, 130000.0, 'In Shop'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE id = 3);

INSERT INTO vehicles (id, registration_number, model, type, max_load_capacity, odometer, acquisition_cost, status)
SELECT 4, 'VAN-004', 'Mercedes Sprinter', 'Van', 4000, 95000, 50000.0, 'On Trip'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE id = 4);

INSERT INTO vehicles (id, registration_number, model, type, max_load_capacity, odometer, acquisition_cost, status)
SELECT 5, 'TRK-005', 'DAF XF', 'Truck', 24000, 300000, 110000.0, 'Retired'
WHERE NOT EXISTS (SELECT 1 FROM vehicles WHERE id = 5);


INSERT INTO drivers (id, name, license_number, status)
SELECT 1, 'John Doe', 'DL-12345', 'Available'
WHERE NOT EXISTS (SELECT 1 FROM drivers WHERE id = 1);

INSERT INTO drivers (id, name, license_number, status)
SELECT 2, 'Jane Smith', 'DL-67890', 'On Trip'
WHERE NOT EXISTS (SELECT 1 FROM drivers WHERE id = 2);


-- Seed Trips (completed trips generate distance and revenue)
INSERT INTO trips (id, vehicle_id, driver_id, cargo_weight, distance, revenue, status)
SELECT 1, 1, 1, 18000, 1200.0, 6000.0, 'Completed'
WHERE NOT EXISTS (SELECT 1 FROM trips WHERE id = 1);

INSERT INTO trips (id, vehicle_id, driver_id, cargo_weight, distance, revenue, status)
SELECT 2, 2, 1, 2000, 800.0, 2400.0, 'Completed'
WHERE NOT EXISTS (SELECT 1 FROM trips WHERE id = 2);

INSERT INTO trips (id, vehicle_id, driver_id, cargo_weight, distance, revenue, status)
SELECT 3, 4, 2, 3000, 500.0, 1800.0, 'Completed'
WHERE NOT EXISTS (SELECT 1 FROM trips WHERE id = 3);


-- Seed Fuel Logs
INSERT INTO fuel_logs (id, vehicle_id, liters, cost, date)
SELECT 1, 1, 120.0, 240.0, '2026-07-01'
WHERE NOT EXISTS (SELECT 1 FROM fuel_logs WHERE id = 1);

INSERT INTO fuel_logs (id, vehicle_id, liters, cost, date)
SELECT 2, 1, 110.0, 220.0, '2026-07-05'
WHERE NOT EXISTS (SELECT 1 FROM fuel_logs WHERE id = 2);

INSERT INTO fuel_logs (id, vehicle_id, liters, cost, date)
SELECT 3, 2, 80.0, 160.0, '2026-07-02'
WHERE NOT EXISTS (SELECT 1 FROM fuel_logs WHERE id = 3);

INSERT INTO fuel_logs (id, vehicle_id, liters, cost, date)
SELECT 4, 4, 60.0, 120.0, '2026-07-03'
WHERE NOT EXISTS (SELECT 1 FROM fuel_logs WHERE id = 4);


-- Seed Expenses
INSERT INTO expenses (id, vehicle_id, type, amount, date)
SELECT 1, 1, 'Toll', 50.0, '2026-07-01'
WHERE NOT EXISTS (SELECT 1 FROM expenses WHERE id = 1);

INSERT INTO expenses (id, vehicle_id, type, amount, date)
SELECT 2, 1, 'Maintenance', 450.0, '2026-07-02'
WHERE NOT EXISTS (SELECT 1 FROM expenses WHERE id = 2);

INSERT INTO expenses (id, vehicle_id, type, amount, date)
SELECT 3, 2, 'Maintenance', 300.0, '2026-07-04'
WHERE NOT EXISTS (SELECT 1 FROM expenses WHERE id = 3);

INSERT INTO expenses (id, vehicle_id, type, amount, date)
SELECT 4, 4, 'Toll', 30.0, '2026-07-03'
WHERE NOT EXISTS (SELECT 1 FROM expenses WHERE id = 4);


-- Seed Maintenance Logs
INSERT INTO maintenance_logs (id, vehicle_id, description, date, status)
SELECT 1, 3, 'Engine Overhaul', '2026-07-10', 'Active'
WHERE NOT EXISTS (SELECT 1 FROM maintenance_logs WHERE id = 1);

INSERT INTO maintenance_logs (id, vehicle_id, description, date, status)
SELECT 2, 1, 'Brake Pads Replacement', '2026-07-02', 'Closed'
WHERE NOT EXISTS (SELECT 1 FROM maintenance_logs WHERE id = 2);
