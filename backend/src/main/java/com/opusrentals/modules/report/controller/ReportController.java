package com.opusrentals.modules.report.controller;

import com.opusrentals.modules.report.dto.response.DashboardSummaryResponse;
import com.opusrentals.modules.report.service.ReportService;
import com.opusrentals.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/reports")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@Tag(name = "Analytics & Reports (Admin)", description = "Endpoints for platform metrics, financial analytics, and usage reports")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get platform dashboard metrics (Admin only)", description = "Returns aggregated totals, monthly revenue trends, and top rented equipment")
    public ResponseEntity<ApiResponse<DashboardSummaryResponse>> getDashboardSummary() {
        DashboardSummaryResponse summary = reportService.getDashboardSummary();
        return ResponseEntity.ok(ApiResponse.ok("Métricas de la plataforma obtenidas exitosamente", summary));
    }
}
