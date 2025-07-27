package com.example.workspaceservice.service;

import com.example.workspaceservice.client.AuthClient;
import com.example.workspaceservice.dto.response.InvitationDetailsResponse;
import com.example.workspaceservice.dto.response.UserProfileResponse;
import com.example.workspaceservice.dto.response.WorkspaceJoinResponse;
import com.example.workspaceservice.entity.InviteStatus;
import com.example.workspaceservice.entity.Workspace;
import com.example.workspaceservice.entity.WorkspaceInvitation;
import com.example.workspaceservice.entity.WorkspaceMember;
import com.example.workspaceservice.repository.WorkspaceInvitationRepository;
import com.example.workspaceservice.repository.WorkspaceMemberRepository;
import com.example.workspaceservice.repository.WorkspaceRepository;
import com.example.workspaceservice.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.AssertionsForClassTypes.assertThatThrownBy;
import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class) // JUnit5에서 Mockito를 사용하기 위한 확장
class InvitationServiceTest {

    @InjectMocks // 테스트 대상 클래스. @Mock으로 생성된 객체들이 여기에 주입됩니다.
    private InvitationService invitationService;

    // 테스트 대상 클래스가 의존하는 것들을 @Mock으로 선언 (가짜 객체)
    @Mock
    private JwtUtil jwtUtil;
    @Mock private AuthClient authClient;
    @Mock private WorkspaceRepository workspaceRepository;
    @Mock private WorkspaceInvitationRepository invitationRepository;
    @Mock private WorkspaceMemberRepository memberRepository;

    private Workspace workspace;
    private JwtUtil.InvitationPayload payload;
    private UserProfileResponse userProfile;
    private WorkspaceInvitation invitation;

    @BeforeEach
        // 각 테스트가 실행되기 전에 공통적으로 필요한 설정을 합니다.
    void setUp() {
        // ReflectionTestUtils를 사용해 @Value로 주입되는 필드에 테스트용 값을 설정
        ReflectionTestUtils.setField(invitationService, "defaultProfileImageUrl", "https://bucket1msa.s3.ap-northeast-2.amazonaws.com/default_img.png");

        // 공통으로 사용될 테스트 데이터 초기화
        workspace = Workspace.builder().id(1L).name("Test Workspace").urlSlug("test-slug").build();
        payload = new JwtUtil.InvitationPayload(1L, "test@example.com");
        userProfile = new UserProfileResponse(100L, "test@example.com", "TestUser");
        invitation = WorkspaceInvitation.builder().inviteStatus(InviteStatus.PENDING).build();
    }

    @Nested
    @DisplayName("초대 정보 조회 (getInvitationDetails)")
    class GetInvitationDetails {
        @Test
        @DisplayName("성공")
        void getInvitationDetails_success() {
            // given (준비)
            when(jwtUtil.parseInvitationToken(anyString())).thenReturn(payload);
            when(invitationRepository.findByWorkspaceIdAndInviteeEmail(anyLong(), anyString())).thenReturn(Optional.of(invitation));
            when(workspaceRepository.findById(anyLong())).thenReturn(Optional.of(workspace));

            // when (실행)
            InvitationDetailsResponse response = invitationService.getInvitationDetails("dummy-token");

            // then (검증)
            assertThat(response.workspaceName()).isEqualTo("Test Workspace");
            assertThat(response.inviteeEmail()).isEqualTo("test@example.com");
        }

        @Test
        @DisplayName("실패 - 유효하지 않은 초대")
        void getInvitationDetails_fail_invalidInvitation() {
            // given
            when(jwtUtil.parseInvitationToken(anyString())).thenReturn(payload);
            when(invitationRepository.findByWorkspaceIdAndInviteeEmail(anyLong(), anyString())).thenReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> invitationService.getInvitationDetails("dummy-token"))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("유효하지 않거나 만료된 초대입니다.");
        }
    }

    @Nested
    @DisplayName("초대 수락 (acceptInvitation)")
    class AcceptInvitation {

        @Test
        @DisplayName("성공 - 신규 멤버로 참여")
        void acceptInvitation_success_newMember() {
            // given
            // 사용자 프로필 이미지가 있는 경우를 테스트
            when(jwtUtil.parseInvitationToken(anyString())).thenReturn(payload);
            when(authClient.getUserProfileById(anyLong())).thenReturn(userProfile);
            when(invitationRepository.findByWorkspaceIdAndInviteeEmail(anyLong(), anyString())).thenReturn(Optional.of(invitation));
            when(workspaceRepository.findById(anyLong())).thenReturn(Optional.of(workspace));
            when(memberRepository.existsByWorkspaceIdAndUserId(anyLong(), anyLong())).thenReturn(false); // 아직 멤버가 아님

            // when
            WorkspaceJoinResponse response = invitationService.acceptInvitation("dummy-token", 100L);

            // then
            // 1. memberRepository.save가 정확히 1번 호출되었는지 검증
            ArgumentCaptor<WorkspaceMember> memberCaptor = ArgumentCaptor.forClass(WorkspaceMember.class);
            verify(memberRepository, times(1)).save(memberCaptor.capture());

            // 2. 저장된 WorkspaceMember 객체의 정보가 올바른지 검증
            WorkspaceMember savedMember = memberCaptor.getValue();
            assertThat(savedMember.getUserId()).isEqualTo(100L);
            assertThat(savedMember.getWorkspace()).isEqualTo(workspace);
            assertThat(savedMember.getNickname()).isEqualTo("TestUser");
            assertThat(savedMember.getProfileImgUrl()).isEqualTo("https://bucket1msa.s3.ap-northeast-2.amazonaws.com/default_img.png"); // 사용자의 기존 프로필 사용

            // 3. invitation.accept() 메소드가 호출되었는지 검증
            assertThat(invitation.getInviteStatus()).isEqualTo(InviteStatus.ACCEPTED);

            // 4. 응답 DTO의 정보가 올바른지 검증
            assertThat(response.urlSlug()).isEqualTo("test-slug");
            assertThat(response.message()).isEqualTo("워크스페이스 참여가 완료되었습니다.");
        }

        @Test
        @DisplayName("성공 - 사용자 프로필 이미지가 없을 경우 기본 이미지 사용")
        void acceptInvitation_success_useDefaultProfileImage() {
            // given
            // 사용자 프로필 이미지가 null인 경우를 테스트
            UserProfileResponse userWithNoImage = new UserProfileResponse(100L, "test@example.com", "TestUser");
            when(jwtUtil.parseInvitationToken(anyString())).thenReturn(payload);
            when(authClient.getUserProfileById(anyLong())).thenReturn(userWithNoImage);
            when(invitationRepository.findByWorkspaceIdAndInviteeEmail(anyLong(), anyString())).thenReturn(Optional.of(invitation));
            when(workspaceRepository.findById(anyLong())).thenReturn(Optional.of(workspace));
            when(memberRepository.existsByWorkspaceIdAndUserId(anyLong(), anyLong())).thenReturn(false);

            // when
            invitationService.acceptInvitation("dummy-token", 100L);

            // then
            ArgumentCaptor<WorkspaceMember> memberCaptor = ArgumentCaptor.forClass(WorkspaceMember.class);
            verify(memberRepository).save(memberCaptor.capture());
            WorkspaceMember savedMember = memberCaptor.getValue();
            // 기본 프로필 이미지가 사용되었는지 검증
            assertThat(savedMember.getProfileImgUrl()).isEqualTo("https://bucket1msa.s3.ap-northeast-2.amazonaws.com/default_img.png");
        }

        @Test
        @DisplayName("성공 - 이미 참여중인 멤버")
        void acceptInvitation_success_alreadyJoined() {
            // given
            when(jwtUtil.parseInvitationToken(anyString())).thenReturn(payload);
            when(authClient.getUserProfileById(anyLong())).thenReturn(userProfile);
            when(invitationRepository.findByWorkspaceIdAndInviteeEmail(anyLong(), anyString())).thenReturn(Optional.of(invitation));
            when(workspaceRepository.findById(anyLong())).thenReturn(Optional.of(workspace));
            when(memberRepository.existsByWorkspaceIdAndUserId(anyLong(), anyLong())).thenReturn(true); // 이미 멤버임

            // when
            WorkspaceJoinResponse response = invitationService.acceptInvitation("dummy-token", 100L);

            // then
            // memberRepository.save가 호출되지 않았는지 검증
            verify(memberRepository, never()).save(any(WorkspaceMember.class));
            assertThat(response.message()).isEqualTo("이미 참여중인 워크스페이스입니다.");
        }

        @Test
        @DisplayName("실패 - 초대받은 이메일과 로그인한 사용자 이메일 불일치")
        void acceptInvitation_fail_emailMismatch() {
            // given
            UserProfileResponse anotherUser = new UserProfileResponse(101L, "another@email.com", "AnotherUser");
            when(jwtUtil.parseInvitationToken(anyString())).thenReturn(payload);
            when(authClient.getUserProfileById(anyLong())).thenReturn(anotherUser);

            // when & then
            assertThatThrownBy(() -> invitationService.acceptInvitation("dummy-token", 101L))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessage("초대받은 사용자만 수락할 수 있습니다.");
        }
    }
}