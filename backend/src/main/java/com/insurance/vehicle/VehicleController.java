package com.insurance.vehicle;

import com.insurance.common.ApiResponse;
import com.insurance.vehicle.dto.VehicleDto;
import com.insurance.vehicle.dto.VehicleRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<VehicleDto>>> getMyVehicles(Authentication auth) {
        List<VehicleDto> vehicles = vehicleService.getVehiclesByCustomerEmail(auth.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Vehicles retrieved", vehicles));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('OPERATIONS_MANAGER', 'SUPERVISOR')")
    public ResponseEntity<ApiResponse<List<VehicleDto>>> getAllVehicles() {
        List<VehicleDto> vehicles = vehicleService.getAllVehicles();
        return ResponseEntity.ok(new ApiResponse<>(true, "All vehicles retrieved", vehicles));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'OPERATIONS_MANAGER', 'SUPERVISOR', 'CLAIMS_OFFICER', 'BRANCH_MANAGER')")
    public ResponseEntity<ApiResponse<VehicleDto>> getVehicle(@PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Vehicle retrieved",
                vehicleService.getVehicleById(id, auth)));
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<VehicleDto>> addVehicle(
            Authentication auth, @Valid @RequestBody VehicleRequest request) {
        VehicleDto vehicle = vehicleService.createVehicle(auth.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Vehicle added successfully", vehicle));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'OPERATIONS_MANAGER')")
    public ResponseEntity<ApiResponse<VehicleDto>> updateVehicle(
            @PathVariable UUID id, @Valid @RequestBody VehicleRequest request, Authentication auth) {
        VehicleDto vehicle = vehicleService.updateVehicle(id, request, auth);
        return ResponseEntity.ok(new ApiResponse<>(true, "Vehicle updated", vehicle));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'OPERATIONS_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(@PathVariable UUID id, Authentication auth) {
        vehicleService.deleteVehicle(id, auth);
        return ResponseEntity.ok(new ApiResponse<>(true, "Vehicle deleted", null));
    }
}
