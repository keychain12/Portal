package com.example.workspaceservice.common;

import com.example.workspaceservice.repository.WorkspaceRepository;
import jakarta.persistence.Column;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;


@Component
@RequiredArgsConstructor
public class SlugGenerator { // 랜덤 슬러그 url 만드는거 따로 빼버림

    private final WorkspaceRepository workspaceRepository;

    public String generate() {
        String slug;
        do {
            // w + 10자리 랜덤 숫자-8자리 랜덤 문자열
            String part1 = "w" + (long)(Math.random() * 1_000_000_0000L);
            String part2 = randomAlphaNumeric(8).toLowerCase();
            slug = part1 + "-" + part2;
        } while (workspaceRepository.existsByUrlSlug(slug));
        return slug;
    }
    private String randomAlphaNumeric(int count) {
        String chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < count; i++) {
            sb.append(chars.charAt((int)(Math.random() * chars.length())));
        }
        return sb.toString();
    }
}
