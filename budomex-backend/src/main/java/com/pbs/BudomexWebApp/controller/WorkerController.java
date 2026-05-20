package com.pbs.BudomexWebApp.controller;

import com.pbs.BudomexWebApp.entity.Order;
import com.pbs.BudomexWebApp.entity.User;
import com.pbs.BudomexWebApp.repository.UserRepository;
import com.pbs.BudomexWebApp.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/worker")
@RequiredArgsConstructor
public class WorkerController {

    private static final Logger log = LoggerFactory.getLogger(WorkerController.class);
    private final OrderService orderService;
    private final UserRepository userRepository;

    @GetMapping("/orders")
    public ResponseEntity<List<Map<String, Object>>> getWorkerOrders(Authentication authentication) {
        User worker = userRepository.findByUsername(authentication.getName()).orElse(null);
        List<Order> allOrders = orderService.getOrdersInProduction();

        // Pokazuj WYŁĄCZNIE zamówienia, do których pracownik jest przypisany.
        // Zamówienia bez przypisania nie są widoczne dla nikogo.
        final Long workerId = worker != null ? worker.getId() : null;
        List<Order> orders = allOrders.stream()
                .filter(o -> workerId != null && o.getAssignedWorkers().stream()
                        .anyMatch(w -> w.getId().equals(workerId)))
                .collect(Collectors.toList());
        log.info("Panel pracownika {} - liczba zamówień: {}/{}", 
                authentication.getName(), orders.size(), allOrders.size());
        
        List<Map<String, Object>> result = orders.stream().map(order -> {
            Map<String, Object> data = new HashMap<>();
            data.put("id", order.getId());
            data.put("customerName", order.getCustomerName());
            data.put("productType", order.getProductType().name());
            data.put("completionPercentage", order.getCompletionPercentage());
            data.put("estimatedDeliveryDate", order.getEstimatedDeliveryDate() != null ? order.getEstimatedDeliveryDate().toString() : null);
            data.put("assignedToMe", workerId != null && order.getAssignedWorkers().stream()
                    .anyMatch(w -> w.getId().equals(workerId)));
            return data;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }

    @PostMapping("/task/{taskId}/complete")
    public ResponseEntity<Map<String, Object>> completeTask(@PathVariable Long taskId,
                                                             Authentication authentication) {
        try {
            User worker = userRepository.findByUsername(authentication.getName())
                    .orElseThrow(() -> new IllegalStateException("Nie znaleziono użytkownika"));

            Order order = orderService.completeTask(taskId, worker);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Zadanie oznaczone jako ukończone");
            response.put("completionPercentage", order.getCompletionPercentage());
            response.put("orderStatus", order.getStatus().name());
            return ResponseEntity.ok(response);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/task/{taskId}/revert")
    public ResponseEntity<Map<String, Object>> revertTask(@PathVariable Long taskId,
                                                          Authentication authentication) {
        try {
            User worker = userRepository.findByUsername(authentication.getName())
                    .orElseThrow(() -> new IllegalStateException("Nie znaleziono użytkownika"));
            Order order = orderService.revertTask(taskId, worker);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Zadanie cofnięte");
            response.put("completionPercentage", order.getCompletionPercentage());
            response.put("orderStatus", order.getStatus().name());
            return ResponseEntity.ok(response);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/order/{id}")
    public ResponseEntity<Map<String, Object>> getOrderDetails(@PathVariable Long id,
                                                               Authentication authentication) {
        User worker = userRepository.findByUsername(authentication.getName()).orElse(null);
        final Long workerId = worker != null ? worker.getId() : null;
        return orderService.getOrderById(id)
                .map(order -> {
                    boolean assigned = workerId != null && order.getAssignedWorkers().stream()
                            .anyMatch(w -> w.getId().equals(workerId));
                    if (!assigned) {
                        return ResponseEntity.status(403)
                                .body(Map.<String, Object>of("error", "Brak dostępu do tego zamówienia"));
                    }
                    Map<String, Object> data = new HashMap<>();
                    data.put("id", order.getId());
                    // Brak pełnych danych klienta/finansów - dostosowano do specyfikacji
                    data.put("customerName", order.getCustomerName());
                    data.put("customerAddress", order.getCustomerAddress());
                    data.put("productType", order.getProductType().name());
                    data.put("productSpecifications", order.getProductSpecifications());
                    data.put("quantity", order.getQuantity());
                    data.put("status", order.getStatus().name());
                    data.put("completionPercentage", order.getCompletionPercentage());
                    data.put("estimatedDeliveryDate",
                            order.getEstimatedDeliveryDate() != null ? order.getEstimatedDeliveryDate().toString() : null);
                    data.put("productionNotes", order.getProductionNotes());
                    data.put("tasks", order.getProductionTasks().stream().map(task -> {
                        Map<String, Object> t = new HashMap<>();
                        t.put("id", task.getId());
                        t.put("description", task.getDescription());
                        t.put("completed", task.getCompleted());
                        t.put("sequenceNumber", task.getSequenceNumber());
                        t.put("category", task.getCategory());
                        return t;
                    }).collect(Collectors.toList()));
                    return ResponseEntity.ok(data);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        List<Order> orders = orderService.getOrdersInProduction();
        long totalTasks = orders.stream()
                .mapToLong(o -> o.getProductionTasks().size())
                .sum();
        long completedTasks = orders.stream()
                .flatMap(o -> o.getProductionTasks().stream())
                .filter(t -> Boolean.TRUE.equals(t.getCompleted()))
                .count();

        Map<String, Long> stats = new HashMap<>();
        stats.put("activeOrders", (long) orders.size());
        stats.put("totalTasks", totalTasks - completedTasks); // backlog
        stats.put("completedTasks", completedTasks);
        return ResponseEntity.ok(stats);
    }

    @PostMapping("/order/{id}/notes")
    public ResponseEntity<Map<String, String>> updateProductionNotes(@PathVariable Long id,
                                                                       @RequestBody Map<String, String> payload) {
        try {
            String notes = payload.get("notes");
            orderService.updateProductionNotes(id, notes);
            return ResponseEntity.ok(Map.of("message", "Notatki zapisane"));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> getCompletedHistory() {
        List<Order> completed = orderService.getCompletedOrders();
        List<Map<String, Object>> result = completed.stream().map(order -> {
            Map<String, Object> data = new HashMap<>();
            data.put("id", order.getId());
            data.put("customerName", order.getCustomerName());
            data.put("productType", order.getProductType().name());
            data.put("quantity", order.getQuantity());
            data.put("status", order.getStatus().name());
            data.put("productionEndDate", order.getProductionEndDate() != null ? order.getProductionEndDate().toString() : null);
            data.put("totalTasks", order.getProductionTasks().size());
            return data;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
}
