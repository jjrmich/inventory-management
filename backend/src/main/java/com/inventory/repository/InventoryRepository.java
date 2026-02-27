package com.inventory.repository;

import com.inventory.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    Optional<Inventory> findByProductIdAndLocationId(Long productId, Long locationId);
    List<Inventory> findByProductId(Long productId);
    List<Inventory> findByLocationId(Long locationId);

    @Query("SELECT i FROM Inventory i WHERE i.quantity < i.minQuantity")
    List<Inventory> findLowStockItems();

    @Query("SELECT i FROM Inventory i WHERE i.product.id = :productId AND i.quantity > 0")
    List<Inventory> findAvailableInventoryForProduct(Long productId);
}