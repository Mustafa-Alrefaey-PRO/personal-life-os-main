using Microsoft.AspNetCore.Mvc;
using PersonalLifeOS.Application.DTOs;
using PersonalLifeOS.Infrastructure.Services;

namespace PersonalLifeOS.API.Controllers;

public class JournalController : BaseApiController
{
    private readonly JournalService _journalService;

    public JournalController(JournalService journalService)
    {
        _journalService = journalService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<JournalDto>>>> GetAllJournals()
    {
        var journals = await _journalService.GetAllJournalsAsync(CurrentUserId);
        return Success(journals, $"Retrieved {journals.Count} journal entries");
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<JournalDto>>> GetJournalById(int id) =>
        Success(await _journalService.GetJournalByIdAsync(id, CurrentUserId), "Journal entry retrieved successfully");

    [HttpPost]
    public async Task<ActionResult<ApiResponse<JournalDto>>> CreateJournal([FromBody] CreateJournalDto dto)
    {
        var journal = await _journalService.CreateJournalAsync(dto, CurrentUserId);
        return CreatedAtAction(nameof(GetJournalById), new { id = journal.Id },
            ApiResponse<JournalDto>.SuccessResponse(journal, "Journal entry created successfully"));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateJournal(int id, [FromBody] UpdateJournalDto dto)
    {
        if (id != dto.Id) return IdMismatch();
        await _journalService.UpdateJournalAsync(dto, CurrentUserId);
        return Success("Journal entry updated successfully");
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteJournal(int id)
    {
        await _journalService.DeleteJournalAsync(id, CurrentUserId);
        return Success("Journal entry deleted successfully");
    }
}
