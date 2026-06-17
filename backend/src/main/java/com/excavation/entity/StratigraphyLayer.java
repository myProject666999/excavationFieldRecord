package com.excavation.entity;

import org.hibernate.annotations.Where;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "stratigraphy_layer")
@EntityListeners(AuditingEntityListener.class)
@Where(clause = "is_deleted=0")
public class StratigraphyLayer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "stratigraphy_id", nullable = false)
    private Long stratigraphyId;

    @Column(name = "layer_number", length = 20, nullable = false)
    private String layerNumber;

    @Column(name = "top_depth", precision = 8, scale = 3, nullable = false)
    private BigDecimal topDepth;

    @Column(name = "bottom_depth", precision = 8, scale = 3, nullable = false)
    private BigDecimal bottomDepth;

    @Column(name = "thickness", precision = 8, scale = 3, nullable = false)
    private BigDecimal thickness;

    @Column(name = "soil_color", length = 100, nullable = false)
    private String soilColor;

    @Column(name = "soil_texture", length = 100, nullable = false)
    private String soilTexture;

    @Column(name = "soil_structure", length = 100)
    private String soilStructure;

    @Column(name = "inclusions", columnDefinition = "TEXT")
    private String inclusions;

    @Column(name = "artifact_count", nullable = false)
    private Integer artifactCount;

    @Column(name = "layer_note", columnDefinition = "TEXT")
    private String layerNote;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

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

    public Long getStratigraphyId() {
        return stratigraphyId;
    }

    public void setStratigraphyId(Long stratigraphyId) {
        this.stratigraphyId = stratigraphyId;
    }

    public String getLayerNumber() {
        return layerNumber;
    }

    public void setLayerNumber(String layerNumber) {
        this.layerNumber = layerNumber;
    }

    public BigDecimal getTopDepth() {
        return topDepth;
    }

    public void setTopDepth(BigDecimal topDepth) {
        this.topDepth = topDepth;
    }

    public BigDecimal getBottomDepth() {
        return bottomDepth;
    }

    public void setBottomDepth(BigDecimal bottomDepth) {
        this.bottomDepth = bottomDepth;
    }

    public BigDecimal getThickness() {
        return thickness;
    }

    public void setThickness(BigDecimal thickness) {
        this.thickness = thickness;
    }

    public String getSoilColor() {
        return soilColor;
    }

    public void setSoilColor(String soilColor) {
        this.soilColor = soilColor;
    }

    public String getSoilTexture() {
        return soilTexture;
    }

    public void setSoilTexture(String soilTexture) {
        this.soilTexture = soilTexture;
    }

    public String getSoilStructure() {
        return soilStructure;
    }

    public void setSoilStructure(String soilStructure) {
        this.soilStructure = soilStructure;
    }

    public String getInclusions() {
        return inclusions;
    }

    public void setInclusions(String inclusions) {
        this.inclusions = inclusions;
    }

    public Integer getArtifactCount() {
        return artifactCount;
    }

    public void setArtifactCount(Integer artifactCount) {
        this.artifactCount = artifactCount;
    }

    public String getLayerNote() {
        return layerNote;
    }

    public void setLayerNote(String layerNote) {
        this.layerNote = layerNote;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
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
