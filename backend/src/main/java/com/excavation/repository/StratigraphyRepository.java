package com.excavation.repository;

import com.excavation.entity.Stratigraphy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StratigraphyRepository extends JpaRepository<Stratigraphy, Long>, JpaSpecificationExecutor<Stratigraphy> {

    List<Stratigraphy> findByTrenchId(Long trenchId);

    List<Stratigraphy> findBySiteId(Long siteId);
}
