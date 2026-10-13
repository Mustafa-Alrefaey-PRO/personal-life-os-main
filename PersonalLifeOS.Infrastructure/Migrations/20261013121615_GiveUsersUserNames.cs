using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PersonalLifeOS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class GiveUsersUserNames : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Accounts registered before usernames used their email as the username.
            // Give each the part before the "@" (numbered where two would collide),
            // so they can sign in with a username; email keeps working too.
            migrationBuilder.Sql("""
                WITH named AS (
                    SELECT Id,
                           LOWER(LEFT(LEFT(Email, CHARINDEX('@', Email + '@') - 1), 28)) AS Base,
                           ROW_NUMBER() OVER (
                               PARTITION BY LOWER(LEFT(LEFT(Email, CHARINDEX('@', Email + '@') - 1), 28))
                               ORDER BY CreatedDate, Id) AS Seq
                    FROM AspNetUsers
                    WHERE UserName = Email
                )
                UPDATE u
                SET UserName = n.Base + CASE WHEN n.Seq = 1 THEN '' ELSE '-' + CAST(n.Seq AS nvarchar(3)) END,
                    NormalizedUserName = UPPER(n.Base + CASE WHEN n.Seq = 1 THEN '' ELSE '-' + CAST(n.Seq AS nvarchar(3)) END)
                FROM AspNetUsers u
                JOIN named n ON n.Id = u.Id
                WHERE NOT EXISTS (
                    SELECT 1 FROM AspNetUsers other
                    WHERE other.Id <> u.Id
                      AND other.NormalizedUserName = UPPER(n.Base + CASE WHEN n.Seq = 1 THEN '' ELSE '-' + CAST(n.Seq AS nvarchar(3)) END));
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
