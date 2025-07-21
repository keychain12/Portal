package com.example.intercation.service;

import com.example.intercation.client.AuthClient;
import com.example.intercation.client.WorkspaceClient;
import com.example.intercation.dto.response.UserProfileResponse;
import com.example.intercation.dto.response.WorkspaceMemberResponse;
import com.example.intercation.entity.ChannelMember;
import com.example.intercation.dto.request.CreateChannelRequest;
import com.example.intercation.dto.response.ChannelDetailResponse;
import com.example.intercation.dto.response.ChannelSimpleResponse;
import com.example.intercation.entity.Channel;
import com.example.intercation.repository.ChannelMemberRepository;
import com.example.intercation.repository.ChannelRepository;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ChannelService {

    private final ChannelRepository channelRepository;

    private final AuthClient authClient;

    private final ChannelMemberRepository channelMemberRepository;

    private final WorkspaceClient workspaceClient;

    public Long createChannel(Long workspaceId,CreateChannelRequest request,Long creatorId) {


        if (channelRepository.existsByWorkspaceIdAndChannelName(workspaceId, request.getChannelName())) {
            // 이미 채널이 존재하면 예외(Exception) 발생
            throw new IllegalArgumentException("이미 사용 중인 채널 이름입니다.");
        }

        //채널 생성 저장
        Channel channel = Channel.from(workspaceId, creatorId, request.getChannelName());
        //채널멤버 연관관계 메서드
        channel.addMemberList(creatorId);
        //후 저장
        Channel newChannel = channelRepository.save(channel);

        return newChannel.getId();
    }

    @Transactional(readOnly = true)
    public List<ChannelSimpleResponse> findChannelsByUserAndWorkspace(Long workspaceId, Long userId) {

        List<Channel> channelList = channelMemberRepository.findChannelsByUserAndWorkspace(userId,workspaceId);

        return channelList.stream()
                .map(ChannelSimpleResponse::toResponse)
                .collect(Collectors.toList());
    }
    @Transactional(readOnly = true)
    public ChannelDetailResponse findChannelDetail(Long workspaceId, Long channelId, Long userId) {


        // 채널 있는지 확인
        Channel channel = channelRepository.findById(channelId)
                .orElseThrow(() -> new IllegalArgumentException("채널을 찾을수 없습니다.."));

        // 해당 채널의 모든 유저의 id 값
        List<Long> userIds = channelMemberRepository.findAllByChannel(channel)
                .stream()
                .map(ChannelMember::getUserId)
                .toList();

        // 워크스페이스 멤버( role,nickname,profileImgUrl) 가져옴
        List<WorkspaceMemberResponse> workspaceMembers = workspaceClient.getWorkspaceMembers(workspaceId, userIds);

        List<ChannelDetailResponse.MemberInfo> members = workspaceMembers.stream()
                .map(member -> ChannelDetailResponse.MemberInfo.builder()
                        .userId(member.getUserId())
                        .nickName(member.getNickname())
                        .profileImgUrl(member.getProfileImgUrl())
                        .build()).toList();


        return ChannelDetailResponse.builder()
                .channelName(channel.getChannelName())
                .topic(channel.getTopic())
                .description(channel.getDescription())
                .createdAt(channel.getCreatedAt())
                .members(members)
                .build();
    }
}
