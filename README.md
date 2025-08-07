# Portal: 협업 워크스페이스 플랫폼

Portal은 Slack과 유사한 팀 협업 및 커뮤니케이션을 위한 마이크로서비스 기반 애플리케이션입니다. 이 프로젝트는 Java, Spring Boot, JPA를 사용하여 개발되었습니다.

## 아키텍처

이 프로젝트는 마이크로서비스 아키텍처를 따르며, 각 서비스는 특정 기능 분리를 담당합니다. 백엔드 서비스는 다음과 같이 구성됩니다.

*   **auth-service:** 사용자 인증 및 인가를 처리합니다.
*   **interaction-service:** 메시징 및 알림 채널과 같은 실시간 상호작용을 관리합니다.
*   **workspace-service:** 워크스페이스 및 기타 핵심 비즈니스 로직을 담당합니다.

## 기술 스택

### 공통
*   Java 20
*   Spring Boot
*   Spring Data JPA
*   Spring Data Redis
*   MySQL
*   JWT
*   Springdoc OpenAPI
*   Spring Cloud OpenFeign

### auth-service
*   Spring Security

### interaction-service
*   QueryDSL
*   AWS S3
*   Kafka
*   WebSocket
*   Spring Mail

### workspace-service
*   QueryDSL
*   AWS S3
*   Kafka
*   WebSocket
*   Spring Mail

## 서비스 상세

### Auth Service (인증 서비스)

*   **설명:** 사용자 회원가입, 로그인 및 인증을 처리합니다. 서비스 간의 안전한 통신을 위해 JWT를 사용합니다.

### Interaction Service (상호작용 서비스)

*   **설명:** 플랫폼 내의 실시간 통신 및 상호작용을 관리합니다. 메시지 전송 및 수신, 파일 공유, 알림 채널과 같은 기능을 포함합니다.

### Workspace Service (워크스페이스 서비스)

*   **설명:** 워크스페이스, 채널 생성 및 관리, 워크스페이스 내 사용자 역할 등 애플리케이션의 핵심 비즈니스 로직을 관리합니다.

## 프로젝트에 적용한 내용들 ..

- DDD 기반 워크스페이스 생성 기능 설계 및 구현

https://rose-quesadilla-dab.notion.site/DDD-215440d2302f8066bc05cb36fb286376?pvs=74

- Redis 사용해 사용자 실시간 상태를 구현해보기

https://rose-quesadilla-dab.notion.site/Redis-224440d2302f80799d38cdfd69f6b6cf

- 워크스페이스 초대 메일 발송 with @TransactionalEventListener

https://rose-quesadilla-dab.notion.site/with-TransactionalEventListener-215440d2302f804798f4dcb1478ecc3d

- 다른 디비 어케조회함? FeignClient를 사용해보자

https://rose-quesadilla-dab.notion.site/FeignClient-216440d2302f80d28325e79e12c010ed?pvs=74

- [MSA] Saga 패턴을 이용한 분산 트랜잭션 및 재시도 메커니즘 구현

https://rose-quesadilla-dab.notion.site/MSA-Saga-245440d2302f80b3a500f636b70e0537?pvs=73


