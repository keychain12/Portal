package com.example.intercation.repository;

import com.example.intercation.entity.ChannelMember;
import com.example.intercation.entity.Channel;
import com.example.intercation.entity.ChannelType;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChannelMemberRepository extends JpaRepository<ChannelMember, Long> {

    List<ChannelMember> findAllByChannel(Channel channel);

    Optional<ChannelMember> findByUserIdAndChannelId(Long userId, Long channelId);



}
