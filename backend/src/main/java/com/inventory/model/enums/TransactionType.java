package com.inventory.model.enums;

public enum TransactionType {
    ADDITION,       // Stock added (e.g., receiving shipment)
    REMOVAL,        // Stock removed (e.g., sale, damage)
    TRANSFER,       // Stock moved between locations
    ADJUSTMENT      // Manual correction
}