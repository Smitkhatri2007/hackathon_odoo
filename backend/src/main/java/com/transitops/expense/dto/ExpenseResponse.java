package com.transitops.expense.dto;

import com.transitops.expense.Expense;

import java.time.LocalDate;

public class ExpenseResponse {

    private Long id;
    private Long vehicleId;
    private String type;
    private Double cost;
    private LocalDate logDate;

    public static ExpenseResponse from(Expense expense) {
        ExpenseResponse r = new ExpenseResponse();
        r.id = expense.getId();
        r.vehicleId = expense.getVehicleId();
        r.type = expense.getType();
        r.cost = expense.getCost();
        r.logDate = expense.getLogDate();
        return r;
    }

    public Long getId() {
        return id;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public String getType() {
        return type;
    }

    public Double getCost() {
        return cost;
    }

    public LocalDate getLogDate() {
        return logDate;
    }
}
