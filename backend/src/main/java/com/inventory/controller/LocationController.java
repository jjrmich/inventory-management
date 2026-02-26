package com.inventory.controller;

import com.inventory.dto.request.LocationRequest;
import com.inventory.dto.response.LocationResponse;
import com.inventory.service.LocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<LocationResponse> createLocation(@Valid @RequestBody LocationRequest request) {
        LocationResponse response = locationService.createLocation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<LocationResponse> getLocationById(@PathVariable Long id) {
        LocationResponse response = locationService.getLocationById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/code/{code}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<LocationResponse> getLocationByCode(@PathVariable String code) {
        LocationResponse response = locationService.getLocationByCode(code);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<List<LocationResponse>> getAllLocations() {
        List<LocationResponse> locations = locationService.getAllLocations();
        return ResponseEntity.ok(locations);
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<List<LocationResponse>> getActiveLocations() {
        List<LocationResponse> locations = locationService.getActiveLocations();
        return ResponseEntity.ok(locations);
    }

    @GetMapping("/city/{city}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<List<LocationResponse>> getLocationsByCity(@PathVariable String city) {
        List<LocationResponse> locations = locationService.getLocationsByCity(city);
        return ResponseEntity.ok(locations);
    }

    @GetMapping("/state/{state}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<List<LocationResponse>> getLocationsByState(@PathVariable String state) {
        List<LocationResponse> locations = locationService.getLocationsByState(state);
        return ResponseEntity.ok(locations);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<LocationResponse> updateLocation(
            @PathVariable Long id,
            @Valid @RequestBody LocationRequest request) {
        LocationResponse response = locationService.updateLocation(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteLocation(@PathVariable Long id) {
        locationService.deleteLocation(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<LocationResponse> deactivateLocation(@PathVariable Long id) {
        LocationResponse response = locationService.deactivateLocation(id);
        return ResponseEntity.ok(response);
    }
}