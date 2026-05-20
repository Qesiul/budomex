package com.pbs.BudomexWebApp.controller;

import com.pbs.BudomexWebApp.entity.Order;
import com.pbs.BudomexWebApp.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/order/accept")
@RequiredArgsConstructor
public class CustomerAcceptanceController {

    private final OrderService orderService;

    @GetMapping("/{token}")
    public ResponseEntity<Map<String, Object>> getOrderDetailsForAcceptance(@PathVariable String token) {
        Optional<Order> orderOpt = orderService.getOrderByToken(token);

        if (orderOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Nieprawidłowy link. Zamówienie nie zostało znalezione."));
        }

        Order order = orderOpt.get();
        Map<String, Object> response = new HashMap<>();
        
        Map<String, Object> orderData = new HashMap<>();
        orderData.put("id", order.getId());
        orderData.put("productType", order.getProductType().name());
        orderData.put("productSpecifications", order.getProductSpecifications());
        orderData.put("quantity", order.getQuantity());
        orderData.put("price", order.getPrice());
        orderData.put("estimatedDeliveryDate", order.getEstimatedDeliveryDate() != null ? order.getEstimatedDeliveryDate().toString() : null);
        orderData.put("customerAcceptanceDeadline", order.getCustomerAcceptanceDeadline() != null ? order.getCustomerAcceptanceDeadline().toString() : null);
        
        response.put("order", orderData);

        if (order.getCustomerAccepted() != null) {
            response.put("alreadyResponded", true);
            response.put("accepted", order.getCustomerAccepted());
        } else if (order.getCustomerAcceptanceDeadline() != null
                && LocalDateTime.now().isAfter(order.getCustomerAcceptanceDeadline())) {
            response.put("expired", true);
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{token}/confirm")
    public ResponseEntity<Map<String, Object>> acceptOrder(@PathVariable String token) {
        try {
            orderService.customerAccept(token);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "accepted", true,
                    "message", "Oferta została zaakceptowana. Zamówienie w realizacji."
            ));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{token}/reject")
    public ResponseEntity<Map<String, Object>> rejectOrder(@PathVariable String token) {
        try {
            orderService.customerReject(token);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "accepted", false,
                    "message", "Oferta została odrzucona. Zamówienie anulowane."
            ));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{token}/track")
    public ResponseEntity<Map<String, Object>> trackOrder(@PathVariable String token) {
        Optional<Order> orderOpt = orderService.getOrderByToken(token);

        if (orderOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Nieprawidłowy link. Zamówienie nie zostało znalezione."));
        }

        Order order = orderOpt.get();
        
        if (order.getCustomerAccepted() == null || !order.getCustomerAccepted()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Zamówienie nie zostało zaakceptowane."));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", order.getId());
        response.put("productType", order.getProductType().name());
        response.put("productSpecifications", order.getProductSpecifications());
        response.put("quantity", order.getQuantity());
        response.put("status", order.getStatus().name());
        response.put("completionPercentage", order.getCompletionPercentage());
        response.put("estimatedDeliveryDate", order.getEstimatedDeliveryDate() != null ? order.getEstimatedDeliveryDate().toString() : null);
        response.put("installationDate", order.getInstallationDate() != null ? order.getInstallationDate().toString() : null);
        
        int totalTasks = order.getProductionTasks().size();
        long completedTasks = order.getProductionTasks().stream().filter(t -> Boolean.TRUE.equals(t.getCompleted())).count();
        response.put("totalTasks", totalTasks);
        response.put("completedTasks", completedTasks);

        return ResponseEntity.ok(response);
    }
}
