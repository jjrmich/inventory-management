package com.inventory.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LocationRequest {

    @NotBlank(message = "Location code is required")
    @Size(max = 50, message = "Code must be less than 50 characters")
    private String code;

    @NotBlank(message = "Location name is required")
    @Size(max = 200, message = "Name must be less than 200 characters")
    private String name;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "Zip code is required")
    private String zipCode;

    @NotBlank(message = "Country is required")
    private String country;

    private String phone;

    private Boolean active = true;
}