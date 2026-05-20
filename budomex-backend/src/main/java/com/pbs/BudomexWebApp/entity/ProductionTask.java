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
@Table(name = "production_tasks")
@Getter
@Setter
@EqualsAndHashCode(of = "id")
@ToString(exclude = {"order", "completedBy"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductionTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relacja z zamówieniem
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // Opis zadania
    @Column(nullable = false, length = 500)
    private String description;

    // Kategoria/typ zadania
    @Column(length = 100)
    private String category;

    // Numer kolejności (do sortowania)
    @Column(name = "sequence_number", nullable = false)
    @Builder.Default
    private Integer sequenceNumber = 0;

    // Czy zadanie jest ukończone
    @Column(nullable = false)
    @Builder.Default
    private Boolean completed = false;

    // Data ukończenia zadania
    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // Pracownik który ukończył zadanie
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "completed_by_id")
    private User completedBy;

    // Notatki do zadania
    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Metoda pomocnicza do oznaczania zadania jako ukończone
    public void markAsCompleted(User worker) {
        this.completed = true;
        this.completedAt = LocalDateTime.now();
        this.completedBy = worker;
    }

    // Metoda pomocnicza do cofania ukończenia
    public void markAsIncomplete() {
        this.completed = false;
        this.completedAt = null;
        this.completedBy = null;
    }
}
