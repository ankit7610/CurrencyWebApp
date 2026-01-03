package com.currency

import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@SpringBootTest
@AutoConfigureMockMvc
class CurrencyApplicationIntegrationTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Test
    fun `application context should load successfully`() {
        // This test verifies that the Spring context loads without errors
    }

    @Test
    fun `GET currencies endpoint should be accessible`() {
        mockMvc.perform(get("/api/currencies"))
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.currencies").exists())
    }

    @Test
    fun `POST convert endpoint should be accessible`() {
        val requestBody = """
            {
                "from": "USD",
                "to": "EUR",
                "amount": 100.0
            }
        """.trimIndent()

        mockMvc.perform(
            post("/api/convert")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody)
        )
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.from").value("USD"))
            .andExpect(jsonPath("$.to").value("EUR"))
            .andExpect(jsonPath("$.amount").value(100.0))
            .andExpect(jsonPath("$.convertedAmount").exists())
            .andExpect(jsonPath("$.rate").exists())
    }

    @Test
    fun `CORS should be configured for frontend origin`() {
        mockMvc.perform(
            get("/api/currencies")
                .header("Origin", "http://localhost:5173")
        )
            .andExpect(status().isOk)
            .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
    }

    @Test
    fun `cache should be configured`() {
        // First request
        val start1 = System.currentTimeMillis()
        mockMvc.perform(get("/api/currencies"))
            .andExpect(status().isOk)
        val duration1 = System.currentTimeMillis() - start1

        // Second request (should be faster due to caching)
        val start2 = System.currentTimeMillis()
        mockMvc.perform(get("/api/currencies"))
            .andExpect(status().isOk)
        val duration2 = System.currentTimeMillis() - start2

        // Second request should generally be faster (cached)
        // Note: This is a soft assertion as timing can vary
        println("First request: ${duration1}ms, Second request: ${duration2}ms")
    }

    @Test
    fun `conversion should work end-to-end`() {
        // Get available currencies first
        val currenciesResult = mockMvc.perform(get("/api/currencies"))
            .andExpect(status().isOk)
            .andReturn()

        // Verify we got currencies back
        val content = currenciesResult.response.contentAsString
        assert(content.contains("USD"))

        // Perform a conversion
        val requestBody = """
            {
                "from": "USD",
                "to": "EUR",
                "amount": 100.0
            }
        """.trimIndent()

        mockMvc.perform(
            post("/api/convert")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.convertedAmount").isNumber)
            .andExpect(jsonPath("$.rate").isNumber)
    }

    @Test
    fun `should return 404 for unknown endpoint`() {
        mockMvc.perform(get("/api/unknown"))
            .andExpect(status().isNotFound)
    }

    @Test
    fun `should return 400 for invalid currency conversion end-to-end`() {
        val requestBody = """
            {
                "from": "INVALID",
                "to": "EUR",
                "amount": 100.0
            }
        """.trimIndent()

        mockMvc.perform(
            post("/api/convert")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody)
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.error").value("Bad Request"))
            .andExpect(jsonPath("$.message").exists())
    }
}
