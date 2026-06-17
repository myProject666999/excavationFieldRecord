package com.excavation.repository;

import com.excavation.entity.Trench;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrenchRepository extends JpaRepository<Trench, Long>, JpaSpecificationExecutor<Trench> {

    List<Trench> findBySiteId(Long siteId);

    Trench findByTrenchCode(String code);
}
