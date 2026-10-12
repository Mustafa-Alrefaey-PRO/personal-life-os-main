using Microsoft.EntityFrameworkCore;
using PersonalLifeOS.Domain.Common;
using PersonalLifeOS.Domain.Enums;
using PersonalLifeOS.Infrastructure.Persistence;

namespace PersonalLifeOS.Infrastructure.Repositories;

/// <summary>
/// Data access for entities owned by a single user. Every query is scoped to the user and
/// excludes soft-deleted rows, so callers never see another user's data.
/// </summary>
public abstract class UserOwnedRepository<T> where T : class, IUserOwnedEntity
{
    protected readonly ApplicationDbContext Context;

    protected UserOwnedRepository(ApplicationDbContext context)
    {
        Context = context;
    }

    /// <summary>Non-deleted rows belonging to the user.</summary>
    protected IQueryable<T> Active(string userId) =>
        Context.Set<T>().Where(e => e.UserId == userId && e.StatusCode != GeneralStatuses.DELETED);

    /// <summary>Default ordering for list views.</summary>
    protected abstract IOrderedQueryable<T> Order(IQueryable<T> query);

    public Task<List<T>> GetAllByUserIdAsync(string userId) =>
        Order(Active(userId)).ToListAsync();

    public Task<T?> GetByIdAsync(int id, string userId) =>
        Active(userId).FirstOrDefaultAsync(e => e.Id == id);

    public async Task<T> AddAsync(T entity)
    {
        entity.CreatedDate = DateTime.UtcNow;
        Context.Set<T>().Add(entity);
        await Context.SaveChangesAsync();
        return entity;
    }

    /// <summary>Saves changes to an entity loaded through this repository.</summary>
    public async Task UpdateAsync(T entity, string userId)
    {
        entity.UpdatedBy = userId;
        entity.UpdatedDate = DateTime.UtcNow;
        await Context.SaveChangesAsync();
    }

    public Task SoftDeleteAsync(T entity, string userId)
    {
        entity.StatusCode = GeneralStatuses.DELETED;
        return UpdateAsync(entity, userId);
    }
}
