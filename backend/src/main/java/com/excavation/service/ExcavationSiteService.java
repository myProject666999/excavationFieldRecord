package com.excavation.service;

import com.excavation.dto.PageResponse;
import com.excavation.entity.ExcavationSite;
import com.excavation.repository.ExcavationSiteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ExcavationSiteService {

    private static final Logger log = LoggerFactory.getLogger(ExcavationSiteService.class);

    @Autowired
    private ExcavationSiteRepository excavationSiteRepository;

    public List<ExcavationSite> findAll() {
        return excavationSiteRepository.findAll();
    }

    public PageResponse<ExcavationSite> findPage(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        Page<ExcavationSite> pageResult = excavationSiteRepository.findAll(pageable);
        return new PageResponse<>(
                pageResult.getContent(),
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements()
        );
    }

    public ExcavationSite findById(Long id) {
        Optional<ExcavationSite> optional = excavationSiteRepository.findById(id);
        return optional.orElse(null);
    }

    @Transactional
    public ExcavationSite save(ExcavationSite site) {
        if (site.getIsDeleted() == null) {
            site.setIsDeleted(0);
        }
        if (site.getSyncStatus() == null) {
            site.setSyncStatus(0);
        }
        site.setSyncTimestamp(System.currentTimeMillis());
        return excavationSiteRepository.save(site);
    }

    @Transactional
    public ExcavationSite update(Long id, ExcavationSite site) {
        ExcavationSite existing = findById(id);
        if (existing == null) {
            return null;
        }
        site.setId(id);
        site.setCreatedAt(existing.getCreatedAt());
        if (site.getIsDeleted() == null) {
            site.setIsDeleted(existing.getIsDeleted());
        }
        site.setSyncStatus(0);
        site.setSyncTimestamp(System.currentTimeMillis());
        return excavationSiteRepository.save(site);
    }

    @Transactional
    public void delete(Long id) {
        ExcavationSite existing = findById(id);
        if (existing != null) {
            existing.setIsDeleted(1);
            existing.setSyncStatus(0);
            existing.setSyncTimestamp(System.currentTimeMillis());
            excavationSiteRepository.save(existing);
        }
    }
}
