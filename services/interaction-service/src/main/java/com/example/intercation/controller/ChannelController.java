package com.example.intercation.controller;


import com.example.intercation.dto.request.CreateChannelRequest;
import com.example.intercation.dto.request.UpdateChannelRequest;
import com.example.intercation.dto.response.ChannelDetailResponse;
import com.example.intercation.dto.response.ChannelSimpleResponse;
import com.example.intercation.service.ChannelService;
import com.example.intercation.util.LoginUserId;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.HandlerMapping;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class ChannelController {

    private final ChannelService channelService;

    @PostMapping("/workspace/{workspaceId}/channels")
    @Operation(summary = "채널생성", description = "채널생성 api")
    public ResponseEntity<?> createChannel(@PathVariable("workspaceId") Long workspaceId,
                                           @RequestBody @Valid CreateChannelRequest request,
                                           @LoginUserId Long creatorId) {

        Long channelId = channelService.createChannel(workspaceId, request, creatorId);

        return ResponseEntity.ok(channelId);
    }


    @GetMapping("/workspace/{workspaceId}/channels")
    @Operation(summary = "채널조회",description = "사이드바 채널조회")
    public ResponseEntity<?> getChannelsInWorkspace(@PathVariable("workspaceId") Long workspaceId,
                                                    @LoginUserId Long userId) {



        List<ChannelSimpleResponse> channelList = channelService.findChannelsByUserAndWorkspace(workspaceId, userId);

        return ResponseEntity.ok(channelList);
    }

    @GetMapping("/workspace/{workspaceId}/channels/{channelId}")
    @Operation(summary = "채널상세조회",description = "채널이름,주제,설명,생성날짜,채널멤버들")
    public ResponseEntity<?> getChannelsDetail(@PathVariable("workspaceId") Long workspaceId,
                                               @PathVariable("channelId") Long channelId,
                                               @LoginUserId Long userId) {

        ChannelDetailResponse channelDetailResponse = channelService.findChannelDetail(workspaceId, channelId, userId);

        return ResponseEntity.ok(channelDetailResponse);
    }

    @PatchMapping("/workspace/{workspaceId}/channels/{channelId}")
    @Operation(summary = "채널 정보 수정", description = "채널이름,주제,설명 수정")
    public void updateChannel(@PathVariable Long workspaceId,
                              @PathVariable Long channelId,
                              @RequestBody UpdateChannelRequest request,
                              @LoginUserId Long userId) {

        channelService.updateChannel(workspaceId, channelId, userId, request);

    }
}
