package com.example.workspaceservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.ImportAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.cloud.openfeign.FeignAutoConfiguration;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableKafka
@EnableCaching
@SpringBootApplication
@EnableScheduling //스케쥴링 어노테이션
@EnableAsync // 비동기 기능 활성화
@EnableFeignClients(basePackages = "com.example.workspaceservice.client") // 페인 안될시..이거 추가!
@EnableDiscoveryClient // 유레카!
@ImportAutoConfiguration({FeignAutoConfiguration.class})
public class WorkspaceServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(WorkspaceServiceApplication.class, args);
    }

}
