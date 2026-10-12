namespace PersonalLifeOS.Domain.Common;

/// <summary>
/// An entity that belongs to one user, is soft-deleted via StatusCode and carries audit fields.
/// </summary>
public interface IUserOwnedEntity
{
    int Id { get; }
    string UserId { get; set; }
    string StatusCode { get; set; }

    string CreatedBy { get; set; }
    DateTime CreatedDate { get; set; }
    string? UpdatedBy { get; set; }
    DateTime? UpdatedDate { get; set; }
}
