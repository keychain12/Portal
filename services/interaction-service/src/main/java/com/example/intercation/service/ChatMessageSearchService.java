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

    private final ElasticsearchClient elasticsearchClient;

    public List<ChatMessageDocument> searchByContent(String content, Long workspaceId) {
        String id = String.valueOf(workspaceId);
        try {
            Query query = Query.of(q -> q
                    .bool(b -> b
                            .must(m -> m.match(t -> t
                                    .field("content")
                                    .query(content)))
                            .filter(f -> f.term(t -> t
                                    .field("workspaceId")
                                    .value(id)))
                    )
            );

            SearchResponse<ChatMessageDocument> response = elasticsearchClient.search(s -> s
                            .index("chat_messages")
                            .query(query)
                            .size(100),
                    ChatMessageDocument.class);

            return response.hits().hits().stream()
                    .map(Hit::source)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            throw new RuntimeException("Search failed: " + e.getMessage());
        }
    }
}