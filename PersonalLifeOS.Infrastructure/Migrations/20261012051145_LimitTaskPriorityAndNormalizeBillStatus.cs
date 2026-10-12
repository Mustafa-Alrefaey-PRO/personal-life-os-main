using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PersonalLifeOS.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class LimitTaskPriorityAndNormalizeBillStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Bills used to be marked "Paid"; the constant is now GeneralStatuses.PAID
            migrationBuilder.Sql("UPDATE Bills SET StatusCode = 'PAID' WHERE StatusCode = 'Paid'");

            migrationBuilder.AlterColumn<string>(
                name: "Priority",
                table: "Tasks",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("UPDATE Bills SET StatusCode = 'Paid' WHERE StatusCode = 'PAID'");

            migrationBuilder.AlterColumn<string>(
                name: "Priority",
                table: "Tasks",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);
        }
    }
}
