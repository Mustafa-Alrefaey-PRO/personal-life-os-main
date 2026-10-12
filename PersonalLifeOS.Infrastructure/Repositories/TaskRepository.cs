using PersonalLifeOS.Domain.Entities;
using PersonalLifeOS.Infrastructure.Persistence;

namespace PersonalLifeOS.Infrastructure.Repositories;

public class TaskRepository : UserOwnedRepository<TaskEntity>
{
    public TaskRepository(ApplicationDbContext context) : base(context) { }

    protected override IOrderedQueryable<TaskEntity> Order(IQueryable<TaskEntity> query) =>
        query.OrderByDescending(t => t.CreatedDate);
}
