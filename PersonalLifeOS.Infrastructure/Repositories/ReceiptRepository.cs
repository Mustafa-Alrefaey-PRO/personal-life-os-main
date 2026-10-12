using PersonalLifeOS.Domain.Entities;
using PersonalLifeOS.Infrastructure.Persistence;

namespace PersonalLifeOS.Infrastructure.Repositories;

public class ReceiptRepository : UserOwnedRepository<Receipt>
{
    public ReceiptRepository(ApplicationDbContext context) : base(context) { }

    protected override IOrderedQueryable<Receipt> Order(IQueryable<Receipt> query) =>
        query.OrderByDescending(r => r.Date);
}
