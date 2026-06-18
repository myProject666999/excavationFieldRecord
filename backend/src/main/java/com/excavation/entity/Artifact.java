package com.excavation.entity;

import org.hibernate.annotations.Where;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "artifact")
@EntityListeners(AuditingEntityListener.class)
@Where(clause = "is_deleted=0")
public class Artifact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "artifact_code", length = 50, nullable = false)
    private String artifactCode;

    @Column(name = "trench_id", nullable = false)
    private Long trenchId;

    @Column(name = "site_id", nullable = false)
    private Long siteId;

    @Column(name = "coord_x", precision = 8, scale = 3, nullable = false)
    private BigDecimal coordX;

    @Column(name = "coord_y", precision = 8, scale = 3, nullable = false)
    private BigDecimal coordY;

    @Column(name = "depth", precision = 8, scale = 3, nullable = false)
    private BigDecimal depth;

    @Column(name = "layer_id")
    private Long layerId;

    @Column(name = "category", length = 50, nullable = false)
    private String category;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Lob
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "material", length = 100)
    private String material;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Lob
    @Column(name = "associates", columnDefinition = "TEXT")
    private String associates;

    @Column(name = "`condition`", length = 50)
    private String condition;

    @Column(name = "storage_location", length = 100)
    private String storageLocation;

    @Column(name = "discoverer_id")
    private Long discovererId;

    @Column(name = "discovery_time")
    private LocalDateTime discoveryTime;

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

    public String getArtifactCode() {
        return artifactCode;
    }

    public void setArtifactCode(String artifactCode) {
        this.artifactCode = artifactCode;
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

    public BigDecimal getCoordX() {
        return coordX;
    }

    public void setCoordX(BigDecimal coordX) {
        this.coordX = coordX;
    }

    public BigDecimal getCoordY() {
        return coordY;
    }

    public void setCoordY(BigDecimal coordY) {
        this.coordY = coordY;
    }

    public BigDecimal getDepth() {
        return depth;
    }

    public void setDepth(BigDecimal depth) {
        this.depth = depth;
    }

    public Long getLayerId() {
        return layerId;
    }

    public void setLayerId(Long layerId) {
        this.layerId = layerId;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getMaterial() {
        return material;
    }

    public void setMaterial(String material) {
        this.material = material;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getAssociates() {
        return associates;
    }

    public void setAssociates(String associates) {
        this.associates = associates;
    }

    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    public String getStorageLocation() {
        return storageLocation;
    }

    public void setStorageLocation(String storageLocation) {
        this.storageLocation = storageLocation;
    }

    public Long getDiscovererId() {
        return discovererId;
    }

    public void setDiscovererId(Long discovererId) {
        this.discovererId = discovererId;
    }

    public LocalDateTime getDiscoveryTime() {
        return discoveryTime;
    }

    public void setDiscoveryTime(LocalDateTime discoveryTime) {
        this.discoveryTime = discoveryTime;
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
