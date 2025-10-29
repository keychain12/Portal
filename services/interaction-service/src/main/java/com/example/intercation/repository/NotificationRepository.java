package com.example.intercation.repository;

import com.example.intercation.entity.Notification;
import com.example.intercation.service.NotificationService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification,Long> {

}
