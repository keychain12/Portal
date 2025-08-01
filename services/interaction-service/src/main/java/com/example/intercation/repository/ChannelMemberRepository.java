package com.example.intercation.repository;

import com.example.intercation.entity.ChannelMember;
import com.example.intercation.entity.Channel;
import com.example.intercation.entity.Role;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChannelMemberRepository extends JpaRepository<ChannelMember, Long> {

    @Query("select cm.channel from ChannelMember cm where cm.userId = :userId and cm.channel.workspaceId = :workspaceId")
    List<Channel> findChannelsByUserAndWorkspace(@Param("userId") Long userId, @Param("workspaceId") Long workspaceId);

    List<ChannelMember> findAllByChannel(Channel channel);

    boolean existsByChannelAndUserId(Channel newChannel, Long creatorId);

    ChannelMember findByIdAndUserId(Long channelId, Long userId);

    Role findRoleByUserIdAndChannelId(Long userId, Long channelId);
}
