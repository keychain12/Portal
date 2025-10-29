class NotificationService {
  // 멘션된 사용자 ID 추출하기
  static extractMentions(message) {
    const mentions = [];
    
    // @username 패턴 찾기 (예: @john, @jane_doe)
    const userMentions = message.match(/@(\w+)/g);
    if (userMentions) {
      mentions.push(...userMentions.map(mention => ({
        type: 'USER',
        username: mention.slice(1) // @ 제거
      })));
    }
    
    // @channel 확인
    if (message.includes('@channel')) {
      mentions.push({ type: 'CHANNEL' });
    }
    
    // @here 확인  
    if (message.includes('@here')) {
      mentions.push({ type: 'HERE' });
    }
    
    return mentions;
  }

  // 멘션된 유저네임을 유저 ID로 변환
  static async getUserIdsByUsernames(usernames, workspaceMembers) {
    const userIds = [];
    
    for (const username of usernames) {
      // workspaceMembers에서 username에 해당하는 유저 찾기
      const member = workspaceMembers.find(member => 
        member.nickname?.toLowerCase() === username.toLowerCase() ||
        member.email?.split('@')[0].toLowerCase() === username.toLowerCase()
      );
      
      if (member) {
        userIds.push(member.userId);
      }
    }
    
    return userIds;
  }

  // 멘션 알림 생성 (각 사용자별로 개별 호출)
  static async createMentionNotification({
    workspaceId,
    channelId,
    senderId,
    message,
    mentionedUserIds,
    mentionType = 'USER'
  }) {
    const authToken = localStorage.getItem('authToken');
    
    // 각 멘션된 사용자에게 개별적으로 알림 전송
    for (const recipientId of mentionedUserIds) {
      try {
        const response = await fetch('http://localhost:8083/api/notifications/mention', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            workspaceId,
            recipientId, // 각 사용자에게 개별 알림
            senderId,
            channelId,
            message,
            mentionedUserIds: [recipientId], // 해당 사용자만 포함
            mentionType
          }),
        });

        if (!response.ok) {
          console.error(`사용자 ${recipientId}에게 멘션 알림 생성 실패:`, response.status);
        } else {
          const result = await response.text();
          console.log(`사용자 ${recipientId}에게 멘션 알림 전송 성공. 응답:`, result);
        }
      } catch (error) {
        console.error(`사용자 ${recipientId}에게 멘션 알림 생성 중 오류:`, error);
      }
    }
  }

  // 메시지에서 멘션을 감지하고 알림 생성
  static async handleMessageMentions({
    message,
    workspaceId,
    channelId,
    senderId,
    workspaceMembers
  }) {
    const mentions = this.extractMentions(message);
    
    if (mentions.length === 0) return;

    for (const mention of mentions) {
      let mentionedUserIds = [];
      let mentionType = mention.type;

      if (mention.type === 'USER') {
        // 특정 유저 멘션
        mentionedUserIds = await this.getUserIdsByUsernames([mention.username], workspaceMembers);
      } else if (mention.type === 'CHANNEL') {
        // @channel - 채널의 모든 멤버에게 알림
        mentionedUserIds = workspaceMembers.map(member => member.userId);
        mentionType = 'CHANNEL';
      } else if (mention.type === 'HERE') {
        // @here - 현재 온라인인 멤버에게만 알림 (일단 모든 멤버로 처리)
        mentionedUserIds = workspaceMembers.map(member => member.userId);
        mentionType = 'HERE';
      }

      if (mentionedUserIds.length > 0) {
        await this.createMentionNotification({
          workspaceId,
          channelId,
          senderId,
          message,
          mentionedUserIds,
          mentionType
        });
      }
    }
  }

  // 메시지 텍스트에서 멘션 부분을 하이라이트 처리
  static highlightMentions(message) {
    return message
      .replace(/@(\w+)/g, '<span style="background-color: #1f9cf0; color: white; padding: 2px 4px; border-radius: 3px;">@$1</span>')
      .replace(/@channel/g, '<span style="background-color: #e01e5a; color: white; padding: 2px 4px; border-radius: 3px;">@channel</span>')
      .replace(/@here/g, '<span style="background-color: #ecb22e; color: white; padding: 2px 4px; border-radius: 3px;">@here</span>');
  }
}

export default NotificationService;