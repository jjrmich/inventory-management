package com.inventory.repository;

import com.inventory.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    Optional<Location> findByCode(String code);
    boolean existsByCode(String code);
    List<Location> findByActiveTrue();
    List<Location> findByCity(String city);
    List<Location> findByState(String state);
}