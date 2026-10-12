using PersonalLifeOS.Application.DTOs;
using PersonalLifeOS.Domain.Entities;
using PersonalLifeOS.Domain.Enums;
using PersonalLifeOS.Infrastructure.Repositories;

namespace PersonalLifeOS.Infrastructure.Services;

public class JournalService
{
    private readonly JournalRepository _repository;

    public JournalService(JournalRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<JournalDto>> GetAllJournalsAsync(string userId)
    {
        var journals = await _repository.GetAllByUserIdAsync(userId);
        return journals.Select(MapToDto).ToList();
    }

    public async Task<JournalDto> GetJournalByIdAsync(int id, string userId) =>
        MapToDto(await GetOwnedAsync(id, userId));

    public async Task<JournalDto> CreateJournalAsync(CreateJournalDto dto, string userId)
    {
        var journal = new DailyJournal
        {
            Date = dto.Date.Date,
            Notes = dto.Notes,
            UserId = userId,
            CreatedBy = userId,
            StatusCode = GeneralStatuses.ACTIVE
        };
        var created = await _repository.AddAsync(journal);
        return MapToDto(created);
    }

    public async Task UpdateJournalAsync(UpdateJournalDto dto, string userId)
    {
        var journal = await GetOwnedAsync(dto.Id, userId);
        journal.Date = dto.Date.Date;
        journal.Notes = dto.Notes;
        await _repository.UpdateAsync(journal, userId);
    }

    public async Task DeleteJournalAsync(int id, string userId) =>
        await _repository.SoftDeleteAsync(await GetOwnedAsync(id, userId), userId);

    private async Task<DailyJournal> GetOwnedAsync(int id, string userId) =>
        await _repository.GetByIdAsync(id, userId)
            ?? throw new KeyNotFoundException($"Journal entry with ID {id} does not exist");

    internal static JournalDto MapToDto(DailyJournal j) => new()
    {
        Id = j.Id,
        Date = j.Date,
        Notes = j.Notes,
        StatusCode = j.StatusCode,
        CreatedDate = j.CreatedDate
    };
}
