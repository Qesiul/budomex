package com.pbs.BudomexWebApp.controller;

import com.pbs.BudomexWebApp.entity.InventoryItem;
import com.pbs.BudomexWebApp.entity.Order;
import com.pbs.BudomexWebApp.entity.OrderStatus;
import com.pbs.BudomexWebApp.service.InventoryService;
import com.pbs.BudomexWebApp.service.OrderService;
import com.pbs.BudomexWebApp.service.ProductionTaskTemplateService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/manager")
@RequiredArgsConstructor
public class ManagerController {

    private static final Logger log = LoggerFactory.getLogger(ManagerController.class);
    private final OrderService orderService;
    private final ProductionTaskTemplateService taskTemplateService;
    private final InventoryService inventoryService;

    @GetMapping("/orders")
    public ResponseEntity<Map<String, Object>> getActiveOrders() {
        List<Order> orders = orderService.getActiveOrders();
        Map<String, Object> response = new HashMap<>();
        
        response.put("orders", orders.stream().map(this::mapOrderToDto).collect(Collectors.toList()));
        response.put("countOczekujace", orderService.countByStatus(OrderStatus.OCZEKUJACE));
        response.put("countWRealizacji", orderService.countByStatus(OrderStatus.W_REALIZACJI));
        response.put("countZrealizowane", orderService.countByStatus(OrderStatus.ZREALIZOWANE));
        response.put("countMontaz", orderService.countByStatus(OrderStatus.MONTAZ));
        
        // Licznik zamówień z przekroczonym terminem (W_REALIZACJI z deadline w przeszłości)
        LocalDate today = LocalDate.now();
        long countOverdue = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.W_REALIZACJI 
                          || o.getStatus() == OrderStatus.ZAAKCEPTOWANE_PRZEZ_MISTRZA)
                .filter(o -> o.getEstimatedDeliveryDate() != null 
                          && o.getEstimatedDeliveryDate().isBefore(today))
                .count();
        response.put("countOverdue", countOverdue);
        
        // Suma wartości aktywnych zamówień
        BigDecimal totalValue = orders.stream()
                .filter(o -> o.getPrice() != null)
                .map(Order::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        response.put("totalValue", totalValue);

        // Liczba pozycji magazynowych z niskim stanem
        long lowStockCount = inventoryService.getLowStockItems().stream().filter(InventoryItem::isLowStock).count();
        response.put("lowStockCount", lowStockCount);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/archive")
    public ResponseEntity<List<Map<String, Object>>> getArchivedOrders() {
        List<Order> archivedOrders = orderService.getArchivedOrders();
        return ResponseEntity.ok(archivedOrders.stream().map(this::mapOrderToDto).collect(Collectors.toList()));
    }

    @GetMapping("/order/{id}")
    public ResponseEntity<Map<String, Object>> getOrderDetails(@PathVariable Long id) {
        return orderService.getOrderById(id)
                .map(order -> {
                    Map<String, Object> data = mapOrderToDto(order);
                    data.put("productionTasks", order.getProductionTasks().stream().map(task -> {
                        Map<String, Object> t = new HashMap<>();
                        t.put("id", task.getId());
                        t.put("description", task.getDescription());
                        t.put("completed", task.getCompleted());
                        t.put("sequenceNumber", task.getSequenceNumber());
                        return t;
                    }).collect(Collectors.toList()));
                    
                    data.put("history", order.getHistory().stream().map(h -> {
                        Map<String, Object> historyEntry = new HashMap<>();
                        historyEntry.put("id", h.getId());
                        historyEntry.put("previousStatus", h.getPreviousStatus() != null ? h.getPreviousStatus().name() : null);
                        historyEntry.put("newStatus", h.getNewStatus().name());
                        historyEntry.put("changedAt", h.getChangedAt().toString());
                        historyEntry.put("notes", h.getNotes());
                        return historyEntry;
                    }).collect(Collectors.toList()));
                    
                    return ResponseEntity.ok(data);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/order/{id}/approve")
    public ResponseEntity<Map<String, String>> approveOrder(@PathVariable Long id,
                                                             @RequestBody Map<String, Object> payload) {
        try {
            BigDecimal price = new BigDecimal(payload.get("price").toString());
            LocalDate estimatedDeliveryDate = LocalDate.parse(payload.get("estimatedDeliveryDate").toString());
            String managerNotes = payload.get("managerNotes") != null ? payload.get("managerNotes").toString() : null;
            
            Order order = orderService.approveOrder(id, price, estimatedDeliveryDate, managerNotes);
            return ResponseEntity.ok(Map.of(
                    "message", "Zamówienie zatwierdzone. Email wysłany do klienta.",
                    "acceptanceToken", order.getAcceptanceToken()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/order/{id}/reject")
    public ResponseEntity<Map<String, String>> rejectOrder(@PathVariable Long id) {
        try {
            orderService.rejectOrder(id);
            return ResponseEntity.ok(Map.of("message", "Zamówienie odrzucone."));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/order/{id}/delete")
    public ResponseEntity<Map<String, String>> deleteOrder(@PathVariable Long id) {
        try {
            orderService.deleteOrder(id);
            return ResponseEntity.ok(Map.of("message", "Zamówienie usunięte."));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/order/{id}/task-templates")
    public ResponseEntity<Map<String, Object>> getTaskTemplates(@PathVariable Long id) {
        return orderService.getOrderById(id)
                .map(order -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("templates", taskTemplateService.getTemplateTasksForProductType(order.getProductType()));
                    data.put("existingTasks", order.getProductionTasks().stream().map(task -> {
                        Map<String, Object> t = new HashMap<>();
                        t.put("id", task.getId());
                        t.put("description", task.getDescription());
                        t.put("completed", task.getCompleted());
                        return t;
                    }).collect(Collectors.toList()));
                    return ResponseEntity.ok(data);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/order/{id}/tasks")
    public ResponseEntity<Map<String, String>> assignTasks(@PathVariable Long id,
                                                            @RequestBody Map<String, List<String>> body) {
        try {
            List<String> tasks = body.get("tasks");
            orderService.assignProductionTasks(id, tasks);
            return ResponseEntity.ok(Map.of("message", "Zadania przypisane pomyślnie."));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/order/{id}/workers")
    public ResponseEntity<Map<String, String>> assignWorkers(@PathVariable Long id,
                                                             @RequestBody Map<String, List<Object>> body) {
        try {
            List<Object> raw = body.get("workerIds");
            List<Long> workerIds = raw == null ? List.of()
                    : raw.stream().map(o -> Long.valueOf(o.toString())).collect(Collectors.toList());
            orderService.assignWorkers(id, workerIds);
            return ResponseEntity.ok(Map.of("message", "Przypisano pracowników do zamówienia."));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("countOczekujace", orderService.countByStatus(OrderStatus.OCZEKUJACE));
        stats.put("countWRealizacji", orderService.countByStatus(OrderStatus.W_REALIZACJI));
        stats.put("countZrealizowane", orderService.countByStatus(OrderStatus.ZREALIZOWANE));
        stats.put("countMontaz", orderService.countByStatus(OrderStatus.MONTAZ));
        
        // Suma finansowa - uproszczona symulacja dla API
        List<Order> active = orderService.getActiveOrders();
        BigDecimal totalValue = active.stream()
                .filter(o -> o.getPrice() != null)
                .map(Order::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        stats.put("totalValue", totalValue);
        
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/order/{id}/schedule-installation")
    public ResponseEntity<Map<String, String>> scheduleInstallation(@PathVariable Long id,
                                                                      @RequestBody Map<String, String> payload) {
        try {
            LocalDateTime installationDate = LocalDateTime.parse(payload.get("installationDate"));
            orderService.scheduleInstallation(id, installationDate);
            return ResponseEntity.ok(Map.of("message", "Montaż zaplanowany na " + installationDate));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/order/{id}/complete-installation")
    public ResponseEntity<Map<String, String>> completeInstallation(@PathVariable Long id) {
        try {
            orderService.completeInstallation(id);
            return ResponseEntity.ok(Map.of("message", "Montaż zakończony sukcesem. Zamówienie przeniesione do archiwum."));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/order/{id}/reschedule-installation")
    public ResponseEntity<Map<String, String>> rescheduleInstallation(@PathVariable Long id,
                                                                        @RequestBody Map<String, String> payload) {
        try {
            LocalDateTime installationDate = LocalDateTime.parse(payload.get("installationDate"));
            orderService.rescheduleInstallation(id, installationDate);
            return ResponseEntity.ok(Map.of("message", "Nowa data montażu: " + installationDate));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/installation-reminders")
    public ResponseEntity<List<Map<String, Object>>> getInstallationReminders() {
        List<Map<String, Object>> reminders = orderService.getInstallationReminders().stream().map(order -> {
            Map<String, Object> data = new HashMap<>();
            data.put("id", order.getId());
            data.put("customerName", order.getCustomerName());
            data.put("installationDate", order.getInstallationDate().toString());
            data.put("productType", order.getProductType().name());
            data.put("customerAddress", order.getCustomerAddress());
            return data;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(reminders);
    }

    @GetMapping("/monthly-stats")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyStats() {
        List<Order> allOrders = orderService.getAllOrders();
        
        String[] monthNames = {"Sty", "Lut", "Mar", "Kwi", "Maj", "Cze", "Lip", "Sie", "Wrz", "Paź", "Lis", "Gru"};
        int currentYear = java.time.Year.now().getValue();
        
        Map<Integer, Long> monthCounts = allOrders.stream()
                .filter(o -> o.getStatus() != OrderStatus.ANULOWANE)
                .filter(o -> o.getSubmissionDate().getYear() == currentYear)
                .collect(Collectors.groupingBy(
                        o -> o.getSubmissionDate().getMonthValue(),
                        Collectors.counting()
                ));
        
        List<Map<String, Object>> result = new java.util.ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("name", monthNames[month - 1]);
            entry.put("zamowienia", monthCounts.getOrDefault(month, 0L));
            result.add(entry);
        }
        
        return ResponseEntity.ok(result);
    }
    
    private Map<String, Object> mapOrderToDto(Order order) {
        Map<String, Object> data = new HashMap<>();
        data.put("id", order.getId());
        data.put("customerName", order.getCustomerName());
        data.put("customerEmail", order.getCustomerEmail());
        data.put("customerPhone", order.getCustomerPhone());
        data.put("customerAddress", order.getCustomerAddress());
        data.put("productType", order.getProductType().name());
        data.put("productSpecifications", order.getProductSpecifications());
        data.put("quantity", order.getQuantity());
        data.put("status", order.getStatus().name());
        data.put("submissionDate", order.getSubmissionDate().toString());
        data.put("price", order.getPrice());
        data.put("estimatedDeliveryDate", order.getEstimatedDeliveryDate() != null ? order.getEstimatedDeliveryDate().toString() : null);
        data.put("managerNotes", order.getManagerNotes());
        data.put("completionPercentage", order.getCompletionPercentage());
        data.put("installationDate", order.getInstallationDate() != null ? order.getInstallationDate().toString() : null);
        data.put("productionNotes", order.getProductionNotes());
        data.put("assignedWorkers", order.getAssignedWorkers().stream()
                .map(w -> {
                    Map<String, Object> worker = new HashMap<>();
                    worker.put("id", w.getId());
                    worker.put("name", w.getFirstName() + " " + w.getLastName());
                    return worker;
                })
                .collect(Collectors.toList()));
        return data;
    }
}
