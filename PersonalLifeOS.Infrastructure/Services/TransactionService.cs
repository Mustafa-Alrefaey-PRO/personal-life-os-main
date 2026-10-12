using PersonalLifeOS.Application.DTOs;
using PersonalLifeOS.Domain.Entities;
using PersonalLifeOS.Domain.Enums;
using PersonalLifeOS.Infrastructure.Repositories;

namespace PersonalLifeOS.Infrastructure.Services;

public class TransactionService
{
    private readonly TransactionRepository _repository;

    public TransactionService(TransactionRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<TransactionDto>> GetAllTransactionsAsync(string userId)
    {
        var transactions = await _repository.GetAllByUserIdAsync(userId);
        return transactions.Select(MapToDto).ToList();
    }

    public async Task<TransactionDto> GetTransactionByIdAsync(int id, string userId) =>
        MapToDto(await GetOwnedAsync(id, userId));

    public async Task<TransactionDto> CreateTransactionAsync(CreateTransactionDto dto, string userId)
    {
        var transaction = new Transaction
        {
            Amount = dto.Amount,
            Type = dto.Type,
            Category = dto.Category,
            Date = dto.Date,
            Notes = dto.Notes,
            UserId = userId,
            CreatedBy = userId,
            StatusCode = GeneralStatuses.ACTIVE
        };
        var created = await _repository.AddAsync(transaction);
        return MapToDto(created);
    }

    public async Task UpdateTransactionAsync(UpdateTransactionDto dto, string userId)
    {
        var transaction = await GetOwnedAsync(dto.Id, userId);
        transaction.Amount = dto.Amount;
        transaction.Type = dto.Type;
        transaction.Category = dto.Category;
        transaction.Date = dto.Date;
        transaction.Notes = dto.Notes;
        await _repository.UpdateAsync(transaction, userId);
    }

    public async Task DeleteTransactionAsync(int id, string userId) =>
        await _repository.SoftDeleteAsync(await GetOwnedAsync(id, userId), userId);

    private async Task<Transaction> GetOwnedAsync(int id, string userId) =>
        await _repository.GetByIdAsync(id, userId)
            ?? throw new KeyNotFoundException($"Transaction with ID {id} does not exist");

    internal static TransactionDto MapToDto(Transaction t) => new()
    {
        Id = t.Id,
        Amount = t.Amount,
        Type = t.Type,
        Category = t.Category,
        Date = t.Date,
        Notes = t.Notes,
        StatusCode = t.StatusCode,
    };
}
