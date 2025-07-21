package com.example.msa.authservice.domain;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.Persistent;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class User { //유저 entity

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  //기본키

    @Column(nullable = false)
    private String username; // 이름

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "created_at", columnDefinition = "datetime")
    private LocalDate createdAt;

    @PrePersist
    public void prePersist() {
        // 엔티티가 최초 저장되기전 실행
        this.createdAt = LocalDate.from(LocalDateTime.now());
    }


}
