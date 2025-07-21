package com.example.workspaceservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.cloud.openfeign.FeignAutoConfiguration;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableKafka // ✅ 이 어노테이션을 추가해보세요.
//@EnableCaching
@SpringBootApplication
@EnableAsync // 비동기 기능 활성화
@EnableFeignClients(basePackages = "com.example.workspaceservice.client") // 이거 추가!
@ImportAutoConfiguration({FeignAutoConfiguration.class})
public class WorkspaceServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(WorkspaceServiceApplication.class, args);
    }

}
