import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import theme from '../theme';
import Input from '../components/Input';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WorkspaceDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [workspaceMembers, setWorkspaceMembers] = useState([]);
  const [memberStatuses, setMemberStatuses] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [showLogoutMenu, setShowLogoutMenu] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [hoveredChannel, setHoveredChannel] = useState(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const stompClientRef = useRef(null);

  // 메모이제이션된 값들
  const channelCount = useMemo(() => channels.length, [channels.length]);
  const hasMessages = useMemo(() => messages.length > 0, [messages.length]);
  const canSendMessage = useMemo(() => 
    messageInput.trim() && selectedChannel && !isSending, 
    [messageInput, selectedChannel, isSending]
  );

  // 워크스페이스 멤버 상태 가져오기 함수
  const fetchMemberStatuses = useCallback(async (workspaceId) => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken || !workspaceId) return;

    try {
      const response = await fetch(`http://localhost:8083/api/workspaces/${workspaceId}/members/status`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const statusData = await response.json();
        
        // 상태 데이터를 객체로 변환 (userId를 키로 사용)
        const statusMap = {};
        statusData.forEach(memberStatus => {
          statusMap[memberStatus.userId] = memberStatus.status;
        });
        
        setMemberStatuses(statusMap);
      }
    } catch (error) {
      console.error('멤버 상태 불러오기 중 오류 발생:', error);
    }
  }, []);

  useEffect(() => {
    const fetchWorkspaceAndChannels = async () => {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        navigate('/login');
        return;
      }

      try {
        setIsLoading(true);
        // Fetch workspace details
        const workspaceResponse = await fetch(`http://localhost:8082/api/workspaces/${slug}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (workspaceResponse.ok) {
          const workspaceData = await workspaceResponse.json();
          setWorkspace(workspaceData);
          
          // 워크스페이스 멤버 저장
          if (workspaceData.members) {
            setWorkspaceMembers(workspaceData.members);
            
            // 현재 사용자 찾기 (JWT에서 userId 추출해서 매칭)
            const authToken = localStorage.getItem('authToken');
            if (authToken) {
              try {
                const payload = JSON.parse(atob(authToken.split('.')[1]));
                const currentUserId = payload.userId;
                const currentUserInfo = workspaceData.members.find(member => member.userId === currentUserId);
                if (currentUserInfo) {
                  setCurrentUser(currentUserInfo);
                }
              } catch (e) {
                console.error('JWT 파싱 오류:', e);
              }
            }
          }

          // 멤버 상태 가져오기
          await fetchMemberStatuses(workspaceData.id);

          // Fetch channels for the workspace
          const channelsResponse = await fetch(`http://localhost:8083/api/workspace/${workspaceData.id}/channels`, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'workspaceId': workspaceData.id,
            },
          });

          if (channelsResponse.ok) {
            const channelsData = await channelsResponse.json();
            // Map channelName to name for frontend consistency
            const mappedChannels = channelsData.map(channel => ({
              id: channel.id,
              name: channel.channelName, // Map channelName to name
            }));
            setChannels(mappedChannels);
            if (mappedChannels.length > 0) {
              setSelectedChannel(mappedChannels[0]); // Select the first channel by default
            }
          } else {
            const errorData = await channelsResponse.json();
            alert(`채널 불러오기 실패: ${errorData.message || channelsResponse.statusText}`);
          }

        } else if (workspaceResponse.status === 401) {
          alert('인증이 만료되었습니다. 다시 로그인해주세요.');
          navigate('/login');
        } else {
          const errorData = await workspaceResponse.json();
          alert(`워크스페이스 불러오기 실패: ${errorData.message || workspaceResponse.statusText}`);
        }
      } catch (error) {
        console.error('워크스페이스 또는 채널 불러오기 중 오류 발생:', error);
        alert('워크스페이스 또는 채널 불러오기 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspaceAndChannels();
  }, [slug, navigate, fetchMemberStatuses]);

  // 채널 상세 정보 가져오기 함수를 메모이제이션
  const fetchChannelDetails = useCallback(async (channelId) => {
    if (!workspace || !channelId) return;
    
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      navigate('/login');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8083/api/workspace/${workspace.id}/channels/${channelId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'workspaceId': workspace.id,
        },
      });
      
      if (response.ok) {
        const channelDetails = await response.json();
        // 현재 선택된 채널과 같은 ID일 때만 업데이트
        setSelectedChannel(prev => {
          if (prev && prev.id === channelId) {
            return { ...prev, ...channelDetails };
          }
          return prev;
        });
      } else {
        const errorData = await response.json();
        console.error(`채널 상세 정보 불러오기 실패: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('채널 상세 정보 불러오기 중 오류 발생:', error);
    }
  }, [workspace?.id, navigate]);

  // 채널이 처음 선택될 때만 상세 정보 가져오기
  useEffect(() => {
    if (selectedChannel && selectedChannel.id && !selectedChannel.description) {
      fetchChannelDetails(selectedChannel.id);
    }
  }, [selectedChannel?.id, fetchChannelDetails]);

  // 채널 선택 함수를 메모이제이션
  const handleChannelSelect = useCallback((channel) => {
    // 이미 선택된 채널이면 아무것도 하지 않음
    if (selectedChannel && selectedChannel.id === channel.id) return;
    
    setSelectedChannel(channel);
    // 메시지 초기화
    setMessages([]);
  }, [selectedChannel]);

  // 메시지 가져오기 함수를 메모이제이션
  const fetchMessages = useCallback(async (channelId) => {
    if (!channelId) return;
    
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      navigate('/login');
      return;
    }

    setIsLoadingMessages(true);
    
    try {
      const response = await fetch(`http://localhost:8083/api/channels/${channelId}/messages`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const messageHistory = await response.json();
        
        // ChatMessageResponse를 프론트엔드 형식으로 변환
        const formattedMessages = messageHistory.map(msg => ({
          id: msg.messageId,
          sender: msg.senderNickname,
          content: msg.content,
          timestamp: msg.createdAt,
          isMe: msg.senderId === getCurrentUserId(), // 현재 사용자 ID와 비교
          profileImgUrl: msg.senderProfileImgUrl,
          messageType: msg.messageType
        }));
        
        setMessages(formattedMessages);
      } else {
        console.error(`메시지 불러오기 실패: ${response.status} ${response.statusText}`);
        // 실패 시 빈 배열로 설정
        setMessages([]);
      }
    } catch (error) {
      console.error('메시지 불러오기 중 오류 발생:', error);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, [navigate]);

  // 현재 사용자 ID를 가져오는 헬퍼 함수
  const getCurrentUserId = useCallback(() => {
    // 워크스페이스 멤버에서 현재 사용자 찾기 (이메일 기준)
    const userEmail = localStorage.getItem('userEmail'); // 로그인 시 저장된 이메일
    if (userEmail && workspaceMembers.length > 0) {
      const currentMember = workspaceMembers.find(member => 
        member.email === userEmail // 만약 member에 email 필드가 있다면
      );
      if (currentMember) {
        return currentMember.userId;
      }
    }
    
    // 임시 방법: localStorage에서 직접 가져오기
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId) : null;
  }, [workspaceMembers]);

  // 현재 사용자인지 확인하는 헬퍼 함수
  const isCurrentUser = useCallback((member) => {
    const currentUserId = getCurrentUserId();
    return currentUserId && currentUserId === member.userId;
  }, [getCurrentUserId]);

  // 채널 메시지 구독
  const subscribeToChannel = useCallback((channelId) => {
    if (!stompClientRef.current?.connected) return;

    const subscription = stompClientRef.current.subscribe(
      `/sub/channel/${channelId}`,
      (message) => {
        const newMessage = JSON.parse(message.body);
        
        // 새 메시지를 프론트엔드 형식으로 변환
        const formattedMessage = {
          id: newMessage.messageId,
          sender: newMessage.senderNickname,
          content: newMessage.content,
          timestamp: newMessage.createdAt,
          isMe: newMessage.senderId === getCurrentUserId(),
          profileImgUrl: newMessage.senderProfileImgUrl,
          messageType: newMessage.messageType
        };

        // 메시지 목록에 추가
        setMessages(prev => [...prev, formattedMessage]);
      }
    );

    return subscription;
  }, [getCurrentUserId]);

  // 워크스페이스 상태 업데이트 구독
  const subscribeToStatusUpdates = useCallback((workspaceId) => {
    if (!stompClientRef.current?.connected) return;

    const subscription = stompClientRef.current.subscribe(
      `/sub/status/${workspaceId}`,
      (message) => {
        const statusUpdate = JSON.parse(message.body);
        
        // 멤버 상태 업데이트
        setMemberStatuses(prev => ({
          ...prev,
          [statusUpdate.userId]: statusUpdate.status
        }));
      }
    );

    return subscription;
  }, []);

  // WebSocket 연결 설정
  const connectWebSocket = useCallback(() => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken || !workspace?.id) {
      console.log('WebSocket 연결 실패: 토큰 또는 워크스페이스 ID 없음');
      return;
    }

    const client = new Client({
      webSocketFactory: () => {
        const socket = new SockJS('http://localhost:8083/ws-stomp', null, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        return socket;
      },
      connectHeaders: {
        Authorization: `Bearer ${authToken}`,
        workspaceId: workspace.id.toString(),
        'Content-Type': 'application/json'
      },
      onConnect: (frame) => {
        stompClientRef.current = client;
        
        // 채널별 메시지 구독 (채널이 선택되면 구독)
        if (selectedChannel?.id) {
          subscribeToChannel(selectedChannel.id);
        }

        // 워크스페이스 상태 업데이트 구독
        subscribeToStatusUpdates(workspace.id);
      },
      onStompError: (frame) => {
        console.error('STOMP Error:', frame.headers['message']);
        console.error('Error details:', frame.body);
      },
      onWebSocketError: (error) => {
        console.error('WebSocket Error:', error);
      }
    });

    client.activate();
    return client;
  }, [selectedChannel?.id, workspace?.id, subscribeToChannel, subscribeToStatusUpdates]);

  // 주기적으로 멤버 상태 새로고침 (5초마다)
  useEffect(() => {
    if (workspace?.id) {
      const interval = setInterval(() => {
        fetchMemberStatuses(workspace.id);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [workspace?.id, fetchMemberStatuses]);

  // WebSocket 연결 및 정리 - 워크스페이스 로딩 완료 후
  useEffect(() => {
    if (workspace?.id && !isLoading) {
      const client = connectWebSocket();
      
      return () => {
        if (client?.connected) {
          client.deactivate();
        }
      };
    }
  }, [workspace?.id, isLoading, connectWebSocket]);

  // 메시지를 날짜별로 그룹화하고 연속 메시지 처리
  const groupedMessages = useMemo(() => {
    if (!hasMessages) return [];
    
    const groups = [];
    let currentDate = null;
    let currentGroup = null;
    
    messages.forEach((message, index) => {
      const messageDate = new Date(message.timestamp);
      const dateKey = messageDate.toDateString();
      
      // 날짜가 바뀌면 날짜 구분선 추가
      if (currentDate !== dateKey) {
        if (currentGroup) {
          groups.push(currentGroup);
        }
        
        // 날짜 구분선
        groups.push({
          type: 'date-divider',
          date: messageDate,
          id: `date-${dateKey}`
        });
        
        currentDate = dateKey;
        currentGroup = null;
      }
      
      const prevMessage = messages[index - 1];
      const shouldGroup = prevMessage && 
                         prevMessage.sender === message.sender && 
                         new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() < 300000; // 5분 이내
      
      if (!shouldGroup || !currentGroup || currentGroup.sender !== message.sender) {
        // 새로운 메시지 그룹 시작
        if (currentGroup) {
          groups.push(currentGroup);
        }
        
        currentGroup = {
          type: 'message-group',
          sender: message.sender,
          isMe: message.isMe,
          timestamp: new Date(message.timestamp),
          messages: [message],
          id: `group-${message.id}`
        };
      } else {
        // 기존 그룹에 메시지 추가
        currentGroup.messages.push(message);
      }
    });
    
    if (currentGroup) {
      groups.push(currentGroup);
    }
    
    return groups;
  }, [messages, hasMessages]);

  // 선택된 채널이 변경될 때 메시지 가져오기 및 WebSocket 구독
  useEffect(() => {
    if (selectedChannel?.id) {
      fetchMessages(selectedChannel.id);
      
      // WebSocket이 연결되어 있으면 새 채널 구독
      if (stompClientRef.current?.connected) {
        subscribeToChannel(selectedChannel.id);
      }
    }
  }, [selectedChannel?.id, fetchMessages, subscribeToChannel]);

  // Scroll to the bottom whenever messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages]);

  // 메시지 전송 함수를 메모이제이션
  const handleSendMessage = useCallback(async () => {
    if (!canSendMessage) return;
    
    // WebSocket 연결 상태 확인
    if (!stompClientRef.current?.connected) {
      alert('채팅 연결이 끊어졌습니다. 페이지를 새로고침해주세요.');
      return;
    }
    
    setIsSending(true);
    const messageContent = messageInput.trim();
    setMessageInput(''); // 즉시 입력창 클리어
    
    try {
      // WebSocket을 통해 메시지 전송 (백엔드 ChatMessageRequest 형식에 맞춤)
      const messageRequest = {
        content: messageContent,
        messageType: 'TEXT', // MessageType enum 값
        channelId: selectedChannel.id // 명시적으로 channelId 추가
      };

      stompClientRef.current.publish({
        destination: `/pub/chat/${selectedChannel.id}`,
        body: JSON.stringify(messageRequest),
        headers: {
          'workspaceId': workspace.id.toString(),
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

    } catch (error) {
      console.error('메시지 전송 실패:', error);
      // 실패 시 입력창에 메시지 복원
      setMessageInput(messageContent);
      alert('메시지 전송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSending(false);
    }
  }, [canSendMessage, messageInput, selectedChannel?.id]);

  // 로그아웃 핸들러
  const handleLogout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    navigate('/login');
  }, [navigate]);

  // 채널 생성 함수
  const handleCreateChannel = useCallback(async () => {
    if (!newChannelName.trim() || !workspace?.id) return;

    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8083/api/workspace/${workspace.id}/channels`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channelName: newChannelName.trim(),
          channelType: 'PUBLIC' // 기본값으로 PUBLIC 설정
        }),
      });

      if (response.ok) {
        const newChannelId = await response.json();
        
        // 채널 목록 새로고침
        const channelsResponse = await fetch(`http://localhost:8083/api/workspace/${workspace.id}/channels`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'workspaceId': workspace.id,
          },
        });

        if (channelsResponse.ok) {
          const channelsData = await channelsResponse.json();
          const mappedChannels = channelsData.map(channel => ({
            id: channel.id,
            name: channel.channelName,
          }));
          setChannels(mappedChannels);
        }

        setNewChannelName('');
        setShowCreateChannel(false);
        alert('채널이 성공적으로 생성되었습니다!');
      } else {
        const errorData = await response.json();
        alert(`채널 생성 실패: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('채널 생성 중 오류 발생:', error);
      alert('채널 생성 중 오류가 발생했습니다.');
    }
  }, [newChannelName, workspace?.id, navigate]);

  // 로그아웃 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = () => {
      setShowLogoutMenu(false);
    };

    if (showLogoutMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showLogoutMenu]);

  if (!workspace || isLoading) {
    return (
      <div style={{
        backgroundColor: theme.colors.background.primary,
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: theme.typography.fontFamily.sans
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: theme.spacing[6]
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: `4px solid ${theme.colors.surface.border}`,
            borderTop: `4px solid ${theme.colors.primary.brand}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{
            color: theme.colors.text.secondary,
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.medium
          }}>
            워크스페이스를 불러오는 중...
          </p>
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            @media (max-width: 768px) {
              .sidebar {
                width: 280px !important;
                position: fixed !important;
                left: -280px !important;
                transition: left 0.3s ease !important;
                z-index: 1000 !important;
              }
              
              .sidebar.open {
                left: 0 !important;
              }
              
              .main-content {
                margin-left: 0 !important;
              }
              
              .channel-header {
                padding: 1rem !important;
              }
              
              .message-input {
                padding: 1rem !important;
              }
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: theme.colors.background.primary,
      height: '100vh',
      display: 'flex',
      fontFamily: theme.typography.fontFamily.sans,
      color: theme.colors.text.primary,
      overflow: 'hidden'
    }}>
      {/* Left Navigation Bar */}
      <div style={{
        width: '68px',
        backgroundColor: theme.colors.background.secondary,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '12px 0',
        borderRight: `1px solid ${theme.colors.surface.border}`,
        flexShrink: 0
      }}>
        {/* Home Button */}
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: theme.borderRadius.lg,
          backgroundColor: theme.colors.primary.brand,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '8px',
          cursor: 'pointer',
          position: 'relative',
          transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.ease}`
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            backgroundColor: theme.colors.text.primary,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: theme.typography.fontWeight.bold
          }}>
            🏠
          </div>
        </div>

        {/* Navigation Items */}
        {[
          { icon: '💬', label: 'DMs' },
          { icon: '🔔', label: '내활동' },
          { icon: '📁', label: '파일' },
          { icon: '⋯', label: '더보기' }
        ].map((item, index) => (
          <div
            key={index}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: theme.borderRadius.lg,
              backgroundColor: theme.colors.surface.default,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '8px',
              cursor: 'pointer',
              transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.ease}`,
              fontSize: '18px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.surface.hover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.surface.default;
            }}
          >
            {item.icon}
          </div>
        ))}

        {/* Spacer */}
        <div style={{ flex: 1 }}></div>

        {/* Add Button */}
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: theme.borderRadius.lg,
          backgroundColor: theme.colors.surface.default,
          border: `2px dashed ${theme.colors.surface.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '12px',
          cursor: 'pointer',
          transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.ease}`,
          fontSize: '20px',
          color: theme.colors.text.tertiary
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = theme.colors.primary.brand;
          e.currentTarget.style.backgroundColor = theme.colors.surface.hover;
          e.currentTarget.style.color = theme.colors.primary.brand;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = theme.colors.surface.border;
          e.currentTarget.style.backgroundColor = theme.colors.surface.default;
          e.currentTarget.style.color = theme.colors.text.tertiary;
        }}
        >
          +
        </div>

        {/* User Profile */}
        <div style={{
          position: 'relative'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            overflow: 'hidden',
            cursor: 'pointer',
            position: 'relative',
            border: `2px solid ${theme.colors.surface.border}`,
            transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.ease}`
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = theme.colors.primary.brand;
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = theme.colors.surface.border;
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowLogoutMenu(!showLogoutMenu);
          }}
          onClick={() => setShowLogoutMenu(false)}
          >
            <img
              src={currentUser?.profileUrl || "/images/placeholder.png"}
              alt="User Profile"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: theme.colors.status.success,
              border: `2px solid ${theme.colors.background.secondary}`
            }}></div>
          </div>

          {/* 로그아웃 메뉴 */}
          {showLogoutMenu && (
            <div style={{
              position: 'absolute',
              bottom: '50px',
              right: '0px',
              backgroundColor: theme.colors.background.secondary,
              borderRadius: theme.borderRadius.md,
              boxShadow: theme.shadows.lg,
              border: `1px solid ${theme.colors.surface.border}`,
              minWidth: '120px',
              zIndex: 1000
            }}>
              <div style={{
                padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                borderBottom: `1px solid ${theme.colors.surface.border}`,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium,
                color: theme.colors.text.secondary
              }}>
                {currentUser?.nickname || '사용자'}
              </div>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: theme.borderRadius.md,
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.status.error,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: `background-color ${theme.animation.duration.fast} ${theme.animation.easing.ease}`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.status.errorBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Workspace Sidebar */}
      <div style={{
        width: '280px',
        backgroundColor: theme.colors.background.tertiary,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        flexShrink: 0,
        borderRight: `1px solid ${theme.colors.surface.border}`
      }}>
        {/* Workspace Header */}
        <div style={{
          padding: `${theme.spacing[5]} ${theme.spacing[4]}`,
          borderBottom: `1px solid ${theme.colors.surface.border}`,
          background: theme.colors.gradient.surface,
          position: 'relative',
          cursor: 'pointer',
          transition: `all ${theme.animation.duration.normal} ${theme.animation.easing.easeOut}`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing[3],
            marginBottom: theme.spacing[2]
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: theme.borderRadius.lg,
              background: theme.colors.gradient.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
              boxShadow: theme.shadows.glow
            }}>
              {workspace.name.charAt(0).toUpperCase()}
            </div>
            
            <div style={{ flex: 1 }}>
              <h1 style={{
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text.primary,
                margin: 0,
                lineHeight: 1.2,
                letterSpacing: theme.typography.letterSpacing.tight
              }}>
                {workspace.name}
              </h1>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing[2],
                marginTop: theme.spacing[1]
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: theme.colors.status.success
                }}></div>
                <span style={{
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.text.secondary,
                  fontWeight: theme.typography.fontWeight.medium
                }}>
                  활성
                </span>
              </div>
            </div>
            
            <div style={{
              padding: theme.spacing[2],
              borderRadius: theme.borderRadius.md,
              cursor: 'pointer',
              transition: `background-color ${theme.animation.duration.fast} ${theme.animation.easing.ease}`,
              color: theme.colors.text.secondary,
              fontSize: theme.typography.fontSize.lg
            }}>
              ⌄
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: theme.spacing[2],
            marginTop: theme.spacing[2]
          }}>
            <div style={{
              padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
              borderRadius: theme.borderRadius.sm,
              backgroundColor: theme.colors.status.successBg,
              border: `1px solid rgba(75, 192, 121, 0.3)`,
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.status.success,
              fontWeight: theme.typography.fontWeight.medium
            }}>
              온라인
            </div>
            <div style={{
              padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
              borderRadius: theme.borderRadius.sm,
              backgroundColor: theme.colors.primary.brand + '15',
              border: `1px solid ${theme.colors.primary.brand}30`,
              fontSize: theme.typography.fontSize.xs,
              color: theme.colors.primary.brand,
              fontWeight: theme.typography.fontWeight.medium
            }}>
              {channelCount} 채널
            </div>
          </div>
        </div>

        {/* Channels Navigation */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
          scrollbarWidth: 'thin'
        }}>
          {/* Channels Section */}
          <div style={{ marginBottom: theme.spacing[6] }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: theme.spacing[3],
              padding: `0 ${theme.spacing[1]}`
            }}>
              <button style={{
                background: 'none',
                border: 'none',
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.semibold,
                cursor: 'pointer',
                padding: `${theme.spacing[1]} 0`,
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing[2],
                letterSpacing: theme.typography.letterSpacing.wide
              }}>
                <span style={{ fontSize: theme.typography.fontSize.xs }}>▼</span>
                CHANNELS
              </button>
              <button 
                onClick={() => setShowCreateChannel(!showCreateChannel)}
                style={{
                background: 'none',
                border: 'none',
                color: theme.colors.text.tertiary,
                fontSize: theme.typography.fontSize.lg,
                cursor: 'pointer',
                padding: theme.spacing[1],
                borderRadius: theme.borderRadius.sm,
                transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.ease}`,
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.surface.hover;
                e.currentTarget.style.color = theme.colors.primary.brand;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = theme.colors.text.tertiary;
              }}
              >
                +
              </button>
            </div>
            
            {/* 채널 생성 입력창 */}
            {showCreateChannel && (
              <div style={{
                marginBottom: theme.spacing[3],
                padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                backgroundColor: theme.colors.surface.default,
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.surface.border}`
              }}>
                <input
                  type="text"
                  placeholder="채널 이름을 입력하세요"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateChannel();
                    } else if (e.key === 'Escape') {
                      setShowCreateChannel(false);
                      setNewChannelName('');
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                    border: 'none',
                    borderRadius: theme.borderRadius.sm,
                    backgroundColor: theme.colors.background.primary,
                    color: theme.colors.text.primary,
                    fontSize: theme.typography.fontSize.sm,
                    outline: 'none',
                    marginBottom: theme.spacing[2]
                  }}
                  autoFocus
                />
                <div style={{
                  display: 'flex',
                  gap: theme.spacing[2],
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={() => {
                      setShowCreateChannel(false);
                      setNewChannelName('');
                    }}
                    style={{
                      padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
                      border: `1px solid ${theme.colors.surface.border}`,
                      borderRadius: theme.borderRadius.sm,
                      backgroundColor: 'transparent',
                      color: theme.colors.text.secondary,
                      fontSize: theme.typography.fontSize.xs,
                      cursor: 'pointer'
                    }}
                  >
                    취소
                  </button>
                  <button
                    onClick={handleCreateChannel}
                    disabled={!newChannelName.trim()}
                    style={{
                      padding: `${theme.spacing[1]} ${theme.spacing[3]}`,
                      border: 'none',
                      borderRadius: theme.borderRadius.sm,
                      backgroundColor: theme.colors.primary.brand,
                      color: theme.colors.text.primary,
                      fontSize: theme.typography.fontSize.xs,
                      cursor: newChannelName.trim() ? 'pointer' : 'not-allowed',
                      opacity: newChannelName.trim() ? 1 : 0.5
                    }}
                  >
                    생성
                  </button>
                </div>
              </div>
            )}
            
            <div>
              {channelCount > 0 ? (
                channels.map((channel) => (
                  <div
                    key={channel.id}
                    style={{
                      padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                      borderRadius: theme.borderRadius.md,
                      cursor: 'pointer',
                      backgroundColor: selectedChannel && selectedChannel.id === channel.id 
                        ? `${theme.colors.primary.brand}20` 
                        : hoveredChannel === channel.id 
                          ? theme.colors.surface.hover
                          : 'transparent',
                      border: selectedChannel && selectedChannel.id === channel.id 
                        ? `1px solid ${theme.colors.primary.brand}` 
                        : '1px solid transparent',
                      color: selectedChannel && selectedChannel.id === channel.id 
                        ? theme.colors.primary.brand 
                        : theme.colors.text.secondary,
                      transition: `all ${theme.animation.duration.normal} ${theme.animation.easing.easeOut}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.spacing[2],
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.medium,
                      marginBottom: theme.spacing[1],
                      position: 'relative'
                    }}
                    onClick={() => handleChannelSelect(channel)}
                    onMouseEnter={() => setHoveredChannel(channel.id)}
                    onMouseLeave={() => setHoveredChannel(null)}
                  >
                    {selectedChannel && selectedChannel.id === channel.id && (
                      <div style={{
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '3px',
                        height: '20px',
                        backgroundColor: theme.colors.primary.brand,
                        borderRadius: '0 2px 2px 0'
                      }}></div>
                    )}
                    
                    <span style={{
                      fontSize: theme.typography.fontSize.base,
                      fontWeight: theme.typography.fontWeight.semibold,
                      opacity: selectedChannel && selectedChannel.id === channel.id ? 1 : 0.7
                    }}>
                      #
                    </span>
                    <span style={{ 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1
                    }}>
                      {channel.name}
                    </span>
                    
                    {hoveredChannel === channel.id && (
                      <div style={{
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.colors.text.muted,
                        opacity: 0,
                        animation: `fadeIn ${theme.animation.duration.fast} ${theme.animation.easing.ease} forwards`
                      }}>
                        ⚡
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{
                  padding: `${theme.spacing[6]} ${theme.spacing[2]}`,
                  color: theme.colors.text.muted,
                  fontSize: theme.typography.fontSize.sm,
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: theme.typography.fontSize.xl,
                    marginBottom: theme.spacing[2],
                    opacity: 0.5
                  }}>
                    📢
                  </div>
                  채널이 없습니다
                </div>
              )}
            </div>
          </div>

          {/* Direct Messages Section */}
          <div style={{ marginBottom: theme.spacing[4] }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: theme.spacing[3],
              padding: `0 ${theme.spacing[1]}`
            }}>
              <button style={{
                background: 'none',
                border: 'none',
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.semibold,
                cursor: 'pointer',
                padding: `${theme.spacing[1]} 0`,
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing[2],
                letterSpacing: theme.typography.letterSpacing.wide
              }}>
                <span style={{ fontSize: theme.typography.fontSize.xs }}>▼</span>
                DIRECT MESSAGES
              </button>
              <button style={{
                background: 'none',
                border: 'none',
                color: theme.colors.text.tertiary,
                fontSize: theme.typography.fontSize.lg,
                cursor: 'pointer',
                padding: theme.spacing[1],
                borderRadius: theme.borderRadius.sm,
                transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.ease}`,
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.surface.hover;
                e.currentTarget.style.color = theme.colors.primary.brand;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = theme.colors.text.tertiary;
              }}
              >
                +
              </button>
            </div>
            
            {/* 워크스페이스 멤버 목록 */}
            <div>
              {workspaceMembers.length > 0 ? (
                workspaceMembers.map((member) => (
                  <div
                    key={member.userId}
                    style={{
                      padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                      borderRadius: theme.borderRadius.md,
                      cursor: 'pointer',
                      backgroundColor: 'transparent',
                      color: theme.colors.text.secondary,
                      transition: `all ${theme.animation.duration.normal} ${theme.animation.easing.easeOut}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.spacing[2],
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.medium,
                      marginBottom: theme.spacing[1]
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.surface.hover;
                      e.currentTarget.style.color = theme.colors.text.primary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = theme.colors.text.secondary;
                    }}
                  >
                    {/* 프로필 이미지 */}
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      flexShrink: 0,
                      border: `1px solid ${theme.colors.surface.border}`
                    }}>
                      <img
                        src={member.profileUrl || "/images/placeholder.png"}
                        alt={`${member.nickname} Profile`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                    
                    {/* 온라인 상태 표시 */}
                    <div style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.spacing[2]
                    }}>
                      {(() => {
                        const status = memberStatuses[member.userId] || 'OFFLINE';
                        const statusColor = status === 'ONLINE' 
                          ? theme.colors.status.success 
                          : status === 'AWAY' 
                            ? theme.colors.status.warning
                            : theme.colors.text.muted;
                        
                        return (
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: statusColor,
                            position: 'absolute',
                            left: '-14px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            border: status === 'OFFLINE' ? `1px solid ${theme.colors.surface.border}` : 'none'
                          }}></div>
                        );
                      })()}
                      <span style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing[2]
                      }}>
                        <span>{member.nickname}</span>
                        {isCurrentUser(member) && (
                          <span style={{
                            fontSize: theme.typography.fontSize.xs,
                            color: theme.colors.primary.brand,
                            fontWeight: theme.typography.fontWeight.semibold,
                            backgroundColor: theme.colors.primary.brand + '20',
                            padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                            borderRadius: theme.borderRadius.sm,
                            flexShrink: 0
                          }}>
                            나
                          </span>
                        )}
                      </span>
                      {/* 상태 텍스트 (호버 시 표시) */}
                      <span style={{
                        fontSize: theme.typography.fontSize.xs,
                        color: theme.colors.text.muted,
                        opacity: 0.7,
                        display: 'none'
                      }}>
                        {memberStatuses[member.userId] === 'ONLINE' ? '온라인' : 
                         memberStatuses[member.userId] === 'AWAY' ? '자리비움' : '오프라인'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{
                  padding: `${theme.spacing[4]} ${theme.spacing[2]}`,
                  color: theme.colors.text.muted,
                  fontSize: theme.typography.fontSize.sm,
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: theme.typography.fontSize.lg,
                    marginBottom: theme.spacing[2],
                    opacity: 0.5
                  }}>
                    👥
                  </div>
                  멤버를 불러오는 중...
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.colors.background.primary,
        position: 'relative'
      }}>
        {/* Channel Header */}
        {selectedChannel && (
          <div style={{
            padding: `${theme.spacing[5]} ${theme.spacing[6]}`,
            borderBottom: `1px solid ${theme.colors.surface.border}`,
            background: `linear-gradient(135deg, ${theme.colors.background.secondary} 0%, ${theme.colors.background.primary} 100%)`,
            position: 'relative',
            zIndex: 10,
            backdropFilter: 'blur(20px)'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: theme.colors.gradient.primary,
              opacity: 0.6
            }}></div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing[4] }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: theme.borderRadius.xl,
                  background: `linear-gradient(135deg, ${theme.colors.primary.brand}33 0%, ${theme.colors.primary.accent}33 100%)`,
                  border: `1px solid ${theme.colors.primary.brand}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: theme.typography.fontSize.xl,
                  color: theme.colors.primary.brand,
                  fontWeight: theme.typography.fontWeight.bold,
                  boxShadow: `0 0 20px ${theme.colors.primary.brand}4D`
                }}>
                  #
                </div>
                
                <div>
                  <h2 style={{
                    fontSize: theme.typography.fontSize['2xl'],
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.text.primary,
                    marginBottom: theme.spacing[1],
                    letterSpacing: theme.typography.letterSpacing.tight,
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing[1]
                  }}>
                    {selectedChannel.channelName || selectedChannel.name}
                  </h2>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing[3]
                  }}>
                    <p style={{ 
                      fontSize: theme.typography.fontSize.sm, 
                      color: theme.colors.text.secondary,
                      fontWeight: theme.typography.fontWeight.medium,
                      margin: 0
                    }}>
                      {selectedChannel.description || '채널에서 팀과 소통하세요'}
                    </p>
                    <div style={{
                      padding: `${theme.spacing[1]} ${theme.spacing[2]}`,
                      borderRadius: theme.borderRadius.md,
                      backgroundColor: theme.colors.status.successBg,
                      fontSize: theme.typography.fontSize.xs,
                      color: theme.colors.status.success,
                      fontWeight: theme.typography.fontWeight.medium,
                      border: `1px solid rgba(75, 192, 121, 0.3)`
                    }}>
                      활성
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing[2]
              }}>
                <button style={{
                  background: 'none',
                  border: `1px solid ${theme.colors.surface.border}`,
                  borderRadius: theme.borderRadius.md,
                  padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.text.primary,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing[2],
                  transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.ease}`,
                  backgroundColor: theme.colors.surface.default
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.surface.hover;
                  e.currentTarget.style.borderColor = theme.colors.surface.borderHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.surface.default;
                  e.currentTarget.style.borderColor = theme.colors.surface.border;
                }}
                >
                  👥 멤버
                </button>
                <button style={{
                  background: 'none',
                  border: 'none',
                  padding: theme.spacing[2],
                  fontSize: theme.typography.fontSize.lg,
                  color: theme.colors.text.secondary,
                  cursor: 'pointer',
                  borderRadius: theme.borderRadius.md,
                  transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.ease}`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.surface.hover;
                  e.currentTarget.style.color = theme.colors.text.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.colors.text.secondary;
                }}
                >
                  ⚙️
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Slack-style Message List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0',
          display: 'flex',
          flexDirection: 'column',
          scrollbarWidth: 'thin'
        }} ref={messagesEndRef}>
          {isLoadingMessages ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '200px',
              flexDirection: 'column',
              gap: theme.spacing[4]
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                border: `3px solid ${theme.colors.surface.border}`,
                borderTop: `3px solid ${theme.colors.primary.brand}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.medium
              }}>
                메시지를 불러오는 중...
              </p>
            </div>
          ) : hasMessages ? (
            groupedMessages.map((group) => {
              if (group.type === 'date-divider') {
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                
                let dateLabel;
                if (group.date.toDateString() === today.toDateString()) {
                  dateLabel = '오늘';
                } else if (group.date.toDateString() === yesterday.toDateString()) {
                  dateLabel = '어제';
                } else {
                  dateLabel = group.date.toLocaleDateString('ko-KR', { 
                    month: 'long', 
                    day: 'numeric', 
                    weekday: 'long' 
                  });
                }
                
                return (
                  <div key={group.id} style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    margin: `${theme.spacing[6]} 0`,
                    padding: `0 ${theme.spacing[6]}`
                  }}>
                    <div style={{
                      flex: 1,
                      height: '1px',
                      backgroundColor: theme.colors.surface.border
                    }}></div>
                    <div style={{
                      padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                      backgroundColor: theme.colors.background.primary,
                      color: theme.colors.text.secondary,
                      fontSize: theme.typography.fontSize.sm,
                      fontWeight: theme.typography.fontWeight.semibold,
                      borderRadius: theme.borderRadius.full,
                      border: `1px solid ${theme.colors.surface.border}`,
                      whiteSpace: 'nowrap'
                    }}>
                      {dateLabel}
                    </div>
                    <div style={{
                      flex: 1,
                      height: '1px',
                      backgroundColor: theme.colors.surface.border
                    }}></div>
                  </div>
                );
              }
              
              if (group.type === 'message-group') {
                return (
                  <div 
                    key={group.id}
                    style={{
                      padding: `${theme.spacing[1]} ${theme.spacing[6]}`,
                      transition: `background-color ${theme.animation.duration.fast} ${theme.animation.easing.ease}`,
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.surface.hover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: theme.spacing[3],
                      padding: `${theme.spacing[2]} 0`
                    }}>
                      {/* Profile Image */}
                      <div style={{
                        width: '36px',
                        height: '36px',
                        flexShrink: 0
                      }}>
                        <img
                          src={group.messages[0].profileImgUrl || "/images/placeholder.png"}
                          alt={`${group.sender} Profile`}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: theme.borderRadius.md,
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                      
                      {/* Message Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Header */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: theme.spacing[2],
                          marginBottom: theme.spacing[1]
                        }}>
                          <span style={{
                            fontSize: theme.typography.fontSize.sm,
                            fontWeight: theme.typography.fontWeight.bold,
                            color: group.isMe ? theme.colors.text.secondary : theme.colors.text.primary
                          }}>
                            {group.sender}
                          </span>
                          <span style={{
                            fontSize: theme.typography.fontSize.xs,
                            color: theme.colors.text.muted,
                            fontWeight: theme.typography.fontWeight.regular
                          }}>
                            {group.timestamp.toLocaleTimeString('ko-KR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        
                        {/* Messages */}
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: theme.spacing[1]
                        }}>
                          {group.messages.map((message) => (
                            <div
                              key={message.id}
                              style={{
                                fontSize: theme.typography.fontSize.sm,
                                lineHeight: theme.typography.lineHeight.relaxed,
                                color: theme.colors.text.primary,
                                wordBreak: 'break-word'
                              }}
                            >
                              {message.content}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              
              return null;
            })
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: theme.spacing[4],
              opacity: 0.7,
              padding: `${theme.spacing[8]} ${theme.spacing[6]}`
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: theme.colors.gradient.surface,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: theme.typography.fontSize['3xl'],
                marginBottom: theme.spacing[2]
              }}>
                💬
              </div>
              <h3 style={{
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text.primary,
                marginBottom: theme.spacing[2],
                margin: 0
              }}>
                #{selectedChannel?.channelName || selectedChannel?.name}에 어서오세요!
              </h3>
              <p style={{
                fontSize: theme.typography.fontSize.base,
                color: theme.colors.text.secondary,
                textAlign: 'center',
                maxWidth: '400px',
                lineHeight: theme.typography.lineHeight.relaxed,
                margin: 0
              }}>
                이 채널은 {selectedChannel?.description || '팀 협업을 위한 공간입니다'}. 
                대화를 시작해보세요!
              </p>
            </div>
          )}
        </div>
        
        <style>
          {`
            @keyframes slideUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            
            @keyframes fadeIn {
              from {
                opacity: 0;
              }
              to {
                opacity: 1;
              }
            }
            
            @keyframes pulse {
              0%, 100% {
                transform: scale(1);
              }
              50% {
                transform: scale(1.05);
              }
            }
            
            .message-bubble:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
            }
            
            .channel-item:hover .channel-indicator {
              animation: pulse 1s ease-in-out infinite;
            }
            
            /* Custom scrollbar */
            ::-webkit-scrollbar {
              width: 6px;
            }
            
            ::-webkit-scrollbar-track {
              background: ${theme.colors.background.secondary};
            }
            
            ::-webkit-scrollbar-thumb {
              background: ${theme.colors.surface.border};
              border-radius: 3px;
            }
            
            ::-webkit-scrollbar-thumb:hover {
              background: ${theme.colors.primary.brand};
            }
          `}
        </style>

        {/* Slack-style Message Input */}
        {selectedChannel && (
          <div style={{
            padding: `${theme.spacing[4]} ${theme.spacing[6]}`,
            backgroundColor: theme.colors.background.secondary,
            borderTop: `1px solid ${theme.colors.surface.border}`
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing[2]
            }}>
              <div style={{
                flexGrow: 1,
                position: 'relative'
              }}>
                <Input
                  type="text"
                  placeholder={`#${selectedChannel.name || selectedChannel.channelName} 에 메시지 보내기`}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
                    border: 'none',
                    borderRadius: theme.borderRadius.md,
                    backgroundColor: theme.colors.background.primary,
                    color: theme.colors.text.primary,
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.regular,
                    outline: 'none',
                    fontFamily: theme.typography.fontFamily.sans,
                    lineHeight: theme.typography.lineHeight.normal,
                    boxShadow: 'none'
                  }}
                />
                
                {isSending && (
                  <div style={{
                    position: 'absolute',
                    right: theme.spacing[4],
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme.spacing[2],
                    color: theme.colors.text.muted,
                    fontSize: theme.typography.fontSize.xs
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      border: `2px solid ${theme.colors.surface.border}`,
                      borderTop: `2px solid ${theme.colors.text.muted}`,
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    전송 중...
                  </div>
                )}
              </div>
              
              <button style={{
                padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                borderRadius: theme.borderRadius.md,
                backgroundColor: theme.colors.background.primary,
                border: 'none',
                color: theme.colors.text.secondary,
                cursor: 'pointer',
                fontSize: theme.typography.fontSize.base,
                transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.ease}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.surface.hover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.background.primary;
              }}
              >
                📎
              </button>
              
              {canSendMessage && (
                <button 
                  onClick={handleSendMessage}
                  disabled={isSending}
                  style={{
                    padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
                    borderRadius: theme.borderRadius.md,
                    background: theme.colors.surface.active,
                    color: theme.colors.text.primary,
                    fontWeight: theme.typography.fontWeight.semibold,
                    fontSize: theme.typography.fontSize.sm,
                    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.ease}`,
                    cursor: 'pointer',
                    opacity: isSending ? 0.7 : 1,
                    border: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSending) {
                      e.currentTarget.style.backgroundColor = theme.colors.surface.border;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.surface.active;
                  }}
                >
                  {isSending ? '전송 중...' : '전송'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(WorkspaceDetailPage);
