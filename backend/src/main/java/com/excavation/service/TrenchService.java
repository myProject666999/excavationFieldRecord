package com.excavation.service;

import com.excavation.dto.PageResponse;
import com.excavation.entity.Trench;
import com.excavation.repository.TrenchRepository;
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
public class TrenchService {

    private static final Logger log = LoggerFactory.getLogger(TrenchService.class);

    @Autowired
    private TrenchRepository trenchRepository;

    public List<Trench> findAll(Long siteId) {
        if (siteId != null) {
            return trenchRepository.findBySiteId(siteId);
        }
        return trenchRepository.findAll();
    }

    public PageResponse<Trench> findPage(int page, int size, Long siteId) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Specification<Trench> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (siteId != null) {
                predicates.add(cb.equal(root.get("siteId"), siteId));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        Page<Trench> pageResult = trenchRepository.findAll(spec, pageable);
        return new PageResponse<>(
                pageResult.getContent(),
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements()
        );
    }

    public Trench findById(Long id) {
        Optional<Trench> optional = trenchRepository.findById(id);
        return optional.orElse(null);
    }

    public Trench findByCode(String code) {
        return trenchRepository.findByTrenchCode(code);
    }

    public List<Trench> findBySiteId(Long siteId) {
        return trenchRepository.findBySiteId(siteId);
    }

    @Transactional
    public Trench save(Trench trench) {
        if (trench.getIsDeleted() == null) {
            trench.setIsDeleted(0);
        }
        if (trench.getSyncStatus() == null) {
            trench.setSyncStatus(0);
        }
        trench.setSyncTimestamp(System.currentTimeMillis());
        return trenchRepository.save(trench);
    }

    @Transactional
    public Trench update(Long id, Trench trench) {
        Trench existing = findById(id);
        if (existing == null) {
            return null;
        }
        trench.setId(id);
        trench.setCreatedAt(existing.getCreatedAt());
        if (trench.getIsDeleted() == null) {
            trench.setIsDeleted(existing.getIsDeleted());
        }
        trench.setSyncStatus(0);
        trench.setSyncTimestamp(System.currentTimeMillis());
        return trenchRepository.save(trench);
    }

    @Transactional
    public void delete(Long id) {
        Trench existing = findById(id);
        if (existing != null) {
            existing.setIsDeleted(1);
            existing.setSyncStatus(0);
            existing.setSyncTimestamp(System.currentTimeMillis());
            trenchRepository.save(existing);
        }
    }
}
