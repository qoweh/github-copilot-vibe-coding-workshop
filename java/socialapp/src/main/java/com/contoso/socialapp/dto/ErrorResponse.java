package com.contoso.socialapp.dto;

import lombok.Data;
import java.util.List;

@Data
public class ErrorResponse {
    private String error;   // code
    private String message; // human readable
    private List<String> details; // optional details
}
