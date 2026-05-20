package com.pbs.BudomexWebApp.service;

import com.pbs.BudomexWebApp.entity.*;
import com.pbs.BudomexWebApp.repository.OrderRepository;
import com.pbs.BudomexWebApp.repository.ProductionTaskRepository;
import com.pbs.BudomexWebApp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);
    private final OrderRepository orderRepository;
    private final ProductionTaskRepository productionTaskRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final InventoryService inventoryService;
    private final RealtimeNotificationService realtime;

    /** Rozgłasza zmianę zamówienia: panele wewnętrzne + publiczne śledzenie. */
    private void broadcast(Order order) {
        realtime.notifyOrders();
        if (order != null) {
            realtime.notifyTracking(order.getAcceptanceToken());
        }
    }

    @Transactional
    public Order createOrder(String customerName, String customerEmail, String customerPhone,
                             String customerAddress, String productType, String productSpecifications,
                             Integer quantity, LocalDate estimatedDeliveryDate) {
        log.info("Tworzenie zamówienia: klient={}, email={}, produkt={}", customerName, customerEmail, productType);
        Order order = Order.builder()
                .customerName(customerName)
                .customerEmail(customerEmail)
                .customerPhone(customerPhone)
                .customerAddress(customerAddress)
                .productType(com.pbs.BudomexWebApp.entity.ProductType.valueOf(productType))
                .productSpecifications(productSpecifications)
                .quantity(quantity != null ? quantity : 1)
                .estimatedDeliveryDate(estimatedDeliveryDate)
                .status(OrderStatus.OCZEKUJACE)
                .build();

        Order saved = orderRepository.saveAndFlush(order);
        log.info("Zamówienie zapisane z ID: {}", saved.getId());
        broadcast(saved);
        return saved;
    }

    public List<Order> getActiveOrders() {
        return orderRepository.findByArchivedFalseOrderBySubmissionDateDesc();
    }

    public List<Order> getArchivedOrders() {
        return orderRepository.findByArchivedTrueOrderBySubmissionDateDesc();
    }

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public Optional<Order> getOrderByToken(String token) {
        return orderRepository.findByAcceptanceToken(token);
    }

    public long countByStatus(OrderStatus status) {
        return orderRepository.countByStatus(status);
    }

    @Transactional
    public Order approveOrder(Long orderId, BigDecimal price, LocalDate estimatedDeliveryDate, String managerNotes) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Zamówienie nie znalezione: " + orderId));

        if (order.getStatus() != OrderStatus.OCZEKUJACE) {
            throw new IllegalStateException("Zamówienie nie jest w statusie OCZEKUJACE");
        }

        OrderStatus previousStatus = order.getStatus();

        order.setStatus(OrderStatus.ZAAKCEPTOWANE_PRZEZ_MISTRZA);
        order.setPrice(price);
        order.setEstimatedDeliveryDate(estimatedDeliveryDate);
        order.setManagerNotes(managerNotes);
        order.setAcceptanceToken(UUID.randomUUID().toString());
        order.setCustomerAcceptanceDeadline(LocalDateTime.now().plusHours(48));

        OrderHistory historyEntry = OrderHistory.createEntry(
                order, previousStatus, OrderStatus.ZAAKCEPTOWANE_PRZEZ_MISTRZA, null,
                "Zamówienie zatwierdzone przez mistrza. Cena: " + price + " PLN");
        order.getHistory().add(historyEntry);

        Order saved = orderRepository.save(order);
        emailService.sendApprovalEmail(saved);
        broadcast(saved);
        return saved;
    }

    @Transactional
    public Order rejectOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Zamówienie nie znalezione: " + orderId));

        if (order.getStatus() != OrderStatus.OCZEKUJACE) {
            throw new IllegalStateException("Zamówienie nie jest w statusie OCZEKUJACE");
        }

        OrderStatus previousStatus = order.getStatus();
        order.setStatus(OrderStatus.ANULOWANE);
        order.setArchived(true);

        OrderHistory historyEntry = OrderHistory.createEntry(
                order, previousStatus, OrderStatus.ANULOWANE, null,
                "Zamówienie odrzucone przez mistrza");
        order.getHistory().add(historyEntry);

        Order saved = orderRepository.save(order);
        emailService.sendRejectionEmail(saved);
        broadcast(saved);
        return saved;
    }

    @Transactional
    public Order customerAccept(String token) {
        Order order = orderRepository.findByAcceptanceToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Nieprawidłowy token akceptacji"));

        if (order.getStatus() != OrderStatus.ZAAKCEPTOWANE_PRZEZ_MISTRZA) {
            throw new IllegalStateException("Zamówienie nie czeka na akceptację klienta");
        }

        if (order.getCustomerAcceptanceDeadline() != null
                && LocalDateTime.now().isAfter(order.getCustomerAcceptanceDeadline())) {
            throw new IllegalStateException("Termin akceptacji minął");
        }

        OrderStatus previousStatus = order.getStatus();
        order.setStatus(OrderStatus.W_REALIZACJI);
        order.setCustomerAccepted(true);
        order.setCustomerResponseDate(LocalDateTime.now());
        order.setProductionStartDate(LocalDateTime.now());

        OrderHistory historyEntry = OrderHistory.createEntry(
                order, previousStatus, OrderStatus.W_REALIZACJI, null,
                "Klient zaakceptował ofertę");
        order.getHistory().add(historyEntry);

        Order saved = orderRepository.save(order);
        emailService.sendCustomerAcceptanceConfirmation(saved);
        // Automatyczna rezerwacja materiałów po akceptacji
        try {
            inventoryService.reserveForOrder(saved);
        } catch (Exception e) {
            log.warn("Nie udało się zarezerwować materiałów dla zamówienia #{}: {}", saved.getId(), e.getMessage());
        }
        broadcast(saved);
        realtime.notifyInventory();
        return saved;
    }

    @Transactional
    public Order customerReject(String token) {
        Order order = orderRepository.findByAcceptanceToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Nieprawidłowy token akceptacji"));

        if (order.getStatus() != OrderStatus.ZAAKCEPTOWANE_PRZEZ_MISTRZA) {
            throw new IllegalStateException("Zamówienie nie czeka na akceptację klienta");
        }

        OrderStatus previousStatus = order.getStatus();
        order.setStatus(OrderStatus.ANULOWANE);
        order.setArchived(true);
        order.setCustomerAccepted(false);
        order.setCustomerResponseDate(LocalDateTime.now());

        OrderHistory historyEntry = OrderHistory.createEntry(
                order, previousStatus, OrderStatus.ANULOWANE, null,
                "Klient odrzucił ofertę");
        order.getHistory().add(historyEntry);

        Order saved = orderRepository.save(order);
        broadcast(saved);
        return saved;
    }

    @Transactional
    public void sendDeadlineReminders() {
        // Wysyłaj przypomnienia 24h przed deadline (gdy 24h <= pozostało < 48h)
        LocalDateTime in24hours = LocalDateTime.now().plusHours(24);
        List<Order> ordersNeedingReminder = orderRepository
                .findByStatusAndReminderSentFalseAndCustomerAcceptanceDeadlineBefore(
                        OrderStatus.ZAAKCEPTOWANE_PRZEZ_MISTRZA, in24hours);

        for (Order order : ordersNeedingReminder) {
            // Sprawdź czy deadline jeszcze nie minął
            if (order.getCustomerAcceptanceDeadline() != null
                    && order.getCustomerAcceptanceDeadline().isAfter(LocalDateTime.now())) {
                emailService.sendDeadlineReminderEmail(order);
                order.setReminderSent(true);
                orderRepository.save(order);
                log.info("Wysłano przypomnienie o terminie do klienta zamówienia #{}", order.getId());
            }
        }
    }

    @Transactional
    public void cancelExpiredOrders() {
        List<Order> expiredOrders = orderRepository.findByStatusAndCustomerAcceptanceDeadlineBefore(
                OrderStatus.ZAAKCEPTOWANE_PRZEZ_MISTRZA, LocalDateTime.now());

        for (Order order : expiredOrders) {
            order.setStatus(OrderStatus.ANULOWANE);
            order.setArchived(true);
            order.setCustomerAccepted(false);

            OrderHistory historyEntry = OrderHistory.createEntry(
                    order, OrderStatus.ZAAKCEPTOWANE_PRZEZ_MISTRZA, OrderStatus.ANULOWANE, null,
                    "Automatyczne anulowanie - klient nie odpowiedział w ciągu 48 godzin");
            order.getHistory().add(historyEntry);

            Order saved = orderRepository.save(order);
            broadcast(saved);
        }
    }

    /**
     * Ustawia (zastępuje) zbiór pracowników przypisanych do zamówienia.
     * Tylko przypisani pracownicy widzą i mogą edytować to zamówienie.
     */
    @Transactional
    public Order assignWorkers(Long orderId, List<Long> workerIds) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Zamówienie nie znalezione: " + orderId));

        Set<User> workers = new HashSet<>();
        if (workerIds != null) {
            for (Long workerId : workerIds) {
                User worker = userRepository.findById(workerId)
                        .orElseThrow(() -> new IllegalArgumentException("Pracownik nie znaleziony: " + workerId));
                if (worker.getRole() != UserRole.WORKER) {
                    throw new IllegalArgumentException(
                            "Użytkownik " + worker.getUsername() + " nie jest pracownikiem produkcji");
                }
                workers.add(worker);
            }
        }

        order.setAssignedWorkers(workers);
        Order saved = orderRepository.save(order);
        broadcast(saved);
        return saved;
    }

    private boolean isWorkerAssigned(Order order, User worker) {
        return worker != null && order.getAssignedWorkers().stream()
                .anyMatch(w -> w.getId().equals(worker.getId()));
    }

    // ========== Worker panel methods ==========

    public List<Order> getOrdersInProduction() {
        return orderRepository.findByStatusOrderBySubmissionDateDesc(OrderStatus.W_REALIZACJI);
    }

    @Transactional
    public Order completeTask(Long taskId, User worker) {
        ProductionTask task = productionTaskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Zadanie nie znalezione: " + taskId));

        Order order = task.getOrder();
        if (!isWorkerAssigned(order, worker)) {
            throw new IllegalStateException("Nie jesteś przypisany do tego zamówienia");
        }
        if (order.getStatus() != OrderStatus.W_REALIZACJI) {
            throw new IllegalStateException("Zamówienie nie jest w realizacji");
        }

        task.markAsCompleted(worker);
        productionTaskRepository.save(task);

        order.calculateCompletionPercentage();

        if (order.getCompletionPercentage() == 100) {
            OrderStatus previousStatus = order.getStatus();
            order.setStatus(OrderStatus.ZREALIZOWANE);
            order.setProductionEndDate(LocalDateTime.now());

            OrderHistory historyEntry = OrderHistory.createEntry(
                    order, previousStatus, OrderStatus.ZREALIZOWANE, worker,
                    "Produkcja zakończona - 100% zadań ukończonych");
            order.getHistory().add(historyEntry);
        }

        Order saved = orderRepository.save(order);
        broadcast(saved);
        return saved;
    }

    @Transactional
    public Order revertTask(Long taskId, User worker) {
        ProductionTask task = productionTaskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Zadanie nie znalezione: " + taskId));

        Order order = task.getOrder();
        if (!isWorkerAssigned(order, worker)) {
            throw new IllegalStateException("Nie jesteś przypisany do tego zamówienia");
        }
        if (order.getStatus() != OrderStatus.W_REALIZACJI && order.getStatus() != OrderStatus.ZREALIZOWANE) {
            throw new IllegalStateException("Zamówienie nie jest w realizacji ani zrealizowane");
        }

        task.markAsIncomplete();
        productionTaskRepository.save(task);

        // If status was ZREALIZOWANE, revert back to W_REALIZACJI
        if (order.getStatus() == OrderStatus.ZREALIZOWANE) {
            OrderStatus previousStatus = order.getStatus();
            order.setStatus(OrderStatus.W_REALIZACJI);
            order.setProductionEndDate(null);

            OrderHistory historyEntry = OrderHistory.createEntry(
                    order, previousStatus, OrderStatus.W_REALIZACJI, null,
                    "Zadanie cofnięte - produkcja wznowiona");
            order.getHistory().add(historyEntry);
        }

        order.calculateCompletionPercentage();

        Order saved = orderRepository.save(order);
        broadcast(saved);
        return saved;
    }

    @Transactional
    public void deleteOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Zamówienie nie znalezione: " + orderId));

        if (order.getStatus() != OrderStatus.ANULOWANE) {
            throw new IllegalStateException("Tylko anulowane zamówienia mogą być usunięte");
        }

        log.info("Usuwanie anulowanego zamówienia #{}", orderId);
        orderRepository.delete(order);
        broadcast(order);
    }

    @Transactional
    public Order assignProductionTasks(Long orderId, List<String> taskDescriptions) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Zamówienie nie znalezione: " + orderId));

        if (order.getStatus() != OrderStatus.W_REALIZACJI) {
            throw new IllegalStateException("Zadania można przypisać tylko do zamówień w realizacji");
        }

        if (taskDescriptions == null || taskDescriptions.isEmpty()) {
            throw new IllegalArgumentException("Lista zadań nie może być pusta");
        }

        // Remove existing uncompleted tasks, keep completed ones
        order.getProductionTasks().removeIf(task -> !Boolean.TRUE.equals(task.getCompleted()));

        int nextSequence = order.getProductionTasks().stream()
                .mapToInt(ProductionTask::getSequenceNumber)
                .max()
                .orElse(-1) + 1;

        for (String description : taskDescriptions) {
            if (description == null || description.trim().isEmpty()) continue;

            // Skip if task with same description already exists
            boolean exists = order.getProductionTasks().stream()
                    .anyMatch(t -> t.getDescription().equals(description.trim()));
            if (exists) continue;

            ProductionTask task = ProductionTask.builder()
                    .description(description.trim())
                    .sequenceNumber(nextSequence++)
                    .completed(false)
                    .build();
            order.addProductionTask(task);
        }

        order.calculateCompletionPercentage();
        Order saved = orderRepository.save(order);
        log.info("Przypisano {} zadań do zamówienia #{}", saved.getProductionTasks().size(), orderId);
        broadcast(saved);
        return saved;
    }

    // ========== Installation methods ==========

    @Transactional
    public Order scheduleInstallation(Long orderId, LocalDateTime installationDate) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Zamówienie nie znalezione: " + orderId));

        if (order.getStatus() != OrderStatus.ZREALIZOWANE) {
            throw new IllegalStateException("Montaż można zaplanować tylko dla zrealizowanych zamówień");
        }

        OrderStatus previousStatus = order.getStatus();
        order.setStatus(OrderStatus.MONTAZ);
        order.setInstallationDate(installationDate);

        OrderHistory historyEntry = OrderHistory.createEntry(
                order, previousStatus, OrderStatus.MONTAZ, null,
                "Zaplanowano montaż na: " + installationDate);
        order.getHistory().add(historyEntry);

        Order saved = orderRepository.save(order);
        broadcast(saved);
        return saved;
    }

    @Transactional
    public Order completeInstallation(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Zamówienie nie znalezione: " + orderId));

        if (order.getStatus() != OrderStatus.MONTAZ) {
            throw new IllegalStateException("Zamówienie nie jest w statusie MONTAZ");
        }

        OrderStatus previousStatus = order.getStatus();
        order.setStatus(OrderStatus.KONIEC);
        order.setArchived(true);

        OrderHistory historyEntry = OrderHistory.createEntry(
                order, previousStatus, OrderStatus.KONIEC, null,
                "Montaż zakończony sukcesem");
        order.getHistory().add(historyEntry);

        Order saved = orderRepository.save(order);
        broadcast(saved);
        return saved;
    }

    @Transactional
    public Order rescheduleInstallation(Long orderId, LocalDateTime newDate) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Zamówienie nie znalezione: " + orderId));

        if (order.getStatus() != OrderStatus.MONTAZ) {
            throw new IllegalStateException("Zamówienie nie jest w statusie MONTAZ");
        }

        LocalDateTime oldDate = order.getInstallationDate();
        order.setInstallationDate(newDate);

        OrderHistory historyEntry = OrderHistory.createEntry(
                order, OrderStatus.MONTAZ, OrderStatus.MONTAZ, null,
                "Zmieniono datę montażu z " + oldDate + " na " + newDate);
        order.getHistory().add(historyEntry);

        Order saved = orderRepository.save(order);
        broadcast(saved);
        return saved;
    }

    @Transactional
    public Order updateProductionNotes(Long orderId, String notes) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Zamówienie nie znalezione: " + orderId));
        order.setProductionNotes(notes);
        Order saved = orderRepository.save(order);
        broadcast(saved);
        return saved;
    }

    public List<Order> getCompletedOrders() {
        return orderRepository.findByStatusOrderBySubmissionDateDesc(OrderStatus.ZREALIZOWANE);
    }

    public List<Order> getInstallationReminders() {
        // Return MONTAZ orders where installation datetime + next day 8:00 has passed
        // i.e. installation date is before today at 8:00 (the reminder shows from 8:00 the next day)
        LocalDateTime cutoff = LocalDate.now().atTime(8, 0);
        return orderRepository.findByStatusAndInstallationDateBefore(
                OrderStatus.MONTAZ, cutoff);
    }
}
