package com.example.intercation.repository;

import com.example.intercation.entity.Channel;
import com.example.intercation.entity.ChannelType;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ChannelRepository extends JpaRepository<Channel, Long> {



    boolean existsByWorkspaceIdAndChannelName(Long workspaceId, String channelName);

    Optional<Channel> findByIdAndWorkspaceId(Long channelId, Long workspaceId);


    @Query("select c from Channel c where c.workspaceId = :workspaceId and c.channelType = :channelType")
    List<Channel> findChannelsByWorkspaceAndChannelType(Long workspaceId, ChannelType channelType);

}
