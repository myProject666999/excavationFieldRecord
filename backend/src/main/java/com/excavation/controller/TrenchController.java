package com.excavation.controller;

import com.excavation.dto.ApiResponse;
import com.excavation.dto.PageResponse;
import com.excavation.entity.Trench;
import com.excavation.service.TrenchService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/trenches")
public class TrenchController {

    private static final Logger log = LoggerFactory.getLogger(TrenchController.class);

    @Autowired
    private TrenchService trenchService;

    @GetMapping("/")
    public ApiResponse<List<Trench>> findAll(
            @RequestParam(required = false) Long siteId) {
        try {
            log.debug("GET /trenches/ - 查询全部探方列表, siteId={}", siteId);
            List<Trench> list = trenchService.findAll(siteId);
            return ApiResponse.success(list);
        } catch (Exception e) {
            log.error("查询探方列表失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/page")
    public ApiResponse<PageResponse<Trench>> findPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long siteId) {
        try {
            log.debug("GET /trenches/page - 分页查询探方列表, page={}, size={}, siteId={}", page, size, siteId);
            PageResponse<Trench> result = trenchService.findPage(page, size, siteId);
            return ApiResponse.success(result);
        } catch (Exception e) {
            log.error("分页查询探方列表失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ApiResponse<Trench> findById(@PathVariable Long id) {
        try {
            log.debug("GET /trenches/{} - 根据ID查询探方", id);
            Trench trench = trenchService.findById(id);
            return ApiResponse.success(trench);
        } catch (Exception e) {
            log.error("根据ID查询探方失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/code/{code}")
    public ApiResponse<Trench> findByCode(@PathVariable String code) {
        try {
            log.debug("GET /trenches/code/{} - 根据探方编号查询", code);
            Trench trench = trenchService.findByCode(code);
            return ApiResponse.success(trench);
        } catch (Exception e) {
            log.error("根据探方编号查询失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/site/{siteId}")
    public ApiResponse<List<Trench>> findBySiteId(@PathVariable Long siteId) {
        try {
            log.debug("GET /trenches/site/{} - 根据遗址ID查询探方", siteId);
            List<Trench> list = trenchService.findBySiteId(siteId);
            return ApiResponse.success(list);
        } catch (Exception e) {
            log.error("根据遗址ID查询探方失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/")
    public ApiResponse<Trench> save(@RequestBody Trench trench) {
        try {
            log.debug("POST /trenches/ - 新增探方, trenchCode={}", trench.getTrenchCode());
            Trench result = trenchService.save(trench);
            return ApiResponse.success(result);
        } catch (Exception e) {
            log.error("新增探方失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ApiResponse<Trench> update(@PathVariable Long id, @RequestBody Trench trench) {
        try {
            log.debug("PUT /trenches/{} - 修改探方", id);
            Trench result = trenchService.update(id, trench);
            return ApiResponse.success(result);
        } catch (Exception e) {
            log.error("修改探方失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        try {
            log.debug("DELETE /trenches/{} - 删除探方", id);
            trenchService.delete(id);
            return ApiResponse.success();
        } catch (Exception e) {
            log.error("删除探方失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }
}
