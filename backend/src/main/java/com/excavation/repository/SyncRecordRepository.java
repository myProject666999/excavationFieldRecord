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

    List<SyncRecord> findByCreatedAtBetween(LocalDateTime startTime, LocalDateTime endTime);

    List<SyncRecord> findBySyncStatus(String syncStatus);

    @Query("SELECT s FROM SyncRecord s WHERE s.tableName = :tableName AND s.createdAt >= :createdAt ORDER BY s.createdAt DESC")
    List<SyncRecord> findRecentByTableName(@Param("tableName") String tableName, @Param("createdAt") LocalDateTime createdAt);

    @Query("SELECT COUNT(s) FROM SyncRecord s WHERE s.syncStatus = :syncStatus")
    long countBySyncStatus(@Param("syncStatus") String syncStatus);

    Optional<SyncRecord> findFirstByOrderByCreatedAtDesc();
}
