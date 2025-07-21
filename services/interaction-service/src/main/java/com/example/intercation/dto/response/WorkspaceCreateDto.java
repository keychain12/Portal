package com.example.intercation.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@ToString
@Setter
@NoArgsConstructor
public class WorkspaceCreateDto {
    private Long workspaceId;
    private Long creatorId;
    private String workspaceName;
}
