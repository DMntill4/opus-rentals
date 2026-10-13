package com.opusrentals.modules.tool.repository;

import com.opusrentals.modules.tool.entity.ToolSpecification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ToolSpecificationRepository extends JpaRepository<ToolSpecification, Long> {
    List<ToolSpecification> findByToolId(Long toolId);
}
