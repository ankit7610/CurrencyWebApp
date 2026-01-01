package com.currency.model

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class CurrencyModelsTest {

    private val objectMapper = jacksonObjectMapper()

    @Test
    fun `CurrencyRatesResponse should deserialize from JSON correctly`() {
        // Given
        val json = """
            {
                "data": {
                    "USD": 1.0,
                    "EUR": 0.85,
                    "GBP": 0.73
                }
            }
        """.trimIndent()

        // When
        val response = objectMapper.readValue(json, CurrencyRatesResponse::class.java)

        // Then
        assertNotNull(response)
        assertEquals(3, response.data.size)
        assertEquals(1.0, response.data["USD"])
        assertEquals(0.85, response.data["EUR"])
        assertEquals(0.73, response.data["GBP"])
    }

    @Test
    fun `CurrencyRatesResponse should serialize to JSON correctly`() {
        // Given
        val response = CurrencyRatesResponse(
            data = mapOf(
                "USD" to 1.0,
                "EUR" to 0.85,
                "GBP" to 0.73
            )
        )

        // When
        val json = objectMapper.writeValueAsString(response)

        // Then
        assertTrue(json.contains("\"USD\":1.0"))
        assertTrue(json.contains("\"EUR\":0.85"))
        assertTrue(json.contains("\"GBP\":0.73"))
    }

    @Test
    fun `ConversionRequest should deserialize from JSON correctly`() {
        // Given
        val json = """
            {
                "from": "USD",
                "to": "EUR",
                "amount": 100.0
            }
        """.trimIndent()

        // When
        val request = objectMapper.readValue(json, ConversionRequest::class.java)

        // Then
        assertNotNull(request)
        assertEquals("USD", request.from)
        assertEquals("EUR", request.to)
        assertEquals(100.0, request.amount)
    }

    @Test
    fun `ConversionRequest should serialize to JSON correctly`() {
        // Given
        val request = ConversionRequest(
            from = "USD",
            to = "EUR",
            amount = 100.0
        )

        // When
        val json = objectMapper.writeValueAsString(request)

        // Then
        assertTrue(json.contains("\"from\":\"USD\""))
        assertTrue(json.contains("\"to\":\"EUR\""))
        assertTrue(json.contains("\"amount\":100.0"))
    }

    @Test
    fun `ConversionRequest should handle decimal amounts`() {
        // Given
        val json = """
            {
                "from": "USD",
                "to": "EUR",
                "amount": 123.45
            }
        """.trimIndent()

        // When
        val request = objectMapper.readValue(json, ConversionRequest::class.java)

        // Then
        assertEquals(123.45, request.amount)
    }

    @Test
    fun `ConversionResponse should serialize to JSON correctly`() {
        // Given
        val response = ConversionResponse(
            from = "USD",
            to = "EUR",
            amount = 100.0,
            convertedAmount = 85.0,
            rate = 0.85
        )

        // When
        val json = objectMapper.writeValueAsString(response)

        // Then
        assertTrue(json.contains("\"from\":\"USD\""))
        assertTrue(json.contains("\"to\":\"EUR\""))
        assertTrue(json.contains("\"amount\":100.0"))
        assertTrue(json.contains("\"convertedAmount\":85.0"))
        assertTrue(json.contains("\"rate\":0.85"))
    }

    @Test
    fun `ConversionResponse should deserialize from JSON correctly`() {
        // Given
        val json = """
            {
                "from": "USD",
                "to": "EUR",
                "amount": 100.0,
                "convertedAmount": 85.0,
                "rate": 0.85
            }
        """.trimIndent()

        // When
        val response = objectMapper.readValue(json, ConversionResponse::class.java)

        // Then
        assertNotNull(response)
        assertEquals("USD", response.from)
        assertEquals("EUR", response.to)
        assertEquals(100.0, response.amount)
        assertEquals(85.0, response.convertedAmount)
        assertEquals(0.85, response.rate)
    }

    @Test
    fun `ConversionResponse should handle large numbers`() {
        // Given
        val response = ConversionResponse(
            from = "USD",
            to = "EUR",
            amount = 1000000.0,
            convertedAmount = 850000.0,
            rate = 0.85
        )

        // When
        val json = objectMapper.writeValueAsString(response)
        val deserialized = objectMapper.readValue(json, ConversionResponse::class.java)

        // Then
        assertEquals(1000000.0, deserialized.amount)
        assertEquals(850000.0, deserialized.convertedAmount)
    }

    @Test
    fun `CurrenciesResponse should serialize to JSON correctly`() {
        // Given
        val response = CurrenciesResponse(
            currencies = mapOf(
                "USD" to 1.0,
                "EUR" to 0.85,
                "GBP" to 0.73
            )
        )

        // When
        val json = objectMapper.writeValueAsString(response)

        // Then
        assertTrue(json.contains("\"currencies\""))
        assertTrue(json.contains("\"USD\":1.0"))
        assertTrue(json.contains("\"EUR\":0.85"))
        assertTrue(json.contains("\"GBP\":0.73"))
    }

    @Test
    fun `CurrenciesResponse should deserialize from JSON correctly`() {
        // Given
        val json = """
            {
                "currencies": {
                    "USD": 1.0,
                    "EUR": 0.85,
                    "GBP": 0.73
                }
            }
        """.trimIndent()

        // When
        val response = objectMapper.readValue(json, CurrenciesResponse::class.java)

        // Then
        assertNotNull(response)
        assertEquals(3, response.currencies.size)
        assertEquals(1.0, response.currencies["USD"])
        assertEquals(0.85, response.currencies["EUR"])
        assertEquals(0.73, response.currencies["GBP"])
    }

    @Test
    fun `Data classes should support equality`() {
        // Given
        val request1 = ConversionRequest("USD", "EUR", 100.0)
        val request2 = ConversionRequest("USD", "EUR", 100.0)
        val request3 = ConversionRequest("USD", "GBP", 100.0)

        // Then
        assertEquals(request1, request2)
        assertNotEquals(request1, request3)
    }

    @Test
    fun `Data classes should support copy`() {
        // Given
        val original = ConversionRequest("USD", "EUR", 100.0)

        // When
        val copy = original.copy(amount = 200.0)

        // Then
        assertEquals("USD", copy.from)
        assertEquals("EUR", copy.to)
        assertEquals(200.0, copy.amount)
        assertEquals(100.0, original.amount) // Original unchanged
    }

    @Test
    fun `ConversionResponse should handle zero values`() {
        // Given
        val response = ConversionResponse(
            from = "USD",
            to = "EUR",
            amount = 0.0,
            convertedAmount = 0.0,
            rate = 0.85
        )

        // When
        val json = objectMapper.writeValueAsString(response)
        val deserialized = objectMapper.readValue(json, ConversionResponse::class.java)

        // Then
        assertEquals(0.0, deserialized.amount)
        assertEquals(0.0, deserialized.convertedAmount)
        assertEquals(0.85, deserialized.rate)
    }
}
