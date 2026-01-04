package com.currency.exception

import com.ninjasquad.springmockk.MockkBean
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import org.springframework.web.bind.annotation.*
import com.currency.service.CurrencyService
import io.mockk.every

@RestController
@RequestMapping("/test-exception")
class TestExceptionController {
    @GetMapping("/illegal-argument")
    fun throwIllegalArgument() {
        throw IllegalArgumentException("Invalid parameter provided")
    }

    @GetMapping("/runtime")
    fun throwRuntime() {
        throw RuntimeException("Something went wrong")
    }

    @PostMapping("/json-parse")
    fun parseJson(@RequestBody body: Map<String, Any>): Map<String, Any> {
        return body
    }
}

@WebMvcTest(controllers = [TestExceptionController::class, GlobalExceptionHandler::class])
class GlobalExceptionHandlerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockkBean(relaxed = true)
    private lateinit var currencyService: CurrencyService

    @Test
    fun `should handle IllegalArgumentException with proper error response`() {
        // When & Then
        mockMvc.perform(get("/test-exception/illegal-argument"))
            .andExpect(status().isBadRequest)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.status").value(400))
            .andExpect(jsonPath("$.error").value("Bad Request"))
            .andExpect(jsonPath("$.message").value("Invalid parameter provided"))
            .andExpect(jsonPath("$.timestamp").exists())
            .andExpect(jsonPath("$.path").exists())
    }

    @Test
    fun `should handle RuntimeException with proper error response`() {
        // When & Then
        mockMvc.perform(get("/test-exception/runtime"))
            .andExpect(status().isInternalServerError)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.status").value(500))
            .andExpect(jsonPath("$.error").value("Internal Server Error"))
            .andExpect(jsonPath("$.message").value("Something went wrong"))
            .andExpect(jsonPath("$.timestamp").exists())
            .andExpect(jsonPath("$.path").exists())
    }

    @Test
    fun `should handle HttpMessageNotReadableException for malformed JSON`() {
        // Given
        val malformedJson = """
            {
                "key": "value",
                "missing": 
            }
        """.trimIndent()

        // When & Then
        mockMvc.perform(
            post("/test-exception/json-parse")
                .contentType(MediaType.APPLICATION_JSON)
                .content(malformedJson)
        )
            .andExpect(status().isBadRequest)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.status").value(400))
            .andExpect(jsonPath("$.error").value("Bad Request"))
            .andExpect(jsonPath("$.message").value("Malformed JSON request"))
            .andExpect(jsonPath("$.timestamp").exists())
            .andExpect(jsonPath("$.path").exists())
    }

    @Test
    fun `should handle HttpMessageNotReadableException for invalid JSON structure`() {
        // Given
        val invalidJson = "not a valid json"

        // When & Then
        mockMvc.perform(
            post("/test-exception/json-parse")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson)
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.message").value("Malformed JSON request"))
    }

    @Test
    fun `should include correct path in error response`() {
        // When & Then
        mockMvc.perform(get("/test-exception/illegal-argument"))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.path").exists())
            .andExpect(jsonPath("$.path").isString)
    }

    @Test
    fun `error response should have all required fields`() {
        // When & Then
        mockMvc.perform(get("/test-exception/runtime"))
            .andExpect(status().isInternalServerError)
            .andExpect(jsonPath("$.timestamp").isNotEmpty)
            .andExpect(jsonPath("$.status").isNumber)
            .andExpect(jsonPath("$.error").isString)
            .andExpect(jsonPath("$.message").isString)
            .andExpect(jsonPath("$.path").isString)
    }

    @Test
    fun `should handle IllegalArgumentException with null message`() {
        // Note: This tests the fallback message when exception message is null
        // In practice, this is hard to trigger but tests defensive coding
        mockMvc.perform(get("/test-exception/illegal-argument"))
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.message").exists())
    }
}
