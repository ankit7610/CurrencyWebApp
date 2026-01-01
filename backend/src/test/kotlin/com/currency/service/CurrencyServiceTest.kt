package com.currency.service

import com.currency.model.CurrencyRatesResponse
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import io.mockk.*
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse

class CurrencyServiceTest {

    private lateinit var currencyService: CurrencyService
    private val mockHttpClient = mockk<HttpClient>()
    private val mockResponse = mockk<HttpResponse<String>>()

    @BeforeEach
    fun setup() {
        currencyService = CurrencyService()
        // Use reflection to inject mock HttpClient
        val httpClientField = CurrencyService::class.java.getDeclaredField("httpClient")
        httpClientField.isAccessible = true
        httpClientField.set(currencyService, mockHttpClient)
    }

    @AfterEach
    fun tearDown() {
        clearAllMocks()
    }

    @Test
    fun `fetchCurrencyRates should return currency rates when API call is successful`() {
        // Given
        val mockApiResponse = """
            {
                "data": {
                    "USD": 1.0,
                    "EUR": 0.85,
                    "GBP": 0.73,
                    "JPY": 110.0
                }
            }
        """.trimIndent()

        every { mockHttpClient.send(any<HttpRequest>(), any<HttpResponse.BodyHandler<String>>()) } returns mockResponse
        every { mockResponse.statusCode() } returns 200
        every { mockResponse.body() } returns mockApiResponse

        // When
        val result = currencyService.fetchCurrencyRates()

        // Then
        assertNotNull(result)
        assertEquals(4, result.size)
        assertEquals(1.0, result["USD"])
        assertEquals(0.85, result["EUR"])
        assertEquals(0.73, result["GBP"])
        assertEquals(110.0, result["JPY"])

        verify(exactly = 1) { mockHttpClient.send(any<HttpRequest>(), any<HttpResponse.BodyHandler<String>>()) }
    }

    @Test
    fun `fetchCurrencyRates should throw exception when API returns non-200 status`() {
        // Given
        every { mockHttpClient.send(any<HttpRequest>(), any<HttpResponse.BodyHandler<String>>()) } returns mockResponse
        every { mockResponse.statusCode() } returns 500

        // When & Then
        val exception = assertThrows<RuntimeException> {
            currencyService.fetchCurrencyRates()
        }
        assertTrue(exception.message!!.contains("Failed to fetch currency rates"))
        assertTrue(exception.message!!.contains("500"))
    }

    @Test
    fun `fetchCurrencyRates should throw exception when API returns 404`() {
        // Given
        every { mockHttpClient.send(any<HttpRequest>(), any<HttpResponse.BodyHandler<String>>()) } returns mockResponse
        every { mockResponse.statusCode() } returns 404

        // When & Then
        val exception = assertThrows<RuntimeException> {
            currencyService.fetchCurrencyRates()
        }
        assertTrue(exception.message!!.contains("404"))
    }

    @Test
    fun `convertCurrency should correctly convert USD to EUR`() {
        // Given
        val mockApiResponse = """
            {
                "data": {
                    "USD": 1.0,
                    "EUR": 0.85
                }
            }
        """.trimIndent()

        every { mockHttpClient.send(any<HttpRequest>(), any<HttpResponse.BodyHandler<String>>()) } returns mockResponse
        every { mockResponse.statusCode() } returns 200
        every { mockResponse.body() } returns mockApiResponse

        // When
        val (convertedAmount, rate) = currencyService.convertCurrency("USD", "EUR", 100.0)

        // Then
        assertEquals(85.0, convertedAmount, 0.01)
        assertEquals(0.85, rate, 0.01)
    }

    @Test
    fun `convertCurrency should correctly convert EUR to USD`() {
        // Given
        val mockApiResponse = """
            {
                "data": {
                    "USD": 1.0,
                    "EUR": 0.85
                }
            }
        """.trimIndent()

        every { mockHttpClient.send(any<HttpRequest>(), any<HttpResponse.BodyHandler<String>>()) } returns mockResponse
        every { mockResponse.statusCode() } returns 200
        every { mockResponse.body() } returns mockApiResponse

        // When
        val (convertedAmount, rate) = currencyService.convertCurrency("EUR", "USD", 85.0)

        // Then
        assertEquals(100.0, convertedAmount, 0.01)
        assertEquals(1.176, rate, 0.01) // 1.0 / 0.85 ≈ 1.176
    }

    @Test
    fun `convertCurrency should correctly convert between non-USD currencies`() {
        // Given
        val mockApiResponse = """
            {
                "data": {
                    "USD": 1.0,
                    "EUR": 0.85,
                    "GBP": 0.73
                }
            }
        """.trimIndent()

        every { mockHttpClient.send(any<HttpRequest>(), any<HttpResponse.BodyHandler<String>>()) } returns mockResponse
        every { mockResponse.statusCode() } returns 200
        every { mockResponse.body() } returns mockApiResponse

        // When
        val (convertedAmount, rate) = currencyService.convertCurrency("EUR", "GBP", 100.0)

        // Then
        // EUR to USD: 100 / 0.85 = 117.647
        // USD to GBP: 117.647 * 0.73 = 85.88
        assertEquals(85.88, convertedAmount, 0.01)
        assertEquals(0.8588, rate, 0.01) // 0.73 / 0.85
    }

    @Test
    fun `convertCurrency should handle decimal amounts correctly`() {
        // Given
        val mockApiResponse = """
            {
                "data": {
                    "USD": 1.0,
                    "EUR": 0.85
                }
            }
        """.trimIndent()

        every { mockHttpClient.send(any<HttpRequest>(), any<HttpResponse.BodyHandler<String>>()) } returns mockResponse
        every { mockResponse.statusCode() } returns 200
        every { mockResponse.body() } returns mockApiResponse

        // When
        val (convertedAmount, rate) = currencyService.convertCurrency("USD", "EUR", 123.45)

        // Then
        assertEquals(104.93, convertedAmount, 0.01)
        assertEquals(0.85, rate, 0.01)
    }

    @Test
    fun `convertCurrency should throw exception when source currency not found`() {
        // Given
        val mockApiResponse = """
            {
                "data": {
                    "USD": 1.0,
                    "EUR": 0.85
                }
            }
        """.trimIndent()

        every { mockHttpClient.send(any<HttpRequest>(), any<HttpResponse.BodyHandler<String>>()) } returns mockResponse
        every { mockResponse.statusCode() } returns 200
        every { mockResponse.body() } returns mockApiResponse

        // When & Then
        val exception = assertThrows<IllegalArgumentException> {
            currencyService.convertCurrency("XYZ", "EUR", 100.0)
        }
        assertTrue(exception.message!!.contains("XYZ"))
        assertTrue(exception.message!!.contains("not found"))
    }

    @Test
    fun `convertCurrency should throw exception when target currency not found`() {
        // Given
        val mockApiResponse = """
            {
                "data": {
                    "USD": 1.0,
                    "EUR": 0.85
                }
            }
        """.trimIndent()

        every { mockHttpClient.send(any<HttpRequest>(), any<HttpResponse.BodyHandler<String>>()) } returns mockResponse
        every { mockResponse.statusCode() } returns 200
        every { mockResponse.body() } returns mockApiResponse

        // When & Then
        val exception = assertThrows<IllegalArgumentException> {
            currencyService.convertCurrency("USD", "XYZ", 100.0)
        }
        assertTrue(exception.message!!.contains("XYZ"))
        assertTrue(exception.message!!.contains("not found"))
    }

    @Test
    fun `convertCurrency should handle zero amount`() {
        // Given
        val mockApiResponse = """
            {
                "data": {
                    "USD": 1.0,
                    "EUR": 0.85
                }
            }
        """.trimIndent()

        every { mockHttpClient.send(any<HttpRequest>(), any<HttpResponse.BodyHandler<String>>()) } returns mockResponse
        every { mockResponse.statusCode() } returns 200
        every { mockResponse.body() } returns mockApiResponse

        // When
        val (convertedAmount, rate) = currencyService.convertCurrency("USD", "EUR", 0.0)

        // Then
        assertEquals(0.0, convertedAmount, 0.01)
        assertEquals(0.85, rate, 0.01)
    }

    @Test
    fun `convertCurrency should handle large amounts`() {
        // Given
        val mockApiResponse = """
            {
                "data": {
                    "USD": 1.0,
                    "EUR": 0.85
                }
            }
        """.trimIndent()

        every { mockHttpClient.send(any<HttpRequest>(), any<HttpResponse.BodyHandler<String>>()) } returns mockResponse
        every { mockResponse.statusCode() } returns 200
        every { mockResponse.body() } returns mockApiResponse

        // When
        val (convertedAmount, rate) = currencyService.convertCurrency("USD", "EUR", 1000000.0)

        // Then
        assertEquals(850000.0, convertedAmount, 0.01)
        assertEquals(0.85, rate, 0.01)
    }

    @Test
    fun `convertCurrency should handle same currency conversion`() {
        // Given
        val mockApiResponse = """
            {
                "data": {
                    "USD": 1.0,
                    "EUR": 0.85
                }
            }
        """.trimIndent()

        every { mockHttpClient.send(any<HttpRequest>(), any<HttpResponse.BodyHandler<String>>()) } returns mockResponse
        every { mockResponse.statusCode() } returns 200
        every { mockResponse.body() } returns mockApiResponse

        // When
        val (convertedAmount, rate) = currencyService.convertCurrency("USD", "USD", 100.0)

        // Then
        assertEquals(100.0, convertedAmount, 0.01)
        assertEquals(1.0, rate, 0.01)
    }
}
