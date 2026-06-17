package com.excavation.service;

import com.excavation.dto.PageResponse;
import com.excavation.entity.Stratigraphy;
import com.excavation.entity.StratigraphyLayer;
import com.excavation.repository.StratigraphyLayerRepository;
import com.excavation.repository.StratigraphyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class StratigraphyService {

    private static final Logger log = LoggerFactory.getLogger(StratigraphyService.class);

    @Autowired
    private StratigraphyRepository stratigraphyRepository;

    @Autowired
    private StratigraphyLayerRepository stratigraphyLayerRepository;

    public List<Stratigraphy> findAll(Long trenchId, Long siteId) {
        Specification<Stratigraphy> spec = buildSpec(trenchId, siteId);
        return stratigraphyRepository.findAll(spec);
    }

    public PageResponse<Stratigraphy> findPage(int page, int size, Long trenchId, Long siteId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Specification<Stratigraphy> spec = buildSpec(trenchId, siteId);
        Page<Stratigraphy> pageResult = stratigraphyRepository.findAll(spec, pageable);
        return new PageResponse<>(
                pageResult.getContent(),
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements()
        );
    }

    private Specification<Stratigraphy> buildSpec(Long trenchId, Long siteId) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (trenchId != null) {
                predicates.add(cb.equal(root.get("trenchId"), trenchId));
            }
            if (siteId != null) {
                predicates.add(cb.equal(root.get("siteId"), siteId));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public Stratigraphy findById(Long id) {
        Optional<Stratigraphy> optional = stratigraphyRepository.findById(id);
        return optional.orElse(null);
    }

    public List<Stratigraphy> findByTrenchId(Long trenchId) {
        return stratigraphyRepository.findByTrenchId(trenchId);
    }

    public List<Stratigraphy> findBySiteId(Long siteId) {
        return stratigraphyRepository.findBySiteId(siteId);
    }

    public List<StratigraphyLayer> findLayersByStratigraphyId(Long stratigraphyId) {
        return stratigraphyLayerRepository.findByStratigraphyIdOrderBySortOrderAsc(stratigraphyId);
    }

    @Transactional
    public StratigraphyLayer addLayer(Long stratigraphyId, StratigraphyLayer layer) {
        layer.setStratigraphyId(stratigraphyId);
        if (layer.getIsDeleted() == null) {
            layer.setIsDeleted(0);
        }
        if (layer.getSyncStatus() == null) {
            layer.setSyncStatus(0);
        }
        layer.setSyncTimestamp(System.currentTimeMillis());
        return stratigraphyLayerRepository.save(layer);
    }

    @Transactional
    public Stratigraphy save(Stratigraphy stratigraphy) {
        if (stratigraphy.getIsDeleted() == null) {
            stratigraphy.setIsDeleted(0);
        }
        if (stratigraphy.getSyncStatus() == null) {
            stratigraphy.setSyncStatus(0);
        }
        stratigraphy.setSyncTimestamp(System.currentTimeMillis());
        return stratigraphyRepository.save(stratigraphy);
    }

    @Transactional
    public Stratigraphy update(Long id, Stratigraphy stratigraphy) {
        Stratigraphy existing = findById(id);
        if (existing == null) {
            return null;
        }
        stratigraphy.setId(id);
        stratigraphy.setCreatedAt(existing.getCreatedAt());
        if (stratigraphy.getIsDeleted() == null) {
            stratigraphy.setIsDeleted(existing.getIsDeleted());
        }
        stratigraphy.setSyncStatus(0);
        stratigraphy.setSyncTimestamp(System.currentTimeMillis());
        return stratigraphyRepository.save(stratigraphy);
    }

    @Transactional
    public void delete(Long id) {
        Stratigraphy existing = findById(id);
        if (existing != null) {
            existing.setIsDeleted(1);
            existing.setSyncStatus(0);
            existing.setSyncTimestamp(System.currentTimeMillis());
            stratigraphyRepository.save(existing);
        }
    }
}
