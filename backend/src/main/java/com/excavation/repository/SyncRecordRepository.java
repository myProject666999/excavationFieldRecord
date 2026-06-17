package com.excavation.repository;

import com.excavation.entity.SyncRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SyncRecordRepository extends JpaRepository<SyncRecord, Long>, JpaSpecificationExecutor<SyncRecord> {

    List<SyncRecord> findBySyncTimeBetween(LocalDateTime startTime, LocalDateTime endTime);

    List<SyncRecord> findBySyncStatus(String syncStatus);

    @Query("SELECT s FROM SyncRecord s WHERE s.entityType = :entityType AND s.syncTime >= :syncTime ORDER BY s.syncTime DESC")
    List<SyncRecord> findRecentByEntityType(@Param("entityType") String entityType, @Param("syncTime") LocalDateTime syncTime);

    @Query("SELECT COUNT(s) FROM SyncRecord s WHERE s.syncStatus = :syncStatus")
    long countBySyncStatus(@Param("syncStatus") String syncStatus);

    Optional<SyncRecord> findFirstByOrderBySyncTimeDesc();
}
