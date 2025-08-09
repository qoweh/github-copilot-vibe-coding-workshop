package com.contoso.socialapp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

@RestController
public class OpenApiStaticController {

    private static final String SPEC_CLASSPATH = "/openapi.yaml"; // ensure copy is on classpath

    @GetMapping(value = "/openapi.json", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> serveOpenApiJson() throws IOException {
        ClassPathResource resource = new ClassPathResource("openapi.yaml");
        if (!resource.exists()) {
            return ResponseEntity.internalServerError().body(Map.of("error", "INTERNAL_ERROR", "message", "Spec file missing"));
        }
        try (InputStream is = resource.getInputStream()) {
            ObjectMapper yamlReader = new ObjectMapper(new YAMLFactory());
            Map<?,?> obj = yamlReader.readValue(is, Map.class);
            return ResponseEntity.ok(obj);
        }
    }
}
