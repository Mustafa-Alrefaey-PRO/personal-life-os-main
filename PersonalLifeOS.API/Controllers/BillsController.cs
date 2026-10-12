using Microsoft.AspNetCore.Mvc;
using PersonalLifeOS.Application.DTOs;
using PersonalLifeOS.Infrastructure.Services;

namespace PersonalLifeOS.API.Controllers;

public class BillsController : BaseApiController
{
    private readonly BillService _billService;

    public BillsController(BillService billService)
    {
        _billService = billService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<BillDto>>>> GetAllBills()
    {
        var bills = await _billService.GetAllBillsAsync(CurrentUserId);
        return Success(bills, $"Retrieved {bills.Count} bills");
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<BillDto>>> GetBillById(int id) =>
        Success(await _billService.GetBillByIdAsync(id, CurrentUserId), "Bill retrieved successfully");

    [HttpPost]
    public async Task<ActionResult<ApiResponse<BillDto>>> CreateBill([FromBody] CreateBillDto dto)
    {
        var bill = await _billService.CreateBillAsync(dto, CurrentUserId);
        return CreatedAtAction(nameof(GetBillById), new { id = bill.Id },
            ApiResponse<BillDto>.SuccessResponse(bill, "Bill created successfully"));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateBill(int id, [FromBody] UpdateBillDto dto)
    {
        if (id != dto.Id) return IdMismatch();
        await _billService.UpdateBillAsync(dto, CurrentUserId);
        return Success("Bill updated successfully");
    }

    [HttpPost("{id}/pay")]
    public async Task<ActionResult<ApiResponse<object>>> MarkAsPaid(int id)
    {
        await _billService.MarkBillAsPaidAsync(id, CurrentUserId);
        return Success("Bill marked as paid");
    }

    [HttpPost("{id}/unpay")]
    public async Task<ActionResult<ApiResponse<object>>> MarkAsUnpaid(int id)
    {
        await _billService.MarkBillAsUnpaidAsync(id, CurrentUserId);
        return Success("Bill marked as unpaid");
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteBill(int id)
    {
        await _billService.DeleteBillAsync(id, CurrentUserId);
        return Success("Bill deleted successfully");
    }
}
