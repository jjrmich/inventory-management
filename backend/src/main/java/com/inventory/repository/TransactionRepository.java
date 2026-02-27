package com.inventory.repository;

import com.inventory.model.Transaction;
import com.inventory.model.enums.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByProductId(Long productId);
    List<Transaction> findByProductIdOrderByCreatedAtDesc(Long productId);
    Page<Transaction> findByProductId(Long productId, Pageable pageable);
    List<Transaction> findByType(TransactionType type);
    List<Transaction> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}