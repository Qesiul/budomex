package com.pbs.BudomexWebApp.repository;

import com.pbs.BudomexWebApp.entity.InventoryItem;
import com.pbs.BudomexWebApp.entity.ProductType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    List<InventoryItem> findByCategoryOrderByNameAsc(ProductType category);
    List<InventoryItem> findAllByOrderByCategoryAscNameAsc();
}
