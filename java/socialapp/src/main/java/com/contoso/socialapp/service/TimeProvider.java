package com.contoso.socialapp.service;

import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Component
public class TimeProvider {
    public String nowIso() {
        return OffsetDateTime.now(ZoneOffset.UTC).toString();
    }
}
