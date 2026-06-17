package com.excavation.service;

import com.excavation.dto.PageResponse;
import com.excavation.entity.Artifact;
import com.excavation.repository.ArtifactRepository;
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
import org.springframework.util.StringUtils;

import javax.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ArtifactService {

    private static final Logger log = LoggerFactory.getLogger(ArtifactService.class);

    @Autowired
    private ArtifactRepository artifactRepository;

    public List<Artifact> findAll(Long trenchId, Long siteId, String category) {
        Specification<Artifact> spec = buildSpec(trenchId, siteId, category);
        return artifactRepository.findAll(spec);
    }

    public PageResponse<Artifact> findPage(int page, int size, Long trenchId, Long siteId, String category) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Specification<Artifact> spec = buildSpec(trenchId, siteId, category);
        Page<Artifact> pageResult = artifactRepository.findAll(spec, pageable);
        return new PageResponse<>(
                pageResult.getContent(),
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements()
        );
    }

    private Specification<Artifact> buildSpec(Long trenchId, Long siteId, String category) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (trenchId != null) {
                predicates.add(cb.equal(root.get("trenchId"), trenchId));
            }
            if (siteId != null) {
                predicates.add(cb.equal(root.get("siteId"), siteId));
            }
            if (StringUtils.hasText(category)) {
                predicates.add(cb.equal(root.get("category"), category));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public Artifact findById(Long id) {
        Optional<Artifact> optional = artifactRepository.findById(id);
        return optional.orElse(null);
    }

    public List<Artifact> findByTrenchId(Long trenchId) {
        return artifactRepository.findByTrenchId(trenchId);
    }

    public List<Artifact> findBySiteId(Long siteId) {
        return artifactRepository.findBySiteId(siteId);
    }

    @Transactional
    public Artifact save(Artifact artifact) {
        if (artifact.getIsDeleted() == null) {
            artifact.setIsDeleted(0);
        }
        if (artifact.getSyncStatus() == null) {
            artifact.setSyncStatus(0);
        }
        artifact.setSyncTimestamp(System.currentTimeMillis());
        return artifactRepository.save(artifact);
    }

    @Transactional
    public Artifact update(Long id, Artifact artifact) {
        Artifact existing = findById(id);
        if (existing == null) {
            return null;
        }
        artifact.setId(id);
        artifact.setCreatedAt(existing.getCreatedAt());
        if (artifact.getIsDeleted() == null) {
            artifact.setIsDeleted(existing.getIsDeleted());
        }
        artifact.setSyncStatus(0);
        artifact.setSyncTimestamp(System.currentTimeMillis());
        return artifactRepository.save(artifact);
    }

    @Transactional
    public void delete(Long id) {
        Artifact existing = findById(id);
        if (existing != null) {
            existing.setIsDeleted(1);
            existing.setSyncStatus(0);
            existing.setSyncTimestamp(System.currentTimeMillis());
            artifactRepository.save(existing);
        }
    }
}
