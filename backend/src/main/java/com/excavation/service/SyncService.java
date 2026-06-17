package com.excavation.service;

import com.alibaba.fastjson.JSON;
import com.excavation.entity.*;
import com.excavation.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SyncService {

    private static final Logger log = LoggerFactory.getLogger(SyncService.class);

    @Autowired
    private ExcavationSiteRepository excavationSiteRepository;

    @Autowired
    private TrenchRepository trenchRepository;

    @Autowired
    private ArtifactRepository artifactRepository;

    @Autowired
    private ArtifactPhotoRepository artifactPhotoRepository;

    @Autowired
    private StratigraphyRepository stratigraphyRepository;

    @Autowired
    private StratigraphyLayerRepository stratigraphyLayerRepository;

    @Autowired
    private StratigraphyPhotoRepository stratigraphyPhotoRepository;

    @Autowired
    private SyncRecordRepository syncRecordRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OperationLogRepository operationLogRepository;

    public Map<String, Long> getSyncStatus() {
        Map<String, Long> status = new LinkedHashMap<>();
        status.put("excavation_site", excavationSiteRepository.findAll().stream().filter(s -> s.getSyncStatus() != null && s.getSyncStatus() == 0).count());
        status.put("trench", trenchRepository.findAll().stream().filter(t -> t.getSyncStatus() != null && t.getSyncStatus() == 0).count());
        status.put("artifact", artifactRepository.findAll().stream().filter(a -> a.getSyncStatus() != null && a.getSyncStatus() == 0).count());
        status.put("artifact_photo", artifactPhotoRepository.findAll().stream().filter(p -> p.getSyncStatus() != null && p.getSyncStatus() == 0).count());
        status.put("stratigraphy", stratigraphyRepository.findAll().stream().filter(s -> s.getSyncStatus() != null && s.getSyncStatus() == 0).count());
        status.put("stratigraphy_layer", stratigraphyLayerRepository.findAll().stream().filter(l -> l.getSyncStatus() != null && l.getSyncStatus() == 0).count());
        status.put("stratigraphy_photo", stratigraphyPhotoRepository.findAll().stream().filter(p -> p.getSyncStatus() != null && p.getSyncStatus() == 0).count());
        status.put("user", userRepository.findAll().stream().filter(u -> u.getSyncStatus() != null && u.getSyncStatus() == 0).count());
        return status;
    }

    public Map<String, List<SyncRecord>> getPendingRecords() {
        Map<String, List<SyncRecord>> pending = new LinkedHashMap<>();
        List<SyncRecord> allRecords = syncRecordRepository.findAll();
        List<SyncRecord> pendingRecords = allRecords.stream()
                .filter(r -> r.getSyncStatus() != null && r.getSyncStatus() != 1)
                .collect(Collectors.toList());
        for (SyncRecord record : pendingRecords) {
            String tableName = record.getTableName();
            pending.computeIfAbsent(tableName, k -> new ArrayList<>()).add(record);
        }
        return pending;
    }

    @Transactional
    public void markSynced(String tableName) {
        long now = System.currentTimeMillis();
        switch (tableName) {
            case "excavation_site":
                for (ExcavationSite site : excavationSiteRepository.findAll()) {
                    if (site.getSyncStatus() != null && site.getSyncStatus() == 0) {
                        site.setSyncStatus(1);
                        site.setSyncTimestamp(now);
                        excavationSiteRepository.save(site);
                    }
                }
                break;
            case "trench":
                for (Trench trench : trenchRepository.findAll()) {
                    if (trench.getSyncStatus() != null && trench.getSyncStatus() == 0) {
                        trench.setSyncStatus(1);
                        trench.setSyncTimestamp(now);
                        trenchRepository.save(trench);
                    }
                }
                break;
            case "artifact":
                for (Artifact artifact : artifactRepository.findAll()) {
                    if (artifact.getSyncStatus() != null && artifact.getSyncStatus() == 0) {
                        artifact.setSyncStatus(1);
                        artifact.setSyncTimestamp(now);
                        artifactRepository.save(artifact);
                    }
                }
                break;
            case "artifact_photo":
                for (ArtifactPhoto photo : artifactPhotoRepository.findAll()) {
                    if (photo.getSyncStatus() != null && photo.getSyncStatus() == 0) {
                        photo.setSyncStatus(1);
                        photo.setSyncTimestamp(now);
                        artifactPhotoRepository.save(photo);
                    }
                }
                break;
            case "stratigraphy":
                for (Stratigraphy stratigraphy : stratigraphyRepository.findAll()) {
                    if (stratigraphy.getSyncStatus() != null && stratigraphy.getSyncStatus() == 0) {
                        stratigraphy.setSyncStatus(1);
                        stratigraphy.setSyncTimestamp(now);
                        stratigraphyRepository.save(stratigraphy);
                    }
                }
                break;
            case "stratigraphy_layer":
                for (StratigraphyLayer layer : stratigraphyLayerRepository.findAll()) {
                    if (layer.getSyncStatus() != null && layer.getSyncStatus() == 0) {
                        layer.setSyncStatus(1);
                        layer.setSyncTimestamp(now);
                        stratigraphyLayerRepository.save(layer);
                    }
                }
                break;
            case "stratigraphy_photo":
                for (StratigraphyPhoto photo : stratigraphyPhotoRepository.findAll()) {
                    if (photo.getSyncStatus() != null && photo.getSyncStatus() == 0) {
                        photo.setSyncStatus(1);
                        photo.setSyncTimestamp(now);
                        stratigraphyPhotoRepository.save(photo);
                    }
                }
                break;
            case "user":
                for (User user : userRepository.findAll()) {
                    if (user.getSyncStatus() != null && user.getSyncStatus() == 0) {
                        user.setSyncStatus(1);
                        user.setSyncTimestamp(now);
                        userRepository.save(user);
                    }
                }
                break;
            default:
                break;
        }
    }

    @Transactional
    public Map<String, Object> batchUpload(Map<String, List<?>> data) {
        Map<String, Object> result = new LinkedHashMap<>();
        int totalSuccess = 0;
        int totalFailed = 0;
        Map<String, Integer> tableResult = new LinkedHashMap<>();

        for (Map.Entry<String, List<?>> entry : data.entrySet()) {
            String tableName = entry.getKey();
            List<?> records = entry.getValue();
            int success = 0;
            int failed = 0;

            for (Object record : records) {
                try {
                    saveRecord(tableName, record);
                    success++;
                } catch (Exception e) {
                    failed++;
                }
            }

            tableResult.put(tableName + "_success", success);
            tableResult.put(tableName + "_failed", failed);
            totalSuccess += success;
            totalFailed += failed;
        }

        result.put("total_success", totalSuccess);
        result.put("total_failed", totalFailed);
        result.put("table_details", tableResult);
        result.put("timestamp", LocalDateTime.now());
        return result;
    }

    private void saveRecord(String tableName, Object record) {
        long now = System.currentTimeMillis();
        switch (tableName) {
            case "excavation_site":
                ExcavationSite site = JSON.parseObject(JSON.toJSONString(record), ExcavationSite.class);
                site.setSyncStatus(1);
                site.setSyncTimestamp(now);
                if (site.getIsDeleted() == null) site.setIsDeleted(0);
                excavationSiteRepository.save(site);
                break;
            case "trench":
                Trench trench = JSON.parseObject(JSON.toJSONString(record), Trench.class);
                trench.setSyncStatus(1);
                trench.setSyncTimestamp(now);
                if (trench.getIsDeleted() == null) trench.setIsDeleted(0);
                trenchRepository.save(trench);
                break;
            case "artifact":
                Artifact artifact = JSON.parseObject(JSON.toJSONString(record), Artifact.class);
                artifact.setSyncStatus(1);
                artifact.setSyncTimestamp(now);
                if (artifact.getIsDeleted() == null) artifact.setIsDeleted(0);
                artifactRepository.save(artifact);
                break;
            case "artifact_photo":
                ArtifactPhoto artifactPhoto = JSON.parseObject(JSON.toJSONString(record), ArtifactPhoto.class);
                artifactPhoto.setSyncStatus(1);
                artifactPhoto.setSyncTimestamp(now);
                if (artifactPhoto.getIsDeleted() == null) artifactPhoto.setIsDeleted(0);
                artifactPhotoRepository.save(artifactPhoto);
                break;
            case "stratigraphy":
                Stratigraphy stratigraphy = JSON.parseObject(JSON.toJSONString(record), Stratigraphy.class);
                stratigraphy.setSyncStatus(1);
                stratigraphy.setSyncTimestamp(now);
                if (stratigraphy.getIsDeleted() == null) stratigraphy.setIsDeleted(0);
                stratigraphyRepository.save(stratigraphy);
                break;
            case "stratigraphy_layer":
                StratigraphyLayer layer = JSON.parseObject(JSON.toJSONString(record), StratigraphyLayer.class);
                layer.setSyncStatus(1);
                layer.setSyncTimestamp(now);
                if (layer.getIsDeleted() == null) layer.setIsDeleted(0);
                stratigraphyLayerRepository.save(layer);
                break;
            case "stratigraphy_photo":
                StratigraphyPhoto photo = JSON.parseObject(JSON.toJSONString(record), StratigraphyPhoto.class);
                photo.setSyncStatus(1);
                photo.setSyncTimestamp(now);
                if (photo.getIsDeleted() == null) photo.setIsDeleted(0);
                stratigraphyPhotoRepository.save(photo);
                break;
            case "user":
                User user = JSON.parseObject(JSON.toJSONString(record), User.class);
                user.setSyncStatus(1);
                user.setSyncTimestamp(now);
                if (user.getIsDeleted() == null) user.setIsDeleted(0);
                userRepository.save(user);
                break;
            case "operation_log":
                OperationLog opLog = JSON.parseObject(JSON.toJSONString(record), OperationLog.class);
                operationLogRepository.save(opLog);
                break;
            case "sync_record":
                SyncRecord syncRecord = JSON.parseObject(JSON.toJSONString(record), SyncRecord.class);
                syncRecordRepository.save(syncRecord);
                break;
            default:
                break;
        }
    }

    public Map<String, List<?>> downloadAll() {
        Map<String, List<?>> data = new LinkedHashMap<>();
        data.put("excavation_site", excavationSiteRepository.findAll());
        data.put("trench", trenchRepository.findAll());
        data.put("artifact", artifactRepository.findAll());
        data.put("artifact_photo", artifactPhotoRepository.findAll());
        data.put("stratigraphy", stratigraphyRepository.findAll());
        data.put("stratigraphy_layer", stratigraphyLayerRepository.findAll());
        data.put("stratigraphy_photo", stratigraphyPhotoRepository.findAll());
        data.put("user", userRepository.findAll());
        data.put("operation_log", operationLogRepository.findAll());
        data.put("sync_record", syncRecordRepository.findAll());
        return data;
    }
}
