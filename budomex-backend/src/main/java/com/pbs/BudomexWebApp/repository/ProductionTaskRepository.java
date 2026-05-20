package com.pbs.BudomexWebApp.repository;

import com.pbs.BudomexWebApp.entity.ProductionTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductionTaskRepository extends JpaRepository<ProductionTask, Long> {

    List<ProductionTask> findByOrderIdOrderBySequenceNumberAsc(Long orderId);
}
