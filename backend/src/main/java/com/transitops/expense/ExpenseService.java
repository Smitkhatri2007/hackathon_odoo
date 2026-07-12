package com.transitops.expense;

import com.transitops.expense.dto.ExpenseRequest;
import com.transitops.expense.dto.ExpenseResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    public ExpenseResponse create(ExpenseRequest request) {
        Expense expense = new Expense();
        expense.setVehicleId(request.getVehicleId());
        expense.setType(request.getType());
        expense.setCost(request.getCost());
        expense.setLogDate(request.getLogDate());
        return ExpenseResponse.from(expenseRepository.save(expense));
    }

    public List<ExpenseResponse> getAll() {
        return expenseRepository.findAll()
                .stream()
                .map(ExpenseResponse::from)
                .collect(Collectors.toList());
    }
}
