using PersonalLifeOS.Domain.Entities;
using PersonalLifeOS.Infrastructure.Persistence;

namespace PersonalLifeOS.Infrastructure.Repositories;

public class BillRepository : UserOwnedRepository<Bill>
{
    public BillRepository(ApplicationDbContext context) : base(context) { }

    protected override IOrderedQueryable<Bill> Order(IQueryable<Bill> query) =>
        query.OrderBy(b => b.DueDate);
}
