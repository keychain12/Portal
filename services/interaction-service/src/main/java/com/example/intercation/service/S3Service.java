package com.example.intercation.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetUrlRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedPutObjectRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner; // Presigner 주입

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    @Value("${spring.app.default-profile-image-url}")
    private String defaultProfileImageUrl;

    public String generatePresignedUrl(String originalFilename) {
        // 1. 파일 이름이 중복되지 않도록 고유한 파일 경로 생성
        String uniqueFilename = createUniqueFilename(originalFilename);

        // 2. 업로드 요청 객체 생성
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(uniqueFilename)
                .build();

        // 3. 서명 요청 객체 생성
        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(10)) // URL 유효 시간 10분
                .putObjectRequest(putObjectRequest)
                .build();

        // 4. Presigner를 사용하여 URL 서명
        PresignedPutObjectRequest presignedPutObjectRequest = s3Presigner.presignPutObject(presignRequest);

        // 5. 서명된 URL 반환
        return presignedPutObjectRequest.url().toString();
    }


    private String createUniqueFilename(String originalFilename) {
        String uuid = UUID.randomUUID().toString();
        return "chat-files/" + uuid + "_" + originalFilename;
    }


    public String upload(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return defaultProfileImageUrl;
        }
        String fileName = createUniqueFilename(file.getOriginalFilename());

        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(fileName)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            GetUrlRequest getUrlRequest = GetUrlRequest.builder()
                    .bucket(bucket)
                    .key(fileName)
                    .build();

            return s3Client.utilities().getUrl(getUrlRequest).toString();
        } catch (S3Exception e) {
            System.err.println("S3 업로드 에러: " + e.awsErrorDetails().errorMessage());
            throw new IOException("S3에 파일을 업로드하지 못했습니다.", e);
        }
    }
}