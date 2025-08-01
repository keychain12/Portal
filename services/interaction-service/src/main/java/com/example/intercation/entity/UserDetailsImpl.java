package com.example.intercation.entity;

import com.example.intercation.dto.response.UserProfileResponse;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class UserDetailsImpl implements UserDetails {


    private final UserProfileResponse userProfile;

    public UserDetailsImpl(UserProfileResponse userProfile) {
        this.userProfile = userProfile;
    }


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // 사용자의 권한(Role)을 반환. 여기서는 간단히 "ROLE_USER"로 고정.
        // 필요하다면 user 객체에서 role 정보를 가져와 동적으로 설정할 수 있음.
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
    }

    @Override
    public String getPassword() {
        return null;
    }

    @Override
    public String getUsername() {
        // UserDetails에서 'username'은 일반적으로 ID 역할을 하는 식별자를 의미함.
        // 보통 email을 사용.
        return userProfile.getEmail();
    }


    @Override
    public boolean isAccountNonExpired() {
        return true; // 계정이 만료되지 않았는가?
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // 계정이 잠기지 않았는가?
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // 자격 증명(비밀번호)이 만료되지 않았는가?
    }

    @Override
    public boolean isEnabled() {
        return true; // 계정이 활성화되었는가?
    }

    public Long getUserId() {
        return userProfile.getId();
    }

    public String getNickname() {
        return userProfile.getUsername();
    }
}
