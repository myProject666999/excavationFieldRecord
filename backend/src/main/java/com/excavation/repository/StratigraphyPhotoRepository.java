package com.excavation.repository;

import com.excavation.entity.StratigraphyPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StratigraphyPhotoRepository extends JpaRepository<StratigraphyPhoto, Long>, JpaSpecificationExecutor<StratigraphyPhoto> {

    List<StratigraphyPhoto> findByStratigraphyId(Long stratigraphyId);
}
