using Microsoft.AspNetCore.Mvc;
using PersonalLifeOS.Application.DTOs;
using PersonalLifeOS.Infrastructure.FileStorage;
using PersonalLifeOS.Infrastructure.Services;

namespace PersonalLifeOS.API.Controllers;

public class ReceiptsController : BaseApiController
{
    // Room for the image plus the form fields
    private const long MaxRequestBytes = ImageFileRules.MaxBytes + 1024 * 1024;

    private readonly ReceiptService _receiptService;

    public ReceiptsController(ReceiptService receiptService)
    {
        _receiptService = receiptService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<ReceiptDto>>>> GetAllReceipts()
    {
        var receipts = await _receiptService.GetAllReceiptsAsync(CurrentUserId);
        return Success(receipts, $"Retrieved {receipts.Count} receipts");
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ReceiptDto>>> GetReceiptById(int id) =>
        Success(await _receiptService.GetReceiptByIdAsync(id, CurrentUserId), "Receipt retrieved successfully");

    /// <summary>Streams the receipt image to its owner. Images are never publicly reachable.</summary>
    [HttpGet("{id}/image")]
    public async Task<IActionResult> GetReceiptImage(int id)
    {
        var image = await _receiptService.GetReceiptImageAsync(id, CurrentUserId);
        Response.Headers.CacheControl = "private, max-age=3600";
        return File(image.Content, image.ContentType);
    }

    [HttpPost]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(MaxRequestBytes)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxRequestBytes)]
    public async Task<ActionResult<ApiResponse<ReceiptDto>>> CreateReceipt([FromForm] CreateReceiptDto dto, IFormFile imageFile)
    {
        var receipt = await _receiptService.CreateReceiptAsync(dto, imageFile, CurrentUserId);
        return CreatedAtAction(nameof(GetReceiptById), new { id = receipt.Id },
            ApiResponse<ReceiptDto>.SuccessResponse(receipt, "Receipt created successfully"));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> UpdateReceipt(int id, [FromBody] UpdateReceiptDto dto)
    {
        if (id != dto.Id) return IdMismatch();
        await _receiptService.UpdateReceiptAsync(dto, CurrentUserId);
        return Success("Receipt updated successfully");
    }

    [HttpPut("{id}/image")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(MaxRequestBytes)]
    [RequestFormLimits(MultipartBodyLengthLimit = MaxRequestBytes)]
    public async Task<ActionResult<ApiResponse<object>>> UpdateReceiptImage(int id, IFormFile imageFile)
    {
        await _receiptService.UpdateReceiptImageAsync(id, imageFile, CurrentUserId);
        return Success("Receipt image updated successfully");
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<object>>> DeleteReceipt(int id)
    {
        await _receiptService.DeleteReceiptAsync(id, CurrentUserId);
        return Success("Receipt deleted successfully");
    }
}
