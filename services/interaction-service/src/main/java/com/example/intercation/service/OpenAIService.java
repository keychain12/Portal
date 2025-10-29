package com.example.intercation.service;

import com.theokanning.openai.completion.chat.ChatCompletionRequest;
import com.theokanning.openai.completion.chat.ChatMessage;
import com.theokanning.openai.embedding.Embedding;
import com.theokanning.openai.embedding.EmbeddingRequest;
import com.theokanning.openai.service.OpenAiService;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@Slf4j
public class OpenAIService {

    @Value("${openai.api.key}")
    private String apiKey;

    private OpenAiService openAiService; // 라이브러리 클래스\
    @PostConstruct
    public void init() {
        this.openAiService = new OpenAiService(apiKey, Duration.ofSeconds(60)); // 응답시간설정
    }

    // 임베딩 생성
    public List<Float> createEmbedding(String text) {
        EmbeddingRequest request = EmbeddingRequest.builder()
                .model("text-embedding-ada-002")
                .input(Collections.singletonList(text))
                .build();

        List<Embedding> embeddings = openAiService.createEmbeddings(request).getData();
        List<Double> embeddingList = embeddings.get(0).getEmbedding();

        // Double → Float 변환
        List<Float> vectorList = new ArrayList<>();
        for (Double d : embeddingList) {
            vectorList.add(d.floatValue());
        }

        return vectorList;
    }

    // 답변 생성
    public String generateAnswer(String prompt) {
        ChatCompletionRequest request = ChatCompletionRequest.builder()
                .model("gpt-4o-mini-2024-07-18")
                .messages(List.of(
                        new ChatMessage("system", "과거 대화를 참고해서 답변하는 어시스턴트입니다."),
                        new ChatMessage("user", prompt)
                ))
                .build();

        return openAiService.createChatCompletion(request)
                .getChoices().get(0).getMessage().getContent();
    }
}
