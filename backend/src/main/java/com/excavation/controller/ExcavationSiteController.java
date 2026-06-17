package com.excavation.controller;

import com.excavation.dto.ApiResponse;
import com.excavation.dto.PageResponse;
import com.excavation.entity.ExcavationSite;
import com.excavation.service.ExcavationSiteService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sites")
public class ExcavationSiteController {

    private static final Logger log = LoggerFactory.getLogger(ExcavationSiteController.class);

    @Autowired
    private ExcavationSiteService excavationSiteService;

    @GetMapping("/")
    public ApiResponse<List<ExcavationSite>> findAll() {
        try {
            log.debug("GET /sites/ - 查询全部遗址列表");
            List<ExcavationSite> list = excavationSiteService.findAll();
            return ApiResponse.success(list);
        } catch (Exception e) {
            log.error("查询遗址列表失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/page")
    public ApiResponse<PageResponse<ExcavationSite>> findPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            log.debug("GET /sites/page - 分页查询遗址列表, page={}, size={}", page, size);
            PageResponse<ExcavationSite> result = excavationSiteService.findPage(page, size);
            return ApiResponse.success(result);
        } catch (Exception e) {
            log.error("分页查询遗址列表失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ApiResponse<ExcavationSite> findById(@PathVariable Long id) {
        try {
            log.debug("GET /sites/{} - 根据ID查询遗址", id);
            ExcavationSite site = excavationSiteService.findById(id);
            return ApiResponse.success(site);
        } catch (Exception e) {
            log.error("根据ID查询遗址失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/")
    public ApiResponse<ExcavationSite> save(@RequestBody ExcavationSite site) {
        try {
            log.debug("POST /sites/ - 新增遗址, siteCode={}", site.getSiteCode());
            ExcavationSite result = excavationSiteService.save(site);
            return ApiResponse.success(result);
        } catch (Exception e) {
            log.error("新增遗址失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ApiResponse<ExcavationSite> update(@PathVariable Long id, @RequestBody ExcavationSite site) {
        try {
            log.debug("PUT /sites/{} - 修改遗址", id);
            ExcavationSite result = excavationSiteService.update(id, site);
            return ApiResponse.success(result);
        } catch (Exception e) {
            log.error("修改遗址失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        try {
            log.debug("DELETE /sites/{} - 删除遗址", id);
            excavationSiteService.delete(id);
            return ApiResponse.success();
        } catch (Exception e) {
            log.error("删除遗址失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }
}
