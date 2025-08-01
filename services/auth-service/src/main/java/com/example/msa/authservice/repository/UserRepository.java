package com.example.msa.authservice.repository;

import com.example.msa.authservice.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {


    Optional<User> findByEmail(String email);       // 새로 추가

    boolean existsByEmail(String email);
}
