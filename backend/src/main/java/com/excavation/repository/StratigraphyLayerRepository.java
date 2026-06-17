package com.excavation.repository;

import com.excavation.entity.StratigraphyLayer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StratigraphyLayerRepository extends JpaRepository<StratigraphyLayer, Long>, JpaSpecificationExecutor<StratigraphyLayer> {

    List<StratigraphyLayer> findByStratigraphyIdOrderBySortOrderAsc(Long stratigraphyId);
}
