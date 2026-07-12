package com.transitops.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.stream.Collectors;

public class DatabaseConfig {
    private static final Logger logger = LoggerFactory.getLogger(DatabaseConfig.class);
    private static HikariDataSource dataSource;

    static {
        try {
            String dbUrl = System.getenv("DB_URL");
            String dbUser = System.getenv("DB_USER");
            String dbPassword = System.getenv("DB_PASSWORD");

            if (dbUrl == null || dbUrl.trim().isEmpty()) {
                // Fallback to H2 in PostgreSQL compatibility mode
                dbUrl = "jdbc:h2:mem:transitopsdb;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDER=HIGH;DB_CLOSE_DELAY=-1";
                dbUser = "sa";
                dbPassword = "";
                logger.info("No DB_URL env variable specified. Using in-memory H2 database with PostgreSQL compatibility.");
            } else {
                logger.info("Connecting to database: {}", dbUrl);
            }

            HikariConfig config = new HikariConfig();
            config.setJdbcUrl(dbUrl);
            config.setUsername(dbUser);
            config.setPassword(dbPassword);

            if (dbUrl.startsWith("jdbc:h2:")) {
                config.setDriverClassName("org.h2.Driver");
            } else {
                config.setDriverClassName("org.postgresql.Driver");
            }

            // Connection pool configurations
            config.setMaximumPoolSize(10);
            config.setMinimumIdle(2);
            config.setIdleTimeout(30000);
            config.setConnectionTimeout(30000);

            dataSource = new HikariDataSource(config);
            logger.info("Database connection pool initialized successfully.");

            // Initialize schema
            initializeSchema();

        } catch (Exception e) {
            logger.error("Failed to initialize database connection pool.", e);
            throw new RuntimeException("Database initialization failed", e);
        }
    }

    public static Connection getConnection() throws SQLException {
        return dataSource.getConnection();
    }

    public static void close() {
        if (dataSource != null && !dataSource.isClosed()) {
            dataSource.close();
            logger.info("Database connection pool closed.");
        }
    }

    private static void initializeSchema() {
        logger.info("Initializing database schema from init.sql...");
        try (InputStream is = DatabaseConfig.class.getClassLoader().getResourceAsStream("db/init.sql")) {
            if (is == null) {
                logger.error("Could not find db/init.sql in resources.");
                return;
            }

            String sql;
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
                sql = reader.lines().collect(Collectors.joining("\n"));
            }

            // Split statement by semicolon. A simple split is sufficient since we don't have semicolons inside text literals.
            String[] statements = sql.split(";");

            try (Connection conn = getConnection(); Statement stmt = conn.createStatement()) {
                conn.setAutoCommit(false);
                for (String sqlStatement : statements) {
                    String trimmed = sqlStatement.trim();
                    if (!trimmed.isEmpty()) {
                        stmt.execute(trimmed);
                    }
                }
                conn.commit();
                logger.info("Database schema initialized and seeded successfully.");
            } catch (SQLException e) {
                logger.error("Error executing schema creation SQL.", e);
                throw new RuntimeException("Failed to run init.sql script", e);
            }
        } catch (Exception e) {
            logger.error("Failed to read db/init.sql resource.", e);
            throw new RuntimeException("Failed to load schema script", e);
        }
    }
}
