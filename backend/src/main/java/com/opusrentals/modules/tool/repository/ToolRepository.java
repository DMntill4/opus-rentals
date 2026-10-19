package com.opusrentals.modules.tool.repository;

import com.opusrentals.modules.tool.entity.Tool;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ToolRepository extends JpaRepository<Tool, Long> {

    List<Tool> findByProviderId(Long providerId);

    long countByProviderId(Long providerId);

    List<Tool> findByStatus(String status);

    List<Tool> findByCategoryId(Long categoryId);

    @Query("SELECT t FROM Tool t WHERE " +
           "(:categoryId IS NULL OR t.category.id = :categoryId) AND " +
           "(:status IS NULL OR t.status = :status) AND " +
           "(:search IS NULL OR LOWER(t.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(t.brand) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(t.model) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Tool> searchTools(@Param("categoryId") Long categoryId,
                           @Param("status") String status,
                           @Param("search") String search);
}
