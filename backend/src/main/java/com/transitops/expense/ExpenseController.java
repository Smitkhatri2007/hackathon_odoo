package com.transitops.expense;

import com.transitops.common.ApiResponse;
import com.transitops.expense.dto.ExpenseRequest;
import com.transitops.expense.dto.ExpenseResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ExpenseResponse>> create(@RequestBody ExpenseRequest request) {
        ExpenseResponse response = expenseService.create(request);
        return ResponseEntity.ok(ApiResponse.ok("Expense created", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getAll() {
        List<ExpenseResponse> list = expenseService.getAll();
        return ResponseEntity.ok(ApiResponse.ok("Expenses retrieved", list));
    }
}
