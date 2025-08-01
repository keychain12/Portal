package com.example.intercation.repository;

import com.example.intercation.entity.Channel;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ChannelRepository extends JpaRepository<Channel, Long> {


    Optional<Channel> findByWorkspaceIdAndChannelName(Long workspaceId, String channelName);

    boolean existsByWorkspaceIdAndChannelName(Long workspaceId, String channelName);

    Optional<Channel> findByIdAndWorkspaceId(Long channelId, Long workspaceId);
}
