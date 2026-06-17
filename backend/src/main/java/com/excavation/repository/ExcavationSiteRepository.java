package com.excavation.repository;

import com.excavation.entity.ExcavationSite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ExcavationSiteRepository extends JpaRepository<ExcavationSite, Long>, JpaSpecificationExecutor<ExcavationSite> {
}
