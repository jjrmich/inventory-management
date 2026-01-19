package com.inventory.model.enums;

public enum Role {
    ADMIN,    // Full access - manage users, all inventory operations
    MANAGER,  // Can adjust inventory, view reports, manage products
    STAFF     // Can view inventory, log transactions
}