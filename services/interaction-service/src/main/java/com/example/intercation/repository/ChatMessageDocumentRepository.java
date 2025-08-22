package com.example.intercation.repository;

import com.example.intercation.entity.ChatMessageDocument;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatMessageDocumentRepository extends ElasticsearchRepository<ChatMessageDocument, String> {
}