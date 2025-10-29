package com.example.intercation.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import com.example.intercation.entity.ChatEmbedding;
import com.example.intercation.entity.ChatMessageDocument;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ChatRAGService {
    private final ElasticsearchClient elasticsearchClient;
    private final OpenAIService openAIService;

    // 메시지 임베딩 생성 및 저장
    @Async
    public void createAndSaveEmbedding(ChatMessageDocument chatMessage) {
        try {

            // 1. 메시지 길이 체크 로그
            if (chatMessage.getContent().length() < 20) {
                log.info("메시지가 너무 짧아 임베딩을 스킵합니다: {}", chatMessage.getContent());
                return;
            }
            List<Float> vector = openAIService.createEmbedding(chatMessage.getContent());

            // 2. 벡터 생성 성공/실패 여부 체크 로그 (가장 중요!)
            if (vector == null || vector.isEmpty()) {
                log.error("OpenAI 서비스로부터 벡터를 생성하지 못했습니다. 원본 메시지: {}", chatMessage.getContent());
                return; // 벡터가 없으면 더 이상 진행하지 않음
            }
            log.info("임베딩 벡터 생성 성공. 벡터 크기: {}", vector.size());

            ChatEmbedding embedding = ChatEmbedding.builder()
                    .id(UUID.randomUUID().toString())
                    .originalMessageId(chatMessage.getId())
                    .workspaceId(chatMessage.getWorkspaceId())
                    .channelId(chatMessage.getChannelId())
                    .content(chatMessage.getContent())
                    .contentVector(vector)
                    .timestamp(chatMessage.getTimestamp())
                    .senderNickname(chatMessage.getSenderNickname())
                    .build();

            // 3. Elasticsearch 색인 시도/성공/실패 로그
            log.info("Elasticsearch에 색인 시도: {}", embedding.getId());

            elasticsearchClient.index(i -> i
                    .index("chat_embeddings")
                    .id(embedding.getId())
                    .document(embedding)
            );
            log.info("Elasticsearch 색인 성공: {}", embedding.getId());


        } catch (Exception e) {
            log.error("임베딩 생성 실패: ", e);
        }
    }

    // rag 검색 및 답변
    public String searchAndAnswer(String query, String workspaceId, String channelId) {
        try {
            // 유사한 메시지 검색
            List<Float> queryVector = openAIService.createEmbedding(query);

            SearchResponse<ChatEmbedding> response = elasticsearchClient.search(s -> s
                            .index("chat_embeddings")
                            .query(q -> q
                                    .bool(b -> b
                                            .filter(f -> f.term(t -> t.field("workspaceId").value(workspaceId)))
                                            .filter(f -> f.term(t -> t.field("channelId").value(channelId)))
                                    )
                            )
                            .knn(k -> k
                                    .field("contentVector")
                                    .queryVector(queryVector)
                                    .k(10)
                                    .numCandidates(100)
                            ),
                    ChatEmbedding.class
            );

            // 컨텍스트 구성
            List<String> contexts = response.hits().hits().stream()
                    .map(hit -> String.format("[%s]: %s",
                            hit.source().getSenderNickname(),
                            hit.source().getContent()))
                    .collect(Collectors.toList());
            System.out.println("contexts = " + contexts);
            if (contexts.isEmpty()) {
                return "관련된 과거 대화를 찾을 수 없습니다.";
            }

            // 답변 생성
            String prompt = String.format(
                    "과거 대화:\n%s\n\n위 대화를 참고해서 다음 질문에 답변해주세요: %s",
                    String.join("\n", contexts),
                    query
            );

            return openAIService.generateAnswer(prompt);

        } catch (Exception e) {
            log.error("RAG 검색 실패: ", e);
            return "답변 생성 중 오류가 발생했습니다.";
        }
    }
}
