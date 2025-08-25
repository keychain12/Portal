package com.example.intercation.service;

import com.example.intercation.client.WorkspaceClient;
import com.example.intercation.dto.request.ChatMessageRequest;
import com.example.intercation.dto.response.ChatMessageResponse;
import com.example.intercation.dto.response.WorkspaceMemberResponse;
import com.example.intercation.entity.Channel;
import com.example.intercation.entity.ChatMessage;
import com.example.intercation.entity.ChatMessageDocument;
import com.example.intercation.repository.ChannelRepository;
import com.example.intercation.repository.ChatMessageRepository;
import com.example.intercation.repository.ChatMessageDocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ChatService {
    private final ChannelRepository channelRepository;
    private final WorkspaceClient workspaceClient;
    private final ChatMessageRepository chatMessageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageDocumentRepository documentRepository;


    @Transactional
    public void sendMessage(Long channelId, Long userId, ChatMessageRequest request) {

        //채널찾기
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new IllegalArgumentException("채널을 찾지 못했습니다."));
        // 워크스페이스Id
        Long workspaceId = channel.getWorkspaceId();
        // 유저 닉네임, 프로필사진 가져오기
        WorkspaceMemberResponse memberProfile = getByWorkspaceIdAndUserId(userId, workspaceId);

        //메세지 객체생성
        ChatMessage chatMessage = ChatMessage.create(
                workspaceId,
                channel,
                userId,
                memberProfile.getNickname(),
                memberProfile.getProfileImgUrl(),
                request.content(),
                request.messageType()
        );

        //저장
        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);
        //Elasticsearch에 저장
        ChatMessageDocument document = convertToDocument(savedMessage);
        ChatMessageDocument save = documentRepository.save(document);
        System.out.println("save = " + save);
        //응답 DTO
        ChatMessageResponse response = ChatMessageResponse.toResponse(savedMessage);
        //보내기
        messagingTemplate.convertAndSend("/sub/channel/" + channelId, response);

    }

    private ChatMessageDocument convertToDocument(ChatMessage chatMessage) { // 엘라스틱서치 도큐먼트엔티티에 넣기
        //Todo 필요한거 채널이름, 워크스페이ㅡㅅ url
        ChatMessageDocument document = new ChatMessageDocument();
        document.setId(chatMessage.getId().toString());
        document.setWorkspaceId(chatMessage.getWorkspaceId().toString());
        document.setChannelId(chatMessage.getChannel().getId().toString());
        document.setUserId(chatMessage.getSenderId().toString());
        document.setContent(chatMessage.getContent());
        document.setSenderNickname(chatMessage.getSenderNickname());
        document.setTimestamp(chatMessage.getCreatedAt().toString());
        //채널이름
        String channelName = chatMessage.getChannel().getChannelName();
        document.setChannelName(channelName);
        //url 가져오기
        String urlSlug = workspaceClient.getUrlSlug(chatMessage.getWorkspaceId());
        document.setUrlSlug(urlSlug);
        return document;
    }

    // 워크스페이스id와 유저id로 워크스페이스멤버 정보 가져오기(닉네임,프로필사진,역할)
    private WorkspaceMemberResponse getByWorkspaceIdAndUserId(Long userId, Long workspaceId) {
        return workspaceClient.findByWorkspaceIdAndUserId(workspaceId, userId);
    }

    public List<ChatMessageResponse> findByChannelId(Long channelId) {
        // 채널의 채팅목록 가져오기
        List<ChatMessage> chatMessages = chatMessageRepository.findByChannelId(channelId);

        return chatMessages.stream()
                .map(ChatMessageResponse::toResponse)
                .collect(Collectors.toList());
    }
}
