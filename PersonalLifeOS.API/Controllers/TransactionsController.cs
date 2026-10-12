using Microsoft.AspNetCore.Mvc;
using PersonalLifeOS.Application.DTOs;
using PersonalLifeOS.Infrastructure.Services;

namespace PersonalLifeOS.API.Controllers;

public class TransactionsController : BaseApiController
{
    private readonly TransactionService _transactionService;

    public TransactionsController(TransactionService transactionService)
    {
        _transactionService = transactionService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<TransactionDto>>>> GetAllTransactions()
    {
        var transactions = await _transactionService.GetAllTransactionsAsync(CurrentUserId);
        return Success(transactions, $"Retrieved {transactions.Count} transactions");
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<TransactionDto>>> GetTransactionById(int id) =>
        Success(await _transactionService.GetTransactionByIdAsync(id, CurrentUserId), "Transaction retrieved successfully");

    [HttpPost]
    public async Task<ActionResult<ApiResponse<TransactionDto>>> CreateTransaction([FromBody] CreateTransactionDto dto)
    {
        var transaction = await _transactionService.CreateTransactionAsync(dto, CurrentUserId);
        return CreatedAtAction(nameof(GetTransactionById), new { id = transaction.Id },
            ApiResponse<TransactionDto>.SuccessResponse(transaction, "Transaction created successfully"));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateTransaction(int id, [FromBody] UpdateTransactionDto dto)
    {
        if (id != dto.Id) return IdMismatch();
        await _transactionService.UpdateTransactionAsync(dto, CurrentUserId);
        return Success("Transaction updated successfully");
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteTransaction(int id)
    {
        await _transactionService.DeleteTransactionAsync(id, CurrentUserId);
        return Success("Transaction deleted successfully");
    }
}
