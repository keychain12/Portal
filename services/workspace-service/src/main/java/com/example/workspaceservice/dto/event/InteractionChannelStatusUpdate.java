package com.example.workspaceservice.dto.event;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class InteractionChannelStatusUpdate { // 카프카 채널 상태 업데이트 dto
    private Long workspaceId;
}
