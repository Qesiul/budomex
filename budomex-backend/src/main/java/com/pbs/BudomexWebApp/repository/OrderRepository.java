package com.pbs.BudomexWebApp.repository;

import com.pbs.BudomexWebApp.entity.Order;
import com.pbs.BudomexWebApp.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByArchivedFalseOrderBySubmissionDateDesc();

    List<Order> findByArchivedTrueOrderBySubmissionDateDesc();

    List<Order> findByStatusOrderBySubmissionDateDesc(OrderStatus status);

    Optional<Order> findByAcceptanceToken(String acceptanceToken);

    List<Order> findByStatusAndCustomerAcceptanceDeadlineBefore(OrderStatus status, LocalDateTime deadline);

    long countByStatus(OrderStatus status);

    List<Order> findByStatusAndInstallationDateBefore(OrderStatus status, LocalDateTime date);

    List<Order> findByStatusAndReminderSentFalseAndCustomerAcceptanceDeadlineBefore(OrderStatus status, LocalDateTime deadline);
}
