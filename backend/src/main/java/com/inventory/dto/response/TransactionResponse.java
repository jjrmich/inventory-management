package com.inventory.dto.response;

import com.inventory.model.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private Long fromLocationId;
    private String fromLocationName;
    private Long toLocationId;
    private String toLocationName;
    private TransactionType type;
    private Integer quantity;
    private String notes;
    private String performedBy;
    private LocalDateTime createdAt;
}