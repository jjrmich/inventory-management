package com.inventory.service;

import com.inventory.dto.request.InventoryRequest;
import com.inventory.dto.request.TransactionRequest;
import com.inventory.dto.response.InventoryResponse;
import com.inventory.dto.response.TransactionResponse;
import com.inventory.model.*;
import com.inventory.model.enums.TransactionType;
import com.inventory.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final TransactionRepository transactionRepository;
    private final ProductRepository productRepository;
    private final LocationRepository locationRepository;
    private final UserRepository userRepository;

    @Transactional
    public InventoryResponse setInventory(InventoryRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));
        Location location = locationRepository.findById(request.getLocationId())
                .orElseThrow(() -> new RuntimeException("Location not found"));

        Inventory inventory = inventoryRepository
                .findByProductIdAndLocationId(request.getProductId(), request.getLocationId())
                .orElse(Inventory.builder()
                        .product(product)
                        .location(location)
                        .quantity(0)
                        .build());

        inventory.setQuantity(request.getQuantity());
        inventory.setMinQuantity(request.getMinQuantity() != null ? request.getMinQuantity() : 0);
        inventory.setMaxQuantity(request.getMaxQuantity());

        return mapToInventoryResponse(inventoryRepository.save(inventory));
    }

    @Transactional
    public TransactionResponse processTransaction(TransactionRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User performedBy = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Location fromLocation = null;
        Location toLocation = null;

        switch (request.getType()) {
            case ADDITION:
                toLocation = locationRepository.findById(request.getToLocationId())
                        .orElseThrow(() -> new RuntimeException("Location not found"));
                adjustStock(product, toLocation, request.getQuantity());
                break;

            case REMOVAL:
                fromLocation = locationRepository.findById(request.getFromLocationId())
                        .orElseThrow(() -> new RuntimeException("Location not found"));
                adjustStock(product, fromLocation, -request.getQuantity());
                break;

            case TRANSFER:
                fromLocation = locationRepository.findById(request.getFromLocationId())
                        .orElseThrow(() -> new RuntimeException("From location not found"));
                toLocation = locationRepository.findById(request.getToLocationId())
                        .orElseThrow(() -> new RuntimeException("To location not found"));
                adjustStock(product, fromLocation, -request.getQuantity());
                adjustStock(product, toLocation, request.getQuantity());
                break;

            case ADJUSTMENT:
                toLocation = locationRepository.findById(request.getToLocationId())
                        .orElseThrow(() -> new RuntimeException("Location not found"));
                Inventory inv = inventoryRepository
                        .findByProductIdAndLocationId(product.getId(), toLocation.getId())
                        .orElseThrow(() -> new RuntimeException("Inventory record not found"));
                inv.setQuantity(request.getQuantity());
                inventoryRepository.save(inv);
                break;
        }

        Transaction transaction = Transaction.builder()
                .product(product)
                .fromLocation(fromLocation)
                .toLocation(toLocation)
                .type(request.getType())
                .quantity(request.getQuantity())
                .notes(request.getNotes())
                .performedBy(performedBy)
                .build();

        return mapToTransactionResponse(transactionRepository.save(transaction));
    }

    private void adjustStock(Product product, Location location, int delta) {
        Inventory inventory = inventoryRepository
                .findByProductIdAndLocationId(product.getId(), location.getId())
                .orElse(Inventory.builder()
                        .product(product)
                        .location(location)
                        .quantity(0)
                        .minQuantity(0)
                        .build());

        int newQty = inventory.getQuantity() + delta;
        if (newQty < 0) {
            throw new RuntimeException("Insufficient stock at location: " + location.getName());
        }
        inventory.setQuantity(newQty);
        inventoryRepository.save(inventory);
    }

    public List<InventoryResponse> getInventoryByProduct(Long productId) {
        return inventoryRepository.findByProductId(productId)
                .stream().map(this::mapToInventoryResponse).collect(Collectors.toList());
    }

    public List<InventoryResponse> getInventoryByLocation(Long locationId) {
        return inventoryRepository.findByLocationId(locationId)
                .stream().map(this::mapToInventoryResponse).collect(Collectors.toList());
    }

    public List<InventoryResponse> getLowStockItems() {
        return inventoryRepository.findLowStockItems()
                .stream().map(this::mapToInventoryResponse).collect(Collectors.toList());
    }

    public Page<TransactionResponse> getTransactionsByProduct(Long productId, Pageable pageable) {
        return transactionRepository.findByProductId(productId, pageable)
                .map(this::mapToTransactionResponse);
    }

    public List<TransactionResponse> getAllTransactions() {
        return transactionRepository.findAll()
                .stream().map(this::mapToTransactionResponse).collect(Collectors.toList());
    }

    private InventoryResponse mapToInventoryResponse(Inventory inv) {
        return InventoryResponse.builder()
                .id(inv.getId())
                .productId(inv.getProduct().getId())
                .productName(inv.getProduct().getName())
                .productSku(inv.getProduct().getSku())
                .locationId(inv.getLocation().getId())
                .locationName(inv.getLocation().getName())
                .locationCode(inv.getLocation().getCode())
                .quantity(inv.getQuantity())
                .minQuantity(inv.getMinQuantity())
                .maxQuantity(inv.getMaxQuantity())
                .lowStock(inv.getMinQuantity() != null && inv.getQuantity() < inv.getMinQuantity())
                .createdAt(inv.getCreatedAt())
                .updatedAt(inv.getUpdatedAt())
                .build();
    }

    private TransactionResponse mapToTransactionResponse(Transaction t) {
        return TransactionResponse.builder()
                .id(t.getId())
                .productId(t.getProduct().getId())
                .productName(t.getProduct().getName())
                .productSku(t.getProduct().getSku())
                .fromLocationId(t.getFromLocation() != null ? t.getFromLocation().getId() : null)
                .fromLocationName(t.getFromLocation() != null ? t.getFromLocation().getName() : null)
                .toLocationId(t.getToLocation() != null ? t.getToLocation().getId() : null)
                .toLocationName(t.getToLocation() != null ? t.getToLocation().getName() : null)
                .type(t.getType())
                .quantity(t.getQuantity())
                .notes(t.getNotes())
                .performedBy(t.getPerformedBy().getUsername())
                .createdAt(t.getCreatedAt())
                .build();
    }
}