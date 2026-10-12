using Microsoft.AspNetCore.Mvc;
using PersonalLifeOS.Application.DTOs;
using PersonalLifeOS.Infrastructure.Services;

namespace PersonalLifeOS.API.Controllers;

public class TasksController : BaseApiController
{
    private readonly TaskService _taskService;

    public TasksController(TaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<TaskDto>>>> GetAllTasks()
    {
        var tasks = await _taskService.GetAllTasksAsync(CurrentUserId);
        return Success(tasks, $"Retrieved {tasks.Count} tasks");
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<TaskDto>>> GetTaskById(int id) =>
        Success(await _taskService.GetTaskByIdAsync(id, CurrentUserId), "Task retrieved successfully");

    [HttpPost]
    public async Task<ActionResult<ApiResponse<TaskDto>>> CreateTask([FromBody] CreateTaskDto dto)
    {
        var task = await _taskService.CreateTaskAsync(dto, CurrentUserId);
        return CreatedAtAction(nameof(GetTaskById), new { id = task.Id },
            ApiResponse<TaskDto>.SuccessResponse(task, "Task created successfully"));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateTask(int id, [FromBody] UpdateTaskDto dto)
    {
        if (id != dto.Id) return IdMismatch();
        await _taskService.UpdateTaskAsync(dto, CurrentUserId);
        return Success("Task updated successfully");
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteTask(int id)
    {
        await _taskService.DeleteTaskAsync(id, CurrentUserId);
        return Success("Task deleted successfully");
    }

    [HttpPost("{id}/complete")]
    public async Task<ActionResult<ApiResponse<object>>> CompleteTask(int id)
    {
        await _taskService.CompleteTaskAsync(id, CurrentUserId);
        return Success("Task marked as complete");
    }

    [HttpPost("{id}/uncomplete")]
    public async Task<ActionResult<ApiResponse<object>>> UncompleteTask(int id)
    {
        await _taskService.UncompleteTaskAsync(id, CurrentUserId);
        return Success("Task marked as pending");
    }
}
