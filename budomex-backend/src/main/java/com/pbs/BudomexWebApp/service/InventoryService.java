package com.pbs.BudomexWebApp.service;

import com.pbs.BudomexWebApp.entity.InventoryItem;
import com.pbs.BudomexWebApp.entity.Order;
import com.pbs.BudomexWebApp.entity.ProductType;
import com.pbs.BudomexWebApp.repository.InventoryItemRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private static final Logger log = LoggerFactory.getLogger(InventoryService.class);
    private final InventoryItemRepository repository;
    private final RealtimeNotificationService realtime;

    public List<InventoryItem> getAllItems() {
        return repository.findAllByOrderByCategoryAscNameAsc();
    }

    public List<InventoryItem> getItemsByCategory(ProductType category) {
        return repository.findByCategoryOrderByNameAsc(category);
    }

    public List<InventoryItem> getLowStockItems() {
        return getAllItems().stream().filter(InventoryItem::isLowStock).toList();
    }

    @Transactional
    public InventoryItem createItem(String name, ProductType category, String unit,
                                     Integer currentQuantity, Integer minimumThreshold) {
        InventoryItem item = InventoryItem.builder()
                .name(name)
                .category(category)
                .unit(unit != null ? unit : "szt.")
                .currentQuantity(currentQuantity != null ? currentQuantity : 0)
                .minimumThreshold(minimumThreshold != null ? minimumThreshold : 10)
                .build();
        InventoryItem saved = repository.save(item);
        realtime.notifyInventory();
        return saved;
    }

    @Transactional
    public InventoryItem updateItem(Long id, String name, Integer currentQuantity, Integer minimumThreshold) {
        InventoryItem item = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pozycja nie znaleziona: " + id));
        if (name != null) item.setName(name);
        if (currentQuantity != null) item.setCurrentQuantity(currentQuantity);
        if (minimumThreshold != null) item.setMinimumThreshold(minimumThreshold);
        InventoryItem saved = repository.save(item);
        realtime.notifyInventory();
        return saved;
    }

    @Transactional
    public InventoryItem adjustStock(Long id, Integer delta) {
        InventoryItem item = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Pozycja nie znaleziona: " + id));
        int newQuantity = item.getCurrentQuantity() + delta;
        if (newQuantity < 0) {
            throw new IllegalStateException("Stan magazynowy nie może być ujemny");
        }
        item.setCurrentQuantity(newQuantity);
        InventoryItem saved = repository.save(item);
        realtime.notifyInventory();
        return saved;
    }

    @Transactional
    public void deleteItem(Long id) {
        repository.deleteById(id);
        realtime.notifyInventory();
    }

    /**
     * Automatyczna rezerwacja materiałów po akceptacji zamówienia przez klienta.
     * Rezerwuje pierwszą dostępną pozycję magazynową pasującą do typu produktu.
     */
    @Transactional
    public void reserveForOrder(Order order) {
        List<InventoryItem> items = repository.findByCategoryOrderByNameAsc(order.getProductType());
        if (items.isEmpty()) {
            log.warn("Brak pozycji magazynowych dla typu {}, rezerwacja pominięta dla zamówienia #{}",
                    order.getProductType(), order.getId());
            return;
        }
        InventoryItem item = items.get(0);
        int needed = order.getQuantity() != null ? order.getQuantity() : 1;
        item.setReservedQuantity(item.getReservedQuantity() + needed);
        repository.save(item);
        log.info("Zarezerwowano {} {} pozycji '{}' dla zamówienia #{}",
                needed, item.getUnit(), item.getName(), order.getId());
    }
}
