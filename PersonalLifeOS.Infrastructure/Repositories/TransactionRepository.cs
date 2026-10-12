using PersonalLifeOS.Domain.Entities;
using PersonalLifeOS.Infrastructure.Persistence;

namespace PersonalLifeOS.Infrastructure.Repositories;

public class TransactionRepository : UserOwnedRepository<Transaction>
{
    public TransactionRepository(ApplicationDbContext context) : base(context) { }

    protected override IOrderedQueryable<Transaction> Order(IQueryable<Transaction> query) =>
        query.OrderByDescending(t => t.Date);
}
