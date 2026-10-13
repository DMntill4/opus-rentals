package com.opusrentals.modules.tool.repository;

import com.opusrentals.modules.tool.entity.ToolImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ToolImageRepository extends JpaRepository<ToolImage, Long> {
    List<ToolImage> findByToolId(Long toolId);
}
