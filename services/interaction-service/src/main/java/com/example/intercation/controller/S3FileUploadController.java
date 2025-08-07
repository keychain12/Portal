package com.example.intercation.controller;

import com.example.intercation.service.S3Service;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class S3FileUploadController {

    private final S3Service s3Service;

    @GetMapping("/files/upload")
    @Operation(summary = "채팅이 이미지나 파일일시..s3 업로드 url 주기 ")
    public ResponseEntity<String> generateUrl(@RequestParam String filename) {
        String presignedUrl = s3Service.generatePresignedUrl(filename);
        return ResponseEntity.ok(presignedUrl);

    }

}
