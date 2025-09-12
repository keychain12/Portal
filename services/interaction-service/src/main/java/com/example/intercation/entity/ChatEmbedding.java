package com.example.intercation.entity;

import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.time.LocalDateTime;
import java.util.List;

@Document(indexName = "chat_embeddings")  // rag 용 도큐먼트
@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatEmbedding {
    @Id
    private String id;  // UUID 랜덤

    @Field(type = FieldType.Keyword)
    private String originalMessageId;  // 원본 메시지 참조용

    @Field(type = FieldType.Keyword)
    private String channelId;  // 채널별 필터링용

    @Field(type = FieldType.Keyword)
    private String workspaceId;  // 워크스페이스 격리용

    @Field(type = FieldType.Text, index = false)  // 검색 안함, 저장만
    private String content;  // 원본 내용 (컨텍스트용)

    @Field(type = FieldType.Dense_Vector, dims = 1536)
    private List<Float> contentVector;

    @Field(type = FieldType.Date)
    private String timestamp;  // 시간순 정렬용

    // 선택적 - 답변 생성시 도움될 메타데이터
    @Field(type = FieldType.Keyword)
    private String senderNickname;  // "누가 말했는지" 컨텍스트


}
