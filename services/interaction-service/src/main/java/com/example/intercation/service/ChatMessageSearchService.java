package com.example.intercation.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.query_dsl.Query;
import co.elastic.clients.elasticsearch.core.SearchResponse;
import co.elastic.clients.elasticsearch.core.search.Hit;
import com.example.intercation.entity.ChatMessageDocument;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatMessageSearchService {

    private final ElasticsearchClient elasticsearchClient; // 엘라스틱서치 서버와 연결해서 요청하는 역할을한다
    public List<ChatMessageDocument> searchByContent(String content, Long workspaceId) {
        String id = String.valueOf(workspaceId);

        try {
            Query query = Query.of(q -> q
                    .bool(b -> b    // 여러조건 조합
                            .must(m -> m.match(t -> t // must는 반드시 만족해야하는거? 조건 / match는 유사내용도찾아줌
                                    .field("content")
                                    .query(content)))
                            .filter(f -> f.term(t -> t   // 필터조건 / term 은 정확히 일치하는것만 찾아줌
                                    .field("workspaceId")
                                    .value(id)))
                    )
            );

            SearchResponse<ChatMessageDocument> response = elasticsearchClient.search(s -> s
                            .index("chat_messages")  // document 만든거 (테이블)
                            .query(query)
                            .highlight(h -> h
                                    .fields("content", f -> f
                                            .preTags("<strong>")     // 강조 시작 태그
                                            .postTags("</strong>")    // 강조 종료 태그
                                            .fragmentSize(150)        // 하이라이트 조각 크기
                                            .numberOfFragments(3)     // 조각 개수
                                    )
                            )
                            .size(100),     // 결과 개수
                    ChatMessageDocument.class);

            return response.hits().hits().stream()
                    .map(Hit::source)
                    .collect(Collectors.toList()); //객체만 추출 해서 리스트로 반

        } catch (Exception e) {
            throw new RuntimeException("Search failed: " + e.getMessage());
        }
    }
}