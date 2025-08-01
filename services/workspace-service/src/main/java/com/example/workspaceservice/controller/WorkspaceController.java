package com.example.workspaceservice.controller;

import com.example.workspaceservice.dto.request.CreateWorkspaceRequest;
import com.example.workspaceservice.dto.response.WorkspaceDetailResponse;
import com.example.workspaceservice.dto.response.WorkspaceMemberResponse;
import com.example.workspaceservice.dto.response.WorkspaceResponse;
import com.example.workspaceservice.service.WorkspaceService;
import com.example.workspaceservice.util.JwtUtil;
import com.example.workspaceservice.util.LoginUserId;
import feign.Param;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping("/api")
@Tag(name = "workspace", description = "워크스페이스 관련 API")
public class WorkspaceController {

    private final WorkspaceService workspaceService;
    private final RedisTemplate<String, Long> redis;  // RedisTemplate<String, Long> 또는 RedisTemplate<String, Object>

    @Value("${spring.presence.threshold.online}")
    private long onlineThreshold;

    @Value("${spring.presence.threshold.idle}")
    private long idleThreshold;


    @PostMapping("/workspaces")
    @Operation(summary = "워크스페이스 생성 API", description = "워크스페이스 생성 및 url 리턴")
    public ResponseEntity<?> createWorkspace(@RequestPart("data") @Valid CreateWorkspaceRequest request,
                                             @RequestPart(value = "profileImage", required = false) MultipartFile profileImage,
                                             @LoginUserId Long userId) throws IOException {

        // 워크스페이스 생성
        WorkspaceResponse workspace = workspaceService.createWorkspace(request, userId, profileImage);

        return ResponseEntity.ok(Map.of("slug", workspace.getUrlSlug()));
    }

    @GetMapping("/workspaces")
    @Operation(summary = " 내 워크스페이스 목록 조회", description = "워크스페이스 조회")
    public ResponseEntity<?> getWorkspace(@LoginUserId Long userId,
                                          @PageableDefault(size = 10, sort = "id", direction = Sort.Direction.ASC) Pageable pageable) {

        Page<WorkspaceResponse> workspaces = workspaceService.getMyWorkspace(userId, pageable);

        return ResponseEntity.ok(workspaces);
    }

    @GetMapping("/workspaces/{slug}")
    @Operation(summary = " 홈 워크스페이스 조회", description = "slug url 로 워크스페이스 조회")
    @Parameter(name = "slugUrl", description = "슬러그 url ", required = true)
    public ResponseEntity<WorkspaceDetailResponse> getWorkspaceBySlug(@PathVariable String slug) {

        WorkspaceDetailResponse workspace = workspaceService.findByUrlSlug(slug);

        return ResponseEntity.ok(workspace);
    }


    private String presenceKey(Long wsId) {
        return "workspace:" + wsId + ":presence";
    }

    @PostMapping("/workspaces/{workspaceId}/presence/heartbeat")
    public ResponseEntity<Void> heartBeat(@PathVariable Long workspaceId, @LoginUserId Long userId) {
        String key = presenceKey(workspaceId);
        redis.opsForZSet().add(key, userId, System.currentTimeMillis());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/workspaces/{workspaceId}/presence")
    public ResponseEntity<?> listPresence(@PathVariable Long workspaceId) {
        String key = presenceKey(workspaceId);
        long now = System.currentTimeMillis();

        Set<Long> active = redis.opsForZSet()
                .rangeByScore(key, now - onlineThreshold, now);

        Set<Long> idle = redis.opsForZSet()
                .rangeByScore(key, now - idleThreshold, now);

        Map<Long, String> result = new HashMap<>();

        if (active != null) {
            active.forEach(id -> result.put(id, "ACTIVE"));
        }

        if (idle != null) {
            idle.forEach(id -> result.putIfAbsent(id, "IDLE"));
        }

        return ResponseEntity.ok(result);

    }

    @GetMapping("/workspace/{workspaceId}/members")
    @Operation(summary = "workspaceMember 조회" , description = "Role,NickName,프로필url 리턴")
    public ResponseEntity<?> getWorkspaceMembers(@PathVariable Long workspaceId,
                                                      @RequestParam List<Long> userId) {

        List<WorkspaceMemberResponse> membersInWorkspace = workspaceService.findMembersInWorkspace(workspaceId, userId);

        return ResponseEntity.ok(membersInWorkspace);
    }




   /* @PutMapping("/workspaces")
    public ResponseEntity<Long> modifyWorkspace(@RequestBody @Valid WorkspaceRequest request,
                                                @LoginUserId String userId) {


    }*/
}
