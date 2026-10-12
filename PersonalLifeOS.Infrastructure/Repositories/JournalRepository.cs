using PersonalLifeOS.Domain.Entities;
using PersonalLifeOS.Infrastructure.Persistence;

namespace PersonalLifeOS.Infrastructure.Repositories;

public class JournalRepository : UserOwnedRepository<DailyJournal>
{
    public JournalRepository(ApplicationDbContext context) : base(context) { }

    protected override IOrderedQueryable<DailyJournal> Order(IQueryable<DailyJournal> query) =>
        query.OrderByDescending(j => j.Date).ThenByDescending(j => j.CreatedDate);
}
