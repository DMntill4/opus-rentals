package com.opusrentals.modules.report.controller;

import com.opusrentals.modules.report.dto.response.DashboardSummaryResponse;
import com.opusrentals.modules.report.dto.response.FleetStatusResponse;
import com.opusrentals.modules.report.dto.response.FrequentClientResponse;
import com.opusrentals.modules.report.dto.response.TopToolResponse;
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

import java.util.List;

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

    @GetMapping("/top-tools")
    @Operation(summary = "Get top rented tools report (Admin only)", description = "Returns most rented tools ranked by total rental operations and revenue generated")
    public ResponseEntity<ApiResponse<List<TopToolResponse>>> getTopTools() {
        List<TopToolResponse> topTools = reportService.getTopTools();
        return ResponseEntity.ok(ApiResponse.ok("Reporte de herramientas más alquiladas obtenido exitosamente", topTools));
    }

    @GetMapping("/frequent-clients")
    @Operation(summary = "Get frequent clients report (Admin only)", description = "Returns clients ranking by rental frequency, active rentals, and total spend")
    public ResponseEntity<ApiResponse<List<FrequentClientResponse>>> getFrequentClients() {
        List<FrequentClientResponse> frequentClients = reportService.getFrequentClients();
        return ResponseEntity.ok(ApiResponse.ok("Reporte de clientes frecuentes obtenido exitosamente", frequentClients));
    }

    @GetMapping("/fleet-status")
    @Operation(summary = "Get fleet availability and status report (Admin only)", description = "Returns status breakdown (available, rented, maintenance, retired) and utilization metrics per category")
    public ResponseEntity<ApiResponse<FleetStatusResponse>> getFleetStatusReport() {
        FleetStatusResponse fleetStatus = reportService.getFleetStatusReport();
        return ResponseEntity.ok(ApiResponse.ok("Reporte de disponibilidad y estado de flota obtenido exitosamente", fleetStatus));
    }

    @GetMapping("/provider-quality")
    @Operation(summary = "Get provider returns, damages, warranties, and return rate report (Admin only)")
    public ResponseEntity<ApiResponse<List<com.opusrentals.modules.report.dto.response.ProviderQualityResponse>>> getProviderQualityReport() {
        List<com.opusrentals.modules.report.dto.response.ProviderQualityResponse> list = reportService.getProviderQualityReports();
        return ResponseEntity.ok(ApiResponse.ok("Reporte de calidad y devoluciones por proveedor obtenido exitosamente", list));
    }
}

