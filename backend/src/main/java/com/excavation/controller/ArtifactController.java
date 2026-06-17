package com.excavation.controller;

import com.excavation.dto.ApiResponse;
import com.excavation.dto.PageResponse;
import com.excavation.entity.Artifact;
import com.excavation.service.ArtifactService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/artifacts")
public class ArtifactController {

    private static final Logger log = LoggerFactory.getLogger(ArtifactController.class);

    @Autowired
    private ArtifactService artifactService;

    @GetMapping("/")
    public ApiResponse<List<Artifact>> findAll(
            @RequestParam(required = false) Long trenchId,
            @RequestParam(required = false) Long siteId,
            @RequestParam(required = false) String category) {
        try {
            log.debug("GET /artifacts/ - 查询全部文物列表, trenchId={}, siteId={}, category={}", trenchId, siteId, category);
            List<Artifact> list = artifactService.findAll(trenchId, siteId, category);
            return ApiResponse.success(list);
        } catch (Exception e) {
            log.error("查询文物列表失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/page")
    public ApiResponse<PageResponse<Artifact>> findPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long trenchId,
            @RequestParam(required = false) Long siteId,
            @RequestParam(required = false) String category) {
        try {
            log.debug("GET /artifacts/page - 分页查询文物列表, page={}, size={}, trenchId={}, siteId={}, category={}",
                    page, size, trenchId, siteId, category);
            PageResponse<Artifact> result = artifactService.findPage(page, size, trenchId, siteId, category);
            return ApiResponse.success(result);
        } catch (Exception e) {
            log.error("分页查询文物列表失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ApiResponse<Artifact> findById(@PathVariable Long id) {
        try {
            log.debug("GET /artifacts/{} - 根据ID查询文物", id);
            Artifact artifact = artifactService.findById(id);
            return ApiResponse.success(artifact);
        } catch (Exception e) {
            log.error("根据ID查询文物失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/trench/{trenchId}")
    public ApiResponse<List<Artifact>> findByTrenchId(@PathVariable Long trenchId) {
        try {
            log.debug("GET /artifacts/trench/{} - 根据探方ID查询文物", trenchId);
            List<Artifact> list = artifactService.findByTrenchId(trenchId);
            return ApiResponse.success(list);
        } catch (Exception e) {
            log.error("根据探方ID查询文物失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/site/{siteId}")
    public ApiResponse<List<Artifact>> findBySiteId(@PathVariable Long siteId) {
        try {
            log.debug("GET /artifacts/site/{} - 根据遗址ID查询文物", siteId);
            List<Artifact> list = artifactService.findBySiteId(siteId);
            return ApiResponse.success(list);
        } catch (Exception e) {
            log.error("根据遗址ID查询文物失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/")
    public ApiResponse<Artifact> save(@RequestBody Artifact artifact) {
        try {
            log.debug("POST /artifacts/ - 新增文物, artifactCode={}", artifact.getArtifactCode());
            Artifact result = artifactService.save(artifact);
            return ApiResponse.success(result);
        } catch (Exception e) {
            log.error("新增文物失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ApiResponse<Artifact> update(@PathVariable Long id, @RequestBody Artifact artifact) {
        try {
            log.debug("PUT /artifacts/{} - 修改文物", id);
            Artifact result = artifactService.update(id, artifact);
            return ApiResponse.success(result);
        } catch (Exception e) {
            log.error("修改文物失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        try {
            log.debug("DELETE /artifacts/{} - 删除文物", id);
            artifactService.delete(id);
            return ApiResponse.success();
        } catch (Exception e) {
            log.error("删除文物失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }
}
