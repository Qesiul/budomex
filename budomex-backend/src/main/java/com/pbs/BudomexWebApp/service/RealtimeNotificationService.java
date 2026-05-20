package com.pbs.BudomexWebApp.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.Map;

/**
 * Wysyła powiadomienia real-time przez WebSocket (STOMP).
 *
 * Treść komunikatu jest celowo minimalna ("coś się zmieniło") — frontend po
 * jego odebraniu wykonuje zwykły refetch przez istniejące REST API. Dzięki temu
 * nie duplikujemy logiki/DTO, a polling pozostaje jako fallback.
 *
 * Powiadomienie jest wysyłane PO zatwierdzeniu transakcji (afterCommit), żeby
 * front nie odświeżył się na danych sprzed commitu. Poza transakcją wysyłamy
 * od razu.
 */
@Service
@RequiredArgsConstructor
public class RealtimeNotificationService {

    private static final Logger log = LoggerFactory.getLogger(RealtimeNotificationService.class);
    private final SimpMessagingTemplate messagingTemplate;

    /** Zmiana w zamówieniach — panele managera, pracownika i HR. */
    public void notifyOrders() {
        send("/topic/orders", "ORDERS_CHANGED");
    }

    /** Zmiana stanu magazynu — panel magazynu. */
    public void notifyInventory() {
        send("/topic/inventory", "INVENTORY_CHANGED");
    }

    /** Zmiana konkretnego zamówienia — publiczna strona śledzenia po tokenie. */
    public void notifyTracking(String acceptanceToken) {
        if (acceptanceToken != null && !acceptanceToken.isBlank()) {
            send("/topic/track/" + acceptanceToken, "ORDER_UPDATED");
        }
    }

    private void send(String destination, String type) {
        Runnable task = () -> {
            try {
                Object payload = Map.of("type", type, "ts", System.currentTimeMillis());
                messagingTemplate.convertAndSend(destination, payload);
            } catch (Exception e) {
                log.warn("Nie udało się wysłać powiadomienia WS na {}: {}", destination, e.getMessage());
            }
        };

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    task.run();
                }
            });
        } else {
            task.run();
        }
    }
}
