package com.example.intercation.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
@Getter
public class Role {
    @Id
    @GeneratedValue
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;

    @ElementCollection(fetch = FetchType.EAGER) // permissions은 Role에 종속된거라고 하네요..
    @CollectionTable(name = "role_permissions", joinColumns = @JoinColumn(name = "role_id")) //ElementCollection 이거에대한 테이블설정 테이블이름,조인컬럼
    @Enumerated(EnumType.STRING)
    @Column(name = "permission", nullable = false)
    private Set<Permission> permissions = new HashSet<>();

}
