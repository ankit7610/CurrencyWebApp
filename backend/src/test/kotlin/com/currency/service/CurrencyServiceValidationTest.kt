package com.currency.service

import io.mockk.*
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse

class CurrencyServiceValidationTest {

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

        // Setup default successful API response
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
    }

    @AfterEach
    fun tearDown() {
        clearAllMocks()
    }

    // Amount validation tests
    @Test
    fun `should throw exception for negative amount`() {
        val exception = assertThrows<IllegalArgumentException> {
            currencyService.convertCurrency("USD", "EUR", -100.0)
        }
        assertEquals("Amount cannot be negative", exception.message)
    }

    @Test
    fun `should throw exception for zero amount`() {
        val exception = assertThrows<IllegalArgumentException> {
            currencyService.convertCurrency("USD", "EUR", 0.0)
        }
        assertEquals("Amount must be greater than zero", exception.message)
    }

    @Test
    fun `should throw exception for NaN amount`() {
        val exception = assertThrows<IllegalArgumentException> {
            currencyService.convertCurrency("USD", "EUR", Double.NaN)
        }
        assertEquals("Amount must be a valid number", exception.message)
    }

    @Test
    fun `should throw exception for infinite amount`() {
        val exception = assertThrows<IllegalArgumentException> {
            currencyService.convertCurrency("USD", "EUR", Double.POSITIVE_INFINITY)
        }
        assertEquals("Amount must be a finite number", exception.message)
    }

    @Test
    fun `should throw exception for negative infinite amount`() {
        val exception = assertThrows<IllegalArgumentException> {
            currencyService.convertCurrency("USD", "EUR", Double.NEGATIVE_INFINITY)
        }
        assertEquals("Amount must be a finite number", exception.message)
    }

    @Test
    fun `should throw exception for amount exceeding maximum`() {
        val exception = assertThrows<IllegalArgumentException> {
            currencyService.convertCurrency("USD", "EUR", 1_000_000_000_001.0)
        }
        assertEquals("Amount exceeds maximum allowed value", exception.message)
    }

    @Test
    fun `should accept maximum allowed amount`() {
        val result = currencyService.convertCurrency("USD", "EUR", 1_000_000_000_000.0)
        assertNotNull(result)
    }

    @Test
    fun `should accept small decimal amounts`() {
        val result = currencyService.convertCurrency("USD", "EUR", 0.01)
        assertNotNull(result)
        assertEquals(0.01 * 0.85, result.first, 0.001)
    }

    // Currency code validation tests
    @Test
    fun `should throw exception for empty from currency code`() {
        val exception = assertThrows<IllegalArgumentException> {
            currencyService.convertCurrency("", "EUR", 100.0)
        }
        assertEquals("from currency code cannot be empty", exception.message)
    }

    @Test
    fun `should throw exception for empty to currency code`() {
        val exception = assertThrows<IllegalArgumentException> {
            currencyService.convertCurrency("USD", "", 100.0)
        }
        assertEquals("to currency code cannot be empty", exception.message)
    }

    @Test
    fun `should throw exception for blank from currency code`() {
        val exception = assertThrows<IllegalArgumentException> {
            currencyService.convertCurrency("   ", "EUR", 100.0)
        }
        assertEquals("from currency code cannot be empty", exception.message)
    }

    @Test
    fun `should throw exception for currency code with wrong length`() {
        val exception = assertThrows<IllegalArgumentException> {
            currencyService.convertCurrency("US", "EUR", 100.0)
        }
        assertEquals("from currency code must be exactly 3 characters", exception.message)
    }

    @Test
    fun `should throw exception for currency code too long`() {
        val exception = assertThrows<IllegalArgumentException> {
            currencyService.convertCurrency("USDD", "EUR", 100.0)
        }
        assertEquals("from currency code must be exactly 3 characters", exception.message)
    }

    @Test
    fun `should throw exception for lowercase currency code`() {
        val exception = assertThrows<IllegalArgumentException> {
            currencyService.convertCurrency("usd", "EUR", 100.0)
        }
        assertEquals("from currency code must contain only uppercase letters", exception.message)
    }

    @Test
    fun `should throw exception for mixed case currency code`() {
        val exception = assertThrows<IllegalArgumentException> {
            currencyService.convertCurrency("UsD", "EUR", 100.0)
        }
        assertEquals("from currency code must contain only uppercase letters", exception.message)
    }

    @Test
    fun `should throw exception for currency code with numbers`() {
        val exception = assertThrows<IllegalArgumentException> {
            currencyService.convertCurrency("US1", "EUR", 100.0)
        }
        assertEquals("from currency code must contain only uppercase letters", exception.message)
    }

    @Test
    fun `should throw exception for currency code with special characters`() {
        val exception = assertThrows<IllegalArgumentException> {
            currencyService.convertCurrency("US$", "EUR", 100.0)
        }
        assertEquals("from currency code must contain only uppercase letters", exception.message)
    }

    @Test
    fun `should accept valid currency codes and amounts`() {
        val result = currencyService.convertCurrency("USD", "EUR", 100.0)
        assertNotNull(result)
        assertEquals(85.0, result.first, 0.001)
        assertEquals(0.85, result.second, 0.001)
    }

    @Test
    fun `should validate both currency codes when to code is invalid`() {
        val exception = assertThrows<IllegalArgumentException> {
            currencyService.convertCurrency("USD", "eu", 100.0)
        }
        // The 'to' code validation should catch lowercase letters
        assertTrue(exception.message!!.contains("currency code must") || 
                   exception.message!!.contains("to currency"))
    }

    @Test
    fun `should handle very large valid amounts correctly`() {
        val largeAmount = 999_999_999_999.0
        val result = currencyService.convertCurrency("USD", "EUR", largeAmount)
        assertNotNull(result)
        assertEquals(largeAmount * 0.85, result.first, 1000.0) // Allow for larger delta
    }

    @Test
    fun `should handle very small valid amounts correctly`() {
        val smallAmount = 0.000001
        val result = currencyService.convertCurrency("USD", "EUR", smallAmount)
        assertNotNull(result)
        assertTrue(result.first > 0)
    }
}
