package com.pbs.BudomexWebApp.controller;

import com.pbs.BudomexWebApp.entity.Order;
import com.pbs.BudomexWebApp.entity.OrderStatus;
import com.pbs.BudomexWebApp.entity.User;
import com.pbs.BudomexWebApp.entity.UserRole;
import com.pbs.BudomexWebApp.repository.OrderRepository;
import com.pbs.BudomexWebApp.repository.UserRepository;
import com.pbs.BudomexWebApp.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/manager/hr")
@RequiredArgsConstructor
public class HRController {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final OrderService orderService;

    @GetMapping("/workers")
    public ResponseEntity<List<Map<String, Object>>> getAllWorkers() {
        List<User> workers = userRepository.findByRole(UserRole.WORKER);
        List<Order> activeOrders = orderRepository.findByStatusOrderBySubmissionDateDesc(OrderStatus.W_REALIZACJI);

        List<Map<String, Object>> result = workers.stream().map(worker -> {
            Map<String, Object> data = new HashMap<>();
            data.put("id", worker.getId());
            data.put("username", worker.getUsername());
            data.put("firstName", worker.getFirstName());
            data.put("lastName", worker.getLastName());
            data.put("email", worker.getEmail());

            // Liczba aktywnych zamówień przypisanych
            long assignedOrders = activeOrders.stream()
                    .filter(o -> o.getAssignedWorkers().stream()
                            .anyMatch(aw -> aw.getId().equals(worker.getId())))
                    .count();
            data.put("assignedOrders", assignedOrders);

            // Obciążenie 0-3: low, 4-6: medium, 7+: high
            String workload;
            if (assignedOrders == 0) workload = "free";
            else if (assignedOrders <= 2) workload = "low";
            else if (assignedOrders <= 4) workload = "medium";
            else workload = "high";
            data.put("workload", workload);

            return data;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/availability")
    public ResponseEntity<Map<String, Object>> getAvailabilityCalendar() {
        List<User> workers = userRepository.findByRole(UserRole.WORKER);
        List<Order> activeOrders = orderRepository.findByStatusOrderBySubmissionDateDesc(OrderStatus.W_REALIZACJI);

        Map<String, Object> result = new HashMap<>();
        result.put("totalWorkers", workers.size());
        result.put("ordersInProduction", activeOrders.size());

        List<Map<String, Object>> workersData = workers.stream().map(w -> {
            Map<String, Object> wd = new HashMap<>();
            wd.put("id", w.getId());
            wd.put("name", w.getFirstName() + " " + w.getLastName());
            
            List<Map<String, Object>> orders = activeOrders.stream()
                    .filter(o -> o.getAssignedWorkers().stream()
                            .anyMatch(aw -> aw.getId().equals(w.getId())))
                    .map(o -> {
                        Map<String, Object> od = new HashMap<>();
                        od.put("orderId", o.getId());
                        od.put("productType", o.getProductType().name());
                        od.put("estimatedDeliveryDate", 
                                o.getEstimatedDeliveryDate() != null ? o.getEstimatedDeliveryDate().toString() : null);
                        od.put("completionPercentage", o.getCompletionPercentage());
                        return od;
                    })
                    .collect(Collectors.toList());
            wd.put("assignedOrders", orders);
            return wd;
        }).collect(Collectors.toList());
        result.put("workers", workersData);

        return ResponseEntity.ok(result);
    }

    @PostMapping("/order/{orderId}/assign/{workerId}")
    @Transactional
    public ResponseEntity<Map<String, String>> assignWorkerToOrder(@PathVariable Long orderId,
                                                                     @PathVariable Long workerId) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new IllegalArgumentException("Zamówienie nie znalezione"));
            User worker = userRepository.findById(workerId)
                    .orElseThrow(() -> new IllegalArgumentException("Pracownik nie znaleziony"));

            if (worker.getRole() != UserRole.WORKER) {
                throw new IllegalArgumentException("Użytkownik nie jest pracownikiem produkcji");
            }

            // Dodaj pracownika do istniejącego zbioru przypisanych (wielu na zamówienie)
            List<Long> ids = order.getAssignedWorkers().stream()
                    .map(User::getId)
                    .collect(Collectors.toList());
            if (!ids.contains(workerId)) {
                ids.add(workerId);
            }
            orderService.assignWorkers(orderId, ids);

            return ResponseEntity.ok(Map.of(
                    "message", "Pracownik " + worker.getFirstName() + " " + worker.getLastName()
                            + " został przypisany do zamówienia #" + orderId
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/order/{orderId}/unassign")
    @Transactional
    public ResponseEntity<Map<String, String>> unassignWorker(@PathVariable Long orderId) {
        try {
            orderRepository.findById(orderId)
                    .orElseThrow(() -> new IllegalArgumentException("Zamówienie nie znalezione"));
            orderService.assignWorkers(orderId, java.util.List.of());
            return ResponseEntity.ok(Map.of("message", "Przypisanie pracowników usunięte"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
