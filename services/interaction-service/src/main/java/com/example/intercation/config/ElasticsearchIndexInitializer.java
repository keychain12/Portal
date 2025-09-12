package com.example.intercation.config;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@Slf4j
public class ElasticsearchIndexInitializer {

    @Autowired
    private ElasticsearchClient elasticsearchClient;

    @PostConstruct
    public void initializeIndex() {
        try {
            // 인덱스 존재 여부 확인
            boolean exists = elasticsearchClient.indices()
                    .exists(e -> e.index("chat_embeddings"))
                    .value();

            if (!exists) {
                // 인덱스 생성
                elasticsearchClient.indices().create(c -> c
                        .index("chat_embeddings")
                        .mappings(m -> m
                                .properties("id", p -> p.keyword(k -> k))
                                .properties("originalMessageId", p -> p.keyword(k -> k))
                                .properties("workspaceId", p -> p.keyword(k -> k))
                                .properties("channelId", p -> p.keyword(k -> k))
                                .properties("content", p -> p.text(t -> t.index(false)))
                                .properties("contentVector", p -> p
                                        .denseVector(d -> d
                                                .dims(1536)
                                                .index(true)
                                                .similarity("cosine")  // String으로 직접 입력
                                        )
                                )
                                .properties("timestamp", p -> p.date(d -> d))
                                .properties("senderNickname", p -> p.keyword(k -> k))
                        )
                );

                log.info("chat_embeddings 인덱스 생성 완료");
            } else {
                log.info("chat_embeddings 인덱스가 이미 존재합니다");
            }
        } catch (IOException e) {
            log.error("인덱스 생성 실패: ", e);
        }
    }
}