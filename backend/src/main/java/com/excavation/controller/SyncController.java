package com.excavation.controller;

import com.excavation.dto.ApiResponse;
import com.excavation.entity.SyncRecord;
import com.excavation.service.SyncService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/sync")
public class SyncController {

    private static final Logger log = LoggerFactory.getLogger(SyncController.class);

    @Autowired
    private SyncService syncService;

    @GetMapping("/status")
    public ApiResponse<Map<String, Long>> getStatus() {
        try {
            log.debug("GET /sync/status - 返回各表的未同步数量统计");
            Map<String, Long> status = syncService.getSyncStatus();
            return ApiResponse.success(status);
        } catch (Exception e) {
            log.error("获取同步状态失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/pending")
    public ApiResponse<Map<String, List<SyncRecord>>> getPending() {
        try {
            log.debug("GET /sync/pending - 返回待同步记录列表");
            Map<String, List<SyncRecord>> pending = syncService.getPendingRecords();
            return ApiResponse.success(pending);
        } catch (Exception e) {
            log.error("获取待同步记录失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/mark-synced")
    public ApiResponse<Void> markSynced(@RequestParam String tableName) {
        try {
            log.debug("POST /sync/mark-synced - 标记表{}的记录为已同步", tableName);
            syncService.markSynced(tableName);
            return ApiResponse.success();
        } catch (Exception e) {
            log.error("标记同步失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @PostMapping("/upload/batch")
    public ApiResponse<Map<String, Object>> batchUpload(@RequestBody Map<String, List<?>> data) {
        try {
            log.debug("POST /sync/upload/batch - 批量上传数据, 表数量={}", data.size());
            Map<String, Object> result = syncService.batchUpload(data);
            return ApiResponse.success(result);
        } catch (Exception e) {
            log.error("批量上传数据失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }

    @GetMapping("/download/all")
    public ApiResponse<Map<String, List<?>>> downloadAll() {
        try {
            log.debug("GET /sync/download/all - 下载所有表的全量数据");
            Map<String, List<?>> data = syncService.downloadAll();
            return ApiResponse.success(data);
        } catch (Exception e) {
            log.error("下载全量数据失败", e);
            return ApiResponse.error(e.getMessage());
        }
    }
}
