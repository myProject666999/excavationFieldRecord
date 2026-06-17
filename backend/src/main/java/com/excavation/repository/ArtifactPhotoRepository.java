package com.excavation.repository;

import com.excavation.entity.ArtifactPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArtifactPhotoRepository extends JpaRepository<ArtifactPhoto, Long>, JpaSpecificationExecutor<ArtifactPhoto> {

    List<ArtifactPhoto> findByArtifactId(Long artifactId);
}
