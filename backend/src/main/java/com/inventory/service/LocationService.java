package com.inventory.service;

import com.inventory.dto.request.LocationRequest;
import com.inventory.dto.response.LocationResponse;
import com.inventory.model.Location;
import com.inventory.repository.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final LocationRepository locationRepository;

    @Transactional
    public LocationResponse createLocation(LocationRequest request) {
        if (locationRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Location with code " + request.getCode() + " already exists");
        }

        Location location = Location.builder()
                .code(request.getCode())
                .name(request.getName())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .zipCode(request.getZipCode())
                .country(request.getCountry())
                .phone(request.getPhone())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        Location savedLocation = locationRepository.save(location);
        return mapToResponse(savedLocation);
    }

    public LocationResponse getLocationById(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found with id: " + id));
        return mapToResponse(location);
    }

    public LocationResponse getLocationByCode(String code) {
        Location location = locationRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Location not found with code: " + code));
        return mapToResponse(location);
    }

    public List<LocationResponse> getAllLocations() {
        return locationRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<LocationResponse> getActiveLocations() {
        return locationRepository.findByActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<LocationResponse> getLocationsByCity(String city) {
        return locationRepository.findByCity(city).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<LocationResponse> getLocationsByState(String state) {
        return locationRepository.findByState(state).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public LocationResponse updateLocation(Long id, LocationRequest request) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found with id: " + id));

        // Check if code is being changed and if new code already exists
        if (!location.getCode().equals(request.getCode()) &&
                locationRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Location with code " + request.getCode() + " already exists");
        }

        location.setCode(request.getCode());
        location.setName(request.getName());
        location.setAddress(request.getAddress());
        location.setCity(request.getCity());
        location.setState(request.getState());
        location.setZipCode(request.getZipCode());
        location.setCountry(request.getCountry());
        location.setPhone(request.getPhone());
        location.setActive(request.getActive() != null ? request.getActive() : location.isActive());

        Location updatedLocation = locationRepository.save(location);
        return mapToResponse(updatedLocation);
    }

    @Transactional
    public void deleteLocation(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found with id: " + id));
        locationRepository.delete(location);
    }

    @Transactional
    public LocationResponse deactivateLocation(Long id) {
        Location location = locationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Location not found with id: " + id));
        location.setActive(false);
        Location updatedLocation = locationRepository.save(location);
        return mapToResponse(updatedLocation);
    }

    private LocationResponse mapToResponse(Location location) {
        return LocationResponse.builder()
                .id(location.getId())
                .code(location.getCode())
                .name(location.getName())
                .address(location.getAddress())
                .city(location.getCity())
                .state(location.getState())
                .zipCode(location.getZipCode())
                .country(location.getCountry())
                .phone(location.getPhone())
                .active(location.isActive())
                .createdAt(location.getCreatedAt())
                .updatedAt(location.getUpdatedAt())
                .build();
    }
}