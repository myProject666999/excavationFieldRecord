package com.excavation.controller;

import com.excavation.dto.ApiResponse;
import com.excavation.dto.PageResponse;
import com.excavation.entity.Stratigraphy;
import com.excavation.entity.StratigraphyLayer;
import com.excavation.service.StratigraphyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/stratigraphies")
public class StratigraphyController {

    private static final Logger log = LoggerFactory.getLogger(StratigraphyController.class);

    @Autowired
    private StratigraphyService stratigraphyService;

    @GetMapping("/")
    public ApiResponse<List<Stratigraphy>> findAll(
            @RequestParam(required = false) Long trenchId,
            @RequestParam(required = false) Long siteId) {
        try {
            log.debug("GET /stratigraphies/ - 查询全部剖面列表, trenchId={}, siteId={}", trenchId, siteId);
            List<Stratigraphy> list = stratigraphyService.findAll(trenchId, siteId);
            return ApiResponse.success(list);
        } catch (Exception e) {
            log.error("查询剖面列表失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/page")
    public ApiResponse<PageResponse<Stratigraphy>> findPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long trenchId,
            @RequestParam(required = false) Long siteId) {
        try {
            log.debug("GET /stratigraphies/page - 分页查询剖面列表, page={}, size={}, trenchId={}, siteId={}",
                    page, size, trenchId, siteId);
            PageResponse<Stratigraphy> result = stratigraphyService.findPage(page, size, trenchId, siteId);
            return ApiResponse.success(result);
        } catch (Exception e) {
            log.error("分页查询剖面列表失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ApiResponse<Stratigraphy> findById(@PathVariable Long id) {
        try {
            log.debug("GET /stratigraphies/{} - 根据ID查询剖面", id);
            Stratigraphy stratigraphy = stratigraphyService.findById(id);
            return ApiResponse.success(stratigraphy);
        } catch (Exception e) {
            log.error("根据ID查询剖面失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/trench/{trenchId}")
    public ApiResponse<List<Stratigraphy>> findByTrenchId(@PathVariable Long trenchId) {
        try {
            log.debug("GET /stratigraphies/trench/{} - 根据探方ID查询剖面", trenchId);
            List<Stratigraphy> list = stratigraphyService.findByTrenchId(trenchId);
            return ApiResponse.success(list);
        } catch (Exception e) {
            log.error("根据探方ID查询剖面失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/site/{siteId}")
    public ApiResponse<List<Stratigraphy>> findBySiteId(@PathVariable Long siteId) {
        try {
            log.debug("GET /stratigraphies/site/{} - 根据遗址ID查询剖面", siteId);
            List<Stratigraphy> list = stratigraphyService.findBySiteId(siteId);
            return ApiResponse.success(list);
        } catch (Exception e) {
            log.error("根据遗址ID查询剖面失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/{id}/layers")
    public ApiResponse<List<StratigraphyLayer>> findLayers(@PathVariable Long id) {
        try {
            log.debug("GET /stratigraphies/{}/layers - 获取剖面的所有分层", id);
            List<StratigraphyLayer> list = stratigraphyService.findLayersByStratigraphyId(id);
            return ApiResponse.success(list);
        } catch (Exception e) {
            log.error("获取剖面分层失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/{id}/layers")
    public ApiResponse<StratigraphyLayer> addLayer(@PathVariable Long id, @RequestBody StratigraphyLayer layer) {
        try {
            log.debug("POST /stratigraphies/{}/layers - 为剖面添加分层, layerNumber={}", id, layer.getLayerNumber());
            StratigraphyLayer result = stratigraphyService.addLayer(id, layer);
            return ApiResponse.success(result);
        } catch (Exception e) {
            log.error("为剖面添加分层失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/")
    public ApiResponse<Stratigraphy> save(@RequestBody Stratigraphy stratigraphy) {
        try {
            log.debug("POST /stratigraphies/ - 新增剖面, stratigraphyCode={}", stratigraphy.getStratigraphyCode());
            Stratigraphy result = stratigraphyService.save(stratigraphy);
            return ApiResponse.success(result);
        } catch (Exception e) {
            log.error("新增剖面失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ApiResponse<Stratigraphy> update(@PathVariable Long id, @RequestBody Stratigraphy stratigraphy) {
        try {
            log.debug("PUT /stratigraphies/{} - 修改剖面", id);
            Stratigraphy result = stratigraphyService.update(id, stratigraphy);
            return ApiResponse.success(result);
        } catch (Exception e) {
            log.error("修改剖面失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        try {
            log.debug("DELETE /stratigraphies/{} - 删除剖面", id);
            stratigraphyService.delete(id);
            return ApiResponse.success();
        } catch (Exception e) {
            log.error("删除剖面失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }
}
