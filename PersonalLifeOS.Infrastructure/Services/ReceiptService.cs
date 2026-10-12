using Microsoft.AspNetCore.Http;
using PersonalLifeOS.Application.DTOs;
using PersonalLifeOS.Domain.Entities;
using PersonalLifeOS.Domain.Enums;
using PersonalLifeOS.Infrastructure.FileStorage;
using PersonalLifeOS.Infrastructure.Repositories;

namespace PersonalLifeOS.Infrastructure.Services;

public class ReceiptService
{
    private readonly ReceiptRepository _repository;
    private readonly IFileStorage _storage;

    public ReceiptService(ReceiptRepository repository, IFileStorage storage)
    {
        _repository = repository;
        _storage = storage;
    }

    public async Task<List<ReceiptDto>> GetAllReceiptsAsync(string userId)
    {
        var receipts = await _repository.GetAllByUserIdAsync(userId);
        return receipts.Select(MapToDto).ToList();
    }

    public async Task<ReceiptDto> GetReceiptByIdAsync(int id, string userId) =>
        MapToDto(await GetOwnedAsync(id, userId));

    public async Task<StoredFile> GetReceiptImageAsync(int id, string userId)
    {
        var receipt = await GetOwnedAsync(id, userId);
        return await _storage.OpenReadAsync(receipt.ImagePath)
            ?? throw new KeyNotFoundException($"Image for receipt {id} does not exist");
    }

    public async Task<ReceiptDto> CreateReceiptAsync(CreateReceiptDto dto, IFormFile imageFile, string userId)
    {
        var fileId = await SaveImageAsync(imageFile);

        var receipt = new Receipt
        {
            Title = dto.Title,
            Amount = dto.Amount,
            Date = dto.Date,
            Category = dto.Category,
            ImagePath = fileId,
            UserId = userId,
            CreatedBy = userId,
            StatusCode = GeneralStatuses.ACTIVE
        };

        try
        {
            var created = await _repository.AddAsync(receipt);
            return MapToDto(created);
        }
        catch
        {
            // Don't leave an orphaned file if the row could not be saved
            await _storage.DeleteAsync(fileId);
            throw;
        }
    }

    public async Task UpdateReceiptAsync(UpdateReceiptDto dto, string userId)
    {
        var receipt = await GetOwnedAsync(dto.Id, userId);
        receipt.Title = dto.Title;
        receipt.Amount = dto.Amount;
        receipt.Date = dto.Date;
        receipt.Category = dto.Category;
        await _repository.UpdateAsync(receipt, userId);
    }

    public async Task UpdateReceiptImageAsync(int id, IFormFile imageFile, string userId)
    {
        var receipt = await GetOwnedAsync(id, userId);

        // Upload the new image first so a failed upload never loses the old one
        var oldFileId = receipt.ImagePath;
        receipt.ImagePath = await SaveImageAsync(imageFile);
        await _repository.UpdateAsync(receipt, userId);
        await _storage.DeleteAsync(oldFileId);
    }

    public async Task DeleteReceiptAsync(int id, string userId)
    {
        var receipt = await GetOwnedAsync(id, userId);
        await _repository.SoftDeleteAsync(receipt, userId);
        await _storage.DeleteAsync(receipt.ImagePath);
    }

    private async Task<string> SaveImageAsync(IFormFile imageFile)
    {
        ImageFileRules.Validate(imageFile.FileName, imageFile.ContentType, imageFile.Length);
        await using var stream = imageFile.OpenReadStream();
        return await _storage.SaveAsync(stream, imageFile.FileName, imageFile.ContentType);
    }

    private async Task<Receipt> GetOwnedAsync(int id, string userId) =>
        await _repository.GetByIdAsync(id, userId)
            ?? throw new KeyNotFoundException($"Receipt with ID {id} does not exist");

    internal static ReceiptDto MapToDto(Receipt r) => new()
    {
        Id = r.Id,
        Title = r.Title,
        Amount = r.Amount,
        Date = r.Date,
        Category = r.Category,
        HasImage = !string.IsNullOrEmpty(r.ImagePath),
        StatusCode = r.StatusCode,
        CreatedDate = r.CreatedDate
    };
}
