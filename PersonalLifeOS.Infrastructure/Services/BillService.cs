using PersonalLifeOS.Application.DTOs;
using PersonalLifeOS.Domain.Entities;
using PersonalLifeOS.Domain.Enums;
using PersonalLifeOS.Infrastructure.Repositories;

namespace PersonalLifeOS.Infrastructure.Services;

public class BillService
{
    private readonly BillRepository _repository;

    public BillService(BillRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<BillDto>> GetAllBillsAsync(string userId)
    {
        var bills = await _repository.GetAllByUserIdAsync(userId);
        return bills.Select(MapToDto).ToList();
    }

    public async Task<BillDto> GetBillByIdAsync(int id, string userId) =>
        MapToDto(await GetOwnedAsync(id, userId));

    public async Task<BillDto> CreateBillAsync(CreateBillDto dto, string userId)
    {
        var bill = new Bill
        {
            Name = dto.Name,
            Amount = dto.Amount,
            DueDate = dto.DueDate,
            ReminderDaysBefore = dto.ReminderDaysBefore,
            UserId = userId,
            CreatedBy = userId,
            StatusCode = GeneralStatuses.PENDING
        };
        var created = await _repository.AddAsync(bill);
        return MapToDto(created);
    }

    public async Task UpdateBillAsync(UpdateBillDto dto, string userId)
    {
        var bill = await GetOwnedAsync(dto.Id, userId);
        bill.Name = dto.Name;
        bill.Amount = dto.Amount;
        bill.DueDate = dto.DueDate;
        bill.ReminderDaysBefore = dto.ReminderDaysBefore;
        await _repository.UpdateAsync(bill, userId);
    }

    public Task MarkBillAsPaidAsync(int id, string userId) => SetStatusAsync(id, userId, GeneralStatuses.PAID);

    public Task MarkBillAsUnpaidAsync(int id, string userId) => SetStatusAsync(id, userId, GeneralStatuses.PENDING);

    public async Task DeleteBillAsync(int id, string userId) =>
        await _repository.SoftDeleteAsync(await GetOwnedAsync(id, userId), userId);

    private async Task SetStatusAsync(int id, string userId, string statusCode)
    {
        var bill = await GetOwnedAsync(id, userId);
        bill.StatusCode = statusCode;
        await _repository.UpdateAsync(bill, userId);
    }

    private async Task<Bill> GetOwnedAsync(int id, string userId) =>
        await _repository.GetByIdAsync(id, userId)
            ?? throw new KeyNotFoundException($"Bill with ID {id} does not exist");

    internal static BillDto MapToDto(Bill b) => new()
    {
        Id = b.Id,
        Name = b.Name,
        Amount = b.Amount,
        DueDate = b.DueDate,
        StatusCode = b.StatusCode,
        ReminderDaysBefore = b.ReminderDaysBefore
    };
}
