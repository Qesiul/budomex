package com.pbs.BudomexWebApp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "orders")
@Getter
@Setter
@EqualsAndHashCode(of = "id")
@ToString(exclude = {"productionTasks", "history", "assignedWorkers", "approvedByManager"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Dane klienta
    @Column(name = "customer_name", nullable = false, length = 200)
    private String customerName;

    @Column(name = "customer_email", nullable = false, length = 255)
    private String customerEmail;

    @Column(name = "customer_phone", length = 20)
    private String customerPhone;

    @Column(name = "customer_address", columnDefinition = "TEXT")
    private String customerAddress;

    // Typ produktu
    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", nullable = false, length = 30)
    private ProductType productType;

    // Specyfikacja produktu (JSON lub tekst z parametrami)
    @Column(name = "product_specifications", columnDefinition = "TEXT")
    private String productSpecifications;

    // Ilość
    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    // Status zamówienia
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private OrderStatus status = OrderStatus.OCZEKUJACE;

    // Cena (ustalona przez Mistrza)
    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    // Data złożenia zamówienia
    @Column(name = "submission_date", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime submissionDate = LocalDateTime.now();

    // Szacowana data dostawy (ustalona przez Mistrza)
    @Column(name = "estimated_delivery_date")
    private LocalDate estimatedDeliveryDate;

    // Deadline na akceptację przez klienta (48h od zatwierdzenia przez Mistrza)
    @Column(name = "customer_acceptance_deadline")
    private LocalDateTime customerAcceptanceDeadline;

    // Czy klient zaakceptował ofertę
    @Column(name = "customer_accepted")
    private Boolean customerAccepted;

    // Data akceptacji/odrzucenia przez klienta
    @Column(name = "customer_response_date")
    private LocalDateTime customerResponseDate;

    // Data rozpoczęcia produkcji
    @Column(name = "production_start_date")
    private LocalDateTime productionStartDate;

    // Data zakończenia produkcji
    @Column(name = "production_end_date")
    private LocalDateTime productionEndDate;

    // Data i godzina montażu
    @Column(name = "installation_date")
    private LocalDateTime installationDate;

    // Notatki Mistrza
    @Column(name = "manager_notes", columnDefinition = "TEXT")
    private String managerNotes;

    // Notatki produkcyjne
    @Column(name = "production_notes", columnDefinition = "TEXT")
    private String productionNotes;

    // Token do akceptacji zamówienia przez klienta (link w emailu)
    @Column(name = "acceptance_token", unique = true)
    private String acceptanceToken;

    // Czy wysłano przypomnienie o zbliżającym się deadline (24h przed)
    @Column(name = "reminder_sent")
    @Builder.Default
    private Boolean reminderSent = false;

    // Czy zamówienie jest zarchiwizowane
    @Column(nullable = false)
    @Builder.Default
    private Boolean archived = false;

    // Procent ukończenia produkcji (0-100)
    @Column(name = "completion_percentage", nullable = false)
    @Builder.Default
    private Integer completionPercentage = 0;

    // Relacja z zadaniami produkcyjnymi
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductionTask> productionTasks = new ArrayList<>();

    // Relacja z historią zamówienia
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderHistory> history = new ArrayList<>();

    // Mistrz który zatwierdził zamówienie
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by_manager_id")
    private User approvedByManager;

    // Pracownicy przypisani do realizacji (wielu na zamówienie)
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "order_assigned_workers",
            joinColumns = @JoinColumn(name = "order_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id"))
    @Builder.Default
    private Set<User> assignedWorkers = new HashSet<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Metoda pomocnicza do obliczania procentu ukończenia
    public void calculateCompletionPercentage() {
        if (productionTasks == null || productionTasks.isEmpty()) {
            this.completionPercentage = 0;
            return;
        }
        long completedTasks = productionTasks.stream()
                .filter(ProductionTask::getCompleted)
                .count();
        this.completionPercentage = (int) ((completedTasks * 100) / productionTasks.size());
    }

    // Metoda pomocnicza do dodawania zadania produkcyjnego
    public void addProductionTask(ProductionTask task) {
        productionTasks.add(task);
        task.setOrder(this);
    }

    // Metoda pomocnicza do usuwania zadania produkcyjnego
    public void removeProductionTask(ProductionTask task) {
        productionTasks.remove(task);
        task.setOrder(null);
    }
}
