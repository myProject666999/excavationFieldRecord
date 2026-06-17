package com.excavation.repository;

import com.excavation.entity.Artifact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArtifactRepository extends JpaRepository<Artifact, Long>, JpaSpecificationExecutor<Artifact> {

    List<Artifact> findByTrenchId(Long trenchId);

    List<Artifact> findBySiteId(Long siteId);

    List<Artifact> findByLayerId(Long layerId);
}
