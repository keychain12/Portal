package com.example.intercation.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Id;
import lombok.*;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(indexName = "chat_messages")
@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)  // ChatMessageDocument.class 이걸 저장하기떄문에 조회시 에러뜬다 이어노테이션으로 무시하라고해주지..
public class ChatMessageDocument {

    @Id
    private String id;

    @Field(type = FieldType.Keyword)
    private String workspaceId;

    @Field(type = FieldType.Keyword)
    private String channelId;

    @Field(type = FieldType.Keyword)
    private String userId;

    @Field(type = FieldType.Text)
    private String senderNickname;

    @Field(type = FieldType.Text)
    private String content;
/*
    @Field(type = FieldType.Date)
    private String timestamp; // LocalDateTime 이 역직렬화 안되서 String으로 임시방편..*/
}