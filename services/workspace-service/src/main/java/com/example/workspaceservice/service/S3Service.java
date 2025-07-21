package com.example.workspaceservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetUrlRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
class S3Service {

    private final S3Client s3Client;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    public String upload(MultipartFile file) throws IOException {
        // 1. 파일 이름 중복 방지
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

        try {
            // 2. 업로드 요청 객체 생성
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(fileName)
                    .contentType(file.getContentType())
                    .build();

            // 3. 스트림을 사용하여 메모리 효율적으로 업로드 (file.getBytes() 대신)
            s3Client.putObject(putObjectRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            // 4. SDK를 통해 정확한 URL 가져오기 (직접 조합 X)
            GetUrlRequest getUrlRequest = GetUrlRequest.builder()
                    .bucket(bucket)
                    .key(fileName)
                    .build();

            return s3Client.utilities().getUrl(getUrlRequest).toString();

        } catch (S3Exception e) {
            // 5. 에러 처리 및 로그
            // 실제 운영 코드에서는 System.err 대신 로깅 프레임워크(slf4j 등) 사용 권장
            System.err.println("S3 업로드 에러: " + e.awsErrorDetails().errorMessage());
            // 예외를 다시 던지거나, 비즈니스 로직에 맞게 처리
            throw new IOException("S3에 파일을 업로드하지 못했습니다.", e);
        }
    }
}

