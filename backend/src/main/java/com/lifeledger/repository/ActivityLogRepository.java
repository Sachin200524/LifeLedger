package com.lifeledger.repository;

import com.lifeledger.entity.ActivityLog;
import com.lifeledger.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findByUserOrderByCreatedAtDesc(User user);
    Page<ActivityLog> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    List<ActivityLog> findTop20ByUserOrderByCreatedAtDesc(User user);
    List<ActivityLog> findTop50ByOrderByCreatedAtDesc();
    Page<ActivityLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
    long countByUser(User user);
}
