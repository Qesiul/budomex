package com.pbs.BudomexWebApp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Table(name = "order_history")
@Getter
@Setter
@EqualsAndHashCode(of = "id")
@ToString(exclude = {"order", "changedBy"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relacja z zamówieniem
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // Poprzedni status
    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", length = 30)
    private OrderStatus previousStatus;

    // Nowy status
    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 30)
    private OrderStatus newStatus;

    // Użytkownik który dokonał zmiany
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by_id")
    private User changedBy;

    // Notatki do zmiany
    @Column(columnDefinition = "TEXT")
    private String notes;

    // Data zmiany
    @Column(name = "changed_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime changedAt = LocalDateTime.now();

    // Metoda fabryczna do tworzenia wpisu historii
    public static OrderHistory createEntry(Order order, OrderStatus previousStatus,
                                           OrderStatus newStatus, User changedBy, String notes) {
        return OrderHistory.builder()
                .order(order)
                .previousStatus(previousStatus)
                .newStatus(newStatus)
                .changedBy(changedBy)
                .notes(notes)
                .build();
    }
}
