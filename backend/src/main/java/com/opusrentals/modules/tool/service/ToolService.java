package com.opusrentals.modules.tool.service;

import com.opusrentals.modules.tool.dto.request.CreateToolRequest;
import com.opusrentals.modules.tool.dto.request.UpdateToolRequest;
import com.opusrentals.modules.tool.dto.response.ToolResponse;
import com.opusrentals.modules.tool.entity.Category;
import com.opusrentals.modules.tool.entity.Tool;
import com.opusrentals.modules.tool.entity.ToolImage;
import com.opusrentals.modules.tool.entity.ToolSpecification;
import com.opusrentals.modules.tool.repository.CategoryRepository;
import com.opusrentals.modules.tool.repository.ToolRepository;
import com.opusrentals.modules.user.entity.Provider;
import com.opusrentals.modules.user.repository.ProviderRepository;
import com.opusrentals.modules.user.repository.UserRepository;
import com.opusrentals.shared.exception.BadRequestException;
import com.opusrentals.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ToolService {

    private final ToolRepository toolRepository;
    private final CategoryRepository categoryRepository;
    private final ProviderRepository providerRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ToolResponse> searchTools(Long categoryId, String status, String search) {
        return toolRepository.searchTools(categoryId, status, search).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ToolResponse> getToolsByProvider(Long providerId) {
        return toolRepository.findByProviderId(providerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ToolResponse getToolById(Long id) {
        Tool tool = toolRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Herramienta no encontrada con ID: " + id));
        return mapToResponse(tool);
    }

    @Transactional
    public ToolResponse createTool(String userEmail, CreateToolRequest request) {
        var user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Provider provider;
        if ("ROLE_ADMIN".equals(user.getRole().getName())) {
            if (request.getProviderId() != null) {
                provider = providerRepository.findById(request.getProviderId())
                        .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con ID: " + request.getProviderId()));
            } else {
                provider = providerRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new BadRequestException("No hay proveedores registrados en la plataforma"));
            }
        } else {
            provider = providerRepository.findByUser(user)
                    .orElseThrow(() -> new BadRequestException("Solo un proveedor registrado puede agregar herramientas"));
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con ID: " + request.getCategoryId()));

        Tool tool = Tool.builder()
                .provider(provider)
                .category(category)
                .name(request.getName())
                .brand(request.getBrand())
                .model(request.getModel())
                .dailyPrice(request.getDailyPrice())
                .depositAmount(request.getDepositAmount())
                .status("AVAILABLE")
                .images(new ArrayList<>())
                .specifications(new ArrayList<>())
                .build();

        if (request.getImages() != null && !request.getImages().isEmpty()) {
            boolean hasCover = false;
            for (var img : request.getImages()) {
                boolean isCover = Boolean.TRUE.equals(img.getIsCover());
                if (isCover && !hasCover) {
                    hasCover = true;
                } else if (isCover) {
                    isCover = false; // Solo una foto de portada
                }
                tool.getImages().add(ToolImage.builder()
                        .tool(tool)
                        .imageUrl(img.getImageUrl())
                        .isCover(isCover)
                        .build());
            }
            if (!hasCover && !tool.getImages().isEmpty()) {
                tool.getImages().get(0).setIsCover(true);
            }
        }

        if (request.getSpecifications() != null) {
            for (var spec : request.getSpecifications()) {
                tool.getSpecifications().add(ToolSpecification.builder()
                        .tool(tool)
                        .specKey(spec.getSpecKey())
                        .specValue(spec.getSpecValue())
                        .build());
            }
        }

        Tool saved = toolRepository.save(tool);
        return mapToResponse(saved);
    }

    @Transactional
    public ToolResponse updateTool(Long toolId, String userEmail, UpdateToolRequest request) {
        Tool tool = toolRepository.findById(toolId)
                .orElseThrow(() -> new ResourceNotFoundException("Herramienta no encontrada"));

        var user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (!"ROLE_ADMIN".equals(user.getRole().getName()) &&
                !tool.getProvider().getUser().getId().equals(user.getId())) {
            throw new BadRequestException("No tiene permisos para modificar esta herramienta");
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada"));
            tool.setCategory(category);
        }
        if (request.getName() != null) tool.setName(request.getName());
        if (request.getBrand() != null) tool.setBrand(request.getBrand());
        if (request.getModel() != null) tool.setModel(request.getModel());
        if (request.getDailyPrice() != null) tool.setDailyPrice(request.getDailyPrice());
        if (request.getDepositAmount() != null) tool.setDepositAmount(request.getDepositAmount());
        if (request.getStatus() != null) tool.setStatus(request.getStatus());

        if (request.getImages() != null) {
            tool.getImages().clear();
            for (var img : request.getImages()) {
                tool.getImages().add(ToolImage.builder()
                        .tool(tool)
                        .imageUrl(img.getImageUrl())
                        .isCover(Boolean.TRUE.equals(img.getIsCover()))
                        .build());
            }
        }

        if (request.getSpecifications() != null) {
            tool.getSpecifications().clear();
            for (var spec : request.getSpecifications()) {
                tool.getSpecifications().add(ToolSpecification.builder()
                        .tool(tool)
                        .specKey(spec.getSpecKey())
                        .specValue(spec.getSpecValue())
                        .build());
            }
        }

        Tool updated = toolRepository.save(tool);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteTool(Long toolId, String userEmail) {
        Tool tool = toolRepository.findById(toolId)
                .orElseThrow(() -> new ResourceNotFoundException("Herramienta no encontrada"));

        var user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (!"ROLE_ADMIN".equals(user.getRole().getName()) &&
                !tool.getProvider().getUser().getId().equals(user.getId())) {
            throw new BadRequestException("No tiene permisos para eliminar esta herramienta");
        }

        toolRepository.delete(tool);
    }

    private ToolResponse mapToResponse(Tool tool) {
        String coverUrl = null;
        if (tool.getImages() != null && !tool.getImages().isEmpty()) {
            coverUrl = tool.getImages().stream()
                    .filter(ToolImage::getIsCover)
                    .map(ToolImage::getImageUrl)
                    .findFirst()
                    .orElse(tool.getImages().get(0).getImageUrl());
        }

        List<ToolResponse.ImageResponse> images = tool.getImages() != null
                ? tool.getImages().stream()
                .map(i -> new ToolResponse.ImageResponse(i.getId(), i.getImageUrl(), i.getIsCover()))
                .collect(Collectors.toList())
                : List.of();

        List<ToolResponse.SpecificationResponse> specs = tool.getSpecifications() != null
                ? tool.getSpecifications().stream()
                .map(s -> new ToolResponse.SpecificationResponse(s.getId(), s.getSpecKey(), s.getSpecValue()))
                .collect(Collectors.toList())
                : List.of();

        return ToolResponse.builder()
                .id(tool.getId())
                .providerId(tool.getProvider().getId())
                .providerCompanyName(tool.getProvider().getCompanyName())
                .categoryId(tool.getCategory().getId())
                .categoryName(tool.getCategory().getName())
                .name(tool.getName())
                .brand(tool.getBrand())
                .model(tool.getModel())
                .dailyPrice(tool.getDailyPrice())
                .depositAmount(tool.getDepositAmount())
                .status(tool.getStatus())
                .createdAt(tool.getCreatedAt())
                .coverImageUrl(coverUrl)
                .images(images)
                .specifications(specs)
                .build();
    }
}
