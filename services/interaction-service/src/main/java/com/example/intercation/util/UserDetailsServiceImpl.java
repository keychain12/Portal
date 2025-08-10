package com.example.intercation.util;

import com.example.intercation.client.AuthClient;
import com.example.intercation.dto.response.UserProfileResponse;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final AuthClient authClient;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        try {
            UserProfileResponse userProfile = authClient.getUserProfileByEmail(email);

            return new UserDetailsImpl(userProfile);

        } catch (FeignException e) {
            throw new UsernameNotFoundException("사용자를 찾을 수 없습니다: " + email);
        }
    }
}