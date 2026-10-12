using PersonalLifeOS.Application.DTOs;
using PersonalLifeOS.Domain.Entities;
using PersonalLifeOS.Domain.Enums;
using PersonalLifeOS.Infrastructure.Repositories;

namespace PersonalLifeOS.Infrastructure.Services;

public class TaskService
{
    private readonly TaskRepository _repository;

    public TaskService(TaskRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<TaskDto>> GetAllTasksAsync(string userId)
    {
        var tasks = await _repository.GetAllByUserIdAsync(userId);
        return tasks.Select(MapToDto).ToList();
    }

    public async Task<TaskDto> GetTaskByIdAsync(int id, string userId) =>
        MapToDto(await GetOwnedAsync(id, userId));

    public async Task<TaskDto> CreateTaskAsync(CreateTaskDto dto, string userId)
    {
        var task = new TaskEntity
        {
            Title = dto.Title,
            Description = dto.Description,
            DueDate = dto.DueDate,
            Category = dto.Category,
            Priority = NormalizePriority(dto.Priority),
            UserId = userId,
            CreatedBy = userId,
            StatusCode = GeneralStatuses.PENDING
        };
        var created = await _repository.AddAsync(task);
        return MapToDto(created);
    }

    public async Task UpdateTaskAsync(UpdateTaskDto dto, string userId)
    {
        var task = await GetOwnedAsync(dto.Id, userId);
        task.Title = dto.Title;
        task.Description = dto.Description;
        task.DueDate = dto.DueDate;
        task.Category = dto.Category;
        task.Priority = NormalizePriority(dto.Priority);
        await _repository.UpdateAsync(task, userId);
    }

    public Task CompleteTaskAsync(int id, string userId) => SetStatusAsync(id, userId, GeneralStatuses.COMPLETED);

    public Task UncompleteTaskAsync(int id, string userId) => SetStatusAsync(id, userId, GeneralStatuses.PENDING);

    public async Task DeleteTaskAsync(int id, string userId) =>
        await _repository.SoftDeleteAsync(await GetOwnedAsync(id, userId), userId);

    private async Task SetStatusAsync(int id, string userId, string statusCode)
    {
        var task = await GetOwnedAsync(id, userId);
        task.StatusCode = statusCode;
        await _repository.UpdateAsync(task, userId);
    }

    private async Task<TaskEntity> GetOwnedAsync(int id, string userId) =>
        await _repository.GetByIdAsync(id, userId)
            ?? throw new KeyNotFoundException($"Task with ID {id} does not exist");

    // The UI sends "" for "no priority"
    private static string? NormalizePriority(string? priority) =>
        string.IsNullOrWhiteSpace(priority) ? null : priority;

    internal static TaskDto MapToDto(TaskEntity t) => new()
    {
        Id = t.Id,
        Title = t.Title,
        Description = t.Description,
        DueDate = t.DueDate,
        Category = t.Category,
        Priority = t.Priority,
        StatusCode = t.StatusCode,
        CreatedDate = t.CreatedDate
    };
}
