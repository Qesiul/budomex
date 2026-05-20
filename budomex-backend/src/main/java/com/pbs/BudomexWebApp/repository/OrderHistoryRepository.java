package com.pbs.BudomexWebApp.repository;

import com.pbs.BudomexWebApp.entity.OrderHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderHistoryRepository extends JpaRepository<OrderHistory, Long> {

    List<OrderHistory> findByOrderIdOrderByChangedAtDesc(Long orderId);
}
