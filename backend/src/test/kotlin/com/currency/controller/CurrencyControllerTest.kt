package com.currency.controller

import com.currency.model.ConversionRequest
import com.currency.service.CurrencyService
import com.ninjasquad.springmockk.MockkBean
import io.mockk.every
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*

@WebMvcTest(CurrencyController::class)
class CurrencyControllerTest {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @MockkBean
    private lateinit var currencyService: CurrencyService

    @Test
    fun `GET currencies should return all available currencies`() {
        // Given
        val mockRates = mapOf(
            "USD" to 1.0,
            "EUR" to 0.85,
            "GBP" to 0.73,
            "JPY" to 110.0
        )
        every { currencyService.fetchCurrencyRates() } returns mockRates

        // When & Then
        mockMvc.perform(get("/api/currencies"))
            .andExpect(status().isOk)
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.currencies.USD").value(1.0))
            .andExpect(jsonPath("$.currencies.EUR").value(0.85))
            .andExpect(jsonPath("$.currencies.GBP").value(0.73))
            .andExpect(jsonPath("$.currencies.JPY").value(110.0))
    }

    @Test
    fun `POST convert should return conversion result for valid request`() {
        // Given
        val convertedAmount = 85.0
        val rate = 0.85
        every { currencyService.convertCurrency("USD", "EUR", 100.0) } returns Pair(convertedAmount, rate)

        val requestBody = """
            {
                "from": "USD",
                "to": "EUR",
                "amount": 100.0
            }
        """.trimIndent()

        // When & Then
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
            .andExpect(jsonPath("$.convertedAmount").value(85.0))
            .andExpect(jsonPath("$.rate").value(0.85))
    }

    @Test
    fun `POST convert should handle decimal amounts`() {
        // Given
        val convertedAmount = 104.93
        val rate = 0.85
        every { currencyService.convertCurrency("USD", "EUR", 123.45) } returns Pair(convertedAmount, rate)

        val requestBody = """
            {
                "from": "USD",
                "to": "EUR",
                "amount": 123.45
            }
        """.trimIndent()

        // When & Then
        mockMvc.perform(
            post("/api/convert")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.amount").value(123.45))
            .andExpect(jsonPath("$.convertedAmount").value(104.93))
    }

    @Test
    fun `POST convert should handle conversion between non-USD currencies`() {
        // Given
        val convertedAmount = 85.88
        val rate = 0.8588
        every { currencyService.convertCurrency("EUR", "GBP", 100.0) } returns Pair(convertedAmount, rate)

        val requestBody = """
            {
                "from": "EUR",
                "to": "GBP",
                "amount": 100.0
            }
        """.trimIndent()

        // When & Then
        mockMvc.perform(
            post("/api/convert")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.from").value("EUR"))
            .andExpect(jsonPath("$.to").value("GBP"))
            .andExpect(jsonPath("$.convertedAmount").value(85.88))
    }

    @Test
    fun `POST convert should return 400 for invalid JSON`() {
        // Given
        val invalidRequestBody = """
            {
                "from": "USD",
                "to": "EUR",
                "amount": 
            }
        """.trimIndent()

        // When & Then
        mockMvc.perform(
            post("/api/convert")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidRequestBody)
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `POST convert should handle zero amount`() {
        // Given
        val convertedAmount = 0.0
        val rate = 0.85
        every { currencyService.convertCurrency("USD", "EUR", 0.0) } returns Pair(convertedAmount, rate)

        val requestBody = """
            {
                "from": "USD",
                "to": "EUR",
                "amount": 0.0
            }
        """.trimIndent()

        // When & Then
        mockMvc.perform(
            post("/api/convert")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.amount").value(0.0))
            .andExpect(jsonPath("$.convertedAmount").value(0.0))
    }

    @Test
    fun `POST convert should handle large amounts`() {
        // Given
        val convertedAmount = 850000.0
        val rate = 0.85
        every { currencyService.convertCurrency("USD", "EUR", 1000000.0) } returns Pair(convertedAmount, rate)

        val requestBody = """
            {
                "from": "USD",
                "to": "EUR",
                "amount": 1000000.0
            }
        """.trimIndent()

        // When & Then
        mockMvc.perform(
            post("/api/convert")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.amount").value(1000000.0))
            .andExpect(jsonPath("$.convertedAmount").value(850000.0))
    }

    @Test
    fun `POST convert should handle same currency conversion`() {
        // Given
        val convertedAmount = 100.0
        val rate = 1.0
        every { currencyService.convertCurrency("USD", "USD", 100.0) } returns Pair(convertedAmount, rate)

        val requestBody = """
            {
                "from": "USD",
                "to": "USD",
                "amount": 100.0
            }
        """.trimIndent()

        // When & Then
        mockMvc.perform(
            post("/api/convert")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.from").value("USD"))
            .andExpect(jsonPath("$.to").value("USD"))
            .andExpect(jsonPath("$.convertedAmount").value(100.0))
            .andExpect(jsonPath("$.rate").value(1.0))
    }

    @Test
    fun `GET currencies should handle CORS preflight request`() {
        // When & Then
        mockMvc.perform(
            options("/api/currencies")
                .header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "GET")
        )
            .andExpect(status().isOk)
    }

    @Test
    fun `POST convert should handle CORS preflight request`() {
        // When & Then
        mockMvc.perform(
            options("/api/convert")
                .header("Origin", "http://localhost:5173")
                .header("Access-Control-Request-Method", "POST")
        )
            .andExpect(status().isOk)
    }

    @Test
    fun `POST convert should return 400 when service throws IllegalArgumentException`() {
        // Given
        every { currencyService.convertCurrency("USD", "INVALID", 100.0) } throws IllegalArgumentException("Currency INVALID not found")

        val requestBody = """
            {
                "from": "USD",
                "to": "INVALID",
                "amount": 100.0
            }
        """.trimIndent()

        // When & Then
        mockMvc.perform(
            post("/api/convert")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody)
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.message").value("Currency INVALID not found"))
            .andExpect(jsonPath("$.error").value("Bad Request"))
    }

    @Test
    fun `GET currencies should return 500 when service throws RuntimeException`() {
        // Given
        every { currencyService.fetchCurrencyRates() } throws RuntimeException("API error")

        // When & Then
        mockMvc.perform(get("/api/currencies"))
            .andExpect(status().isInternalServerError)
            .andExpect(jsonPath("$.message").value("API error"))
            .andExpect(jsonPath("$.error").value("Internal Server Error"))
    }
}
