package com.opusrentals.modules.tool.controller;

import com.opusrentals.modules.tool.dto.request.CreateToolRequest;
import com.opusrentals.modules.tool.dto.request.UpdateToolRequest;
import com.opusrentals.modules.tool.dto.response.ToolResponse;
import com.opusrentals.modules.tool.service.ToolService;
import com.opusrentals.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tools")
@RequiredArgsConstructor
@Tag(name = "Tools & Inventory", description = "Endpoints for equipment catalog, search, and inventory management")
public class ToolController {

    private final ToolService toolService;

    @GetMapping
    @Operation(summary = "Search and filter tools", description = "Public endpoint to query available tools by category, status, and keyword")
    public ResponseEntity<ApiResponse<List<ToolResponse>>> searchTools(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        List<ToolResponse> tools = toolService.searchTools(categoryId, status, search);
        return ResponseEntity.ok(ApiResponse.ok(tools));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get tool details by ID")
    public ResponseEntity<ApiResponse<ToolResponse>> getToolById(@PathVariable Long id) {
        ToolResponse tool = toolService.getToolById(id);
        return ResponseEntity.ok(ApiResponse.ok(tool));
    }

    @GetMapping("/provider/{providerId}")
    @Operation(summary = "Get tools by provider ID")
    public ResponseEntity<ApiResponse<List<ToolResponse>>> getToolsByProvider(@PathVariable Long providerId) {
        List<ToolResponse> tools = toolService.getToolsByProvider(providerId);
        return ResponseEntity.ok(ApiResponse.ok(tools));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_PROVIDER', 'ROLE_ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Create a new tool (Provider/Admin)")
    public ResponseEntity<ApiResponse<ToolResponse>> createTool(
            @Valid @RequestBody CreateToolRequest request,
            Authentication authentication) {
        ToolResponse created = toolService.createTool(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Herramienta creada exitosamente", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_PROVIDER', 'ROLE_ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Update an existing tool (Owner Provider/Admin)")
    public ResponseEntity<ApiResponse<ToolResponse>> updateTool(
            @PathVariable Long id,
            @Valid @RequestBody UpdateToolRequest request,
            Authentication authentication) {
        ToolResponse updated = toolService.updateTool(id, authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.ok("Herramienta actualizada exitosamente", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_PROVIDER', 'ROLE_ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Delete a tool (Owner Provider/Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteTool(
            @PathVariable Long id,
            Authentication authentication) {
        toolService.deleteTool(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Herramienta eliminada exitosamente", null));
    }
}
