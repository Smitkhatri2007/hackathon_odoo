package com.transitops;

import com.transitops.config.DatabaseConfig;
import com.transitops.controller.FuelExpenseController;
import com.transitops.controller.MaintenanceController;
import com.transitops.controller.ReportController;
import io.javalin.Javalin;
import io.javalin.http.HttpResponseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

public class App {
    private static final Logger logger = LoggerFactory.getLogger(App.class);

    public static void main(String[] args) {
        int port = 8080;
        String portEnv = System.getenv("PORT");
        if (portEnv != null && !portEnv.trim().isEmpty()) {
            try {
                port = Integer.parseInt(portEnv);
            } catch (NumberFormatException e) {
                logger.warn("Invalid PORT env variable. Defaulting to 8080.");
            }
        }

        Javalin app = startServer(port);
        
        // Add shutdown hook to close HikariCP connection pool
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            logger.info("Stopping TransitOps backend...");
            app.stop();
            DatabaseConfig.close();
        }));
    }

    public static Javalin startServer(int port) {
        logger.info("Starting TransitOps backend on port {}...", port);

        Javalin app = Javalin.create(config -> {
            // Configure CORS if teammate connecting frontend needs it
            config.bundledPlugins.enableCors(cors -> {
                cors.addRule(rule -> {
                    rule.anyHost();
                });
            });
            // Request logging
            config.router.treatMultipleSlashesAsSingleSlash = true;
        });

        // Exception mapping for Javalin's built-in HTTP responses to return clean JSON
        app.exception(HttpResponseException.class, (e, ctx) -> {
            ctx.status(e.getStatus()).json(Map.of("error", e.getMessage()));
        });

        // Global fallback exception handling
        app.exception(Exception.class, (e, ctx) -> {
            logger.error("Unhandled server exception", e);
            ctx.status(500).json(Map.of("error", "Internal server error: " + e.getMessage()));
        });

        // Maintenance endpoints
        app.post("/maintenance", MaintenanceController::create);
        app.patch("/maintenance/{id}/close", MaintenanceController::close);
        app.get("/maintenance", MaintenanceController::list);

        // Fuel & Expense endpoints
        app.post("/fuel-logs", FuelExpenseController::createFuelLog);
        app.post("/expenses", FuelExpenseController::createExpense);
        app.get("/vehicles/{id}/costs", FuelExpenseController::getOperationalCosts);

        // Analytics Reports endpoints
        app.get("/reports/fuel-efficiency", ReportController::getFuelEfficiency);
        app.get("/reports/fleet-utilization", ReportController::getFleetUtilization);
        app.get("/reports/operational-cost", ReportController::getOperationalCosts);
        app.get("/reports/roi", ReportController::getRoi);

        // Simple health check endpoint
        app.get("/", ctx -> ctx.json(Map.of(
            "status", "UP",
            "message", "TransitOps Platform API is running."
        )));

        app.start(port);
        logger.info("TransitOps backend started successfully.");
        return app;
    }
}
