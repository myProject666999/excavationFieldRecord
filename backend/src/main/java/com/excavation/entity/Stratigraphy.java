package com.excavation.entity;

import org.hibernate.annotations.Where;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "stratigraphy")
@EntityListeners(AuditingEntityListener.class)
@Where(clause = "is_deleted=0")
public class Stratigraphy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "stratigraphy_code", length = 50, nullable = false)
    private String stratigraphyCode;

    @Column(name = "trench_id", nullable = false)
    private Long trenchId;

    @Column(name = "site_id", nullable = false)
    private Long siteId;

    @Column(name = "wall_direction", length = 10, nullable = false)
    private String wallDirection;

    @Column(name = "record_depth", precision = 8, scale = 3, nullable = false)
    private BigDecimal recordDepth;

    @Column(name = "draw_date")
    private LocalDate drawDate;

    @Column(name = "drafter_id")
    private Long drafterId;

    @Column(name = "reviewer_id")
    private Long reviewerId;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "sketch_path", length = 500)
    private String sketchPath;

    @Column(name = "status", nullable = false)
    private Integer status;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "is_deleted", nullable = false)
    private Integer isDeleted;

    @Column(name = "sync_status", nullable = false)
    private Integer syncStatus;

    @Column(name = "sync_timestamp")
    private Long syncTimestamp;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStratigraphyCode() {
        return stratigraphyCode;
    }

    public void setStratigraphyCode(String stratigraphyCode) {
        this.stratigraphyCode = stratigraphyCode;
    }

    public Long getTrenchId() {
        return trenchId;
    }

    public void setTrenchId(Long trenchId) {
        this.trenchId = trenchId;
    }

    public Long getSiteId() {
        return siteId;
    }

    public void setSiteId(Long siteId) {
        this.siteId = siteId;
    }

    public String getWallDirection() {
        return wallDirection;
    }

    public void setWallDirection(String wallDirection) {
        this.wallDirection = wallDirection;
    }

    public BigDecimal getRecordDepth() {
        return recordDepth;
    }

    public void setRecordDepth(BigDecimal recordDepth) {
        this.recordDepth = recordDepth;
    }

    public LocalDate getDrawDate() {
        return drawDate;
    }

    public void setDrawDate(LocalDate drawDate) {
        this.drawDate = drawDate;
    }

    public Long getDrafterId() {
        return drafterId;
    }

    public void setDrafterId(Long drafterId) {
        this.drafterId = drafterId;
    }

    public Long getReviewerId() {
        return reviewerId;
    }

    public void setReviewerId(Long reviewerId) {
 this.reviewerId = reviewerId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSketchPath() {
        return sketchPath;
    }

    public void setSketchPath(String sketchPath) {
        this.sketchPath = sketchPath;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Integer getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Integer isDeleted) {
        this.isDeleted = isDeleted;
    }

    public Integer getSyncStatus() {
        return syncStatus;
    }

    public void setSyncStatus(Integer syncStatus) {
        this.syncStatus = syncStatus;
    }

    public Long getSyncTimestamp() {
        return syncTimestamp;
    }

    public void setSyncTimestamp(Long syncTimestamp) {
        this.syncTimestamp = syncTimestamp;
    }
}
