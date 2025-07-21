package com.example.msa.authservice.service;

import com.example.msa.authservice.domain.User;
import com.example.msa.authservice.dto.response.UserProfileResponse;
import com.example.msa.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    private final UserRepository userRepository;
    public UserProfileResponse getUserProfileByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "유저를 찾지 못했습니다."));

        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .build();
    }

    public UserProfileResponse findById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "유저를 찾지 못했습니다."));

        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .build();

    }

    public List<UserProfileResponse> findUsersByIds(List<Long> usersIds) {
        List<User> allById = userRepository.findAllById(usersIds);
        return allById.stream().map(a -> UserProfileResponse.builder()
                        .id(a.getId()).email(a.getEmail()).username(a.getUsername()).build())
                        .toList();

    }
}
