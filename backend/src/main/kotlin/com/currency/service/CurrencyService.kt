package com.currency.service

import com.currency.model.CurrencyRatesResponse
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Service
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse

@Service
class CurrencyService {
    
    private val apiKey = "fca_live_KU4DdbDYqhXRYyeZaqL8iHknt8RVF708jmrvZdbK"
    private val apiUrl = "https://api.freecurrencyapi.com/v1/latest"
    private val httpClient = HttpClient.newHttpClient()
    private val objectMapper = jacksonObjectMapper()
    
    @Cacheable("currencyRates")
    fun fetchCurrencyRates(): Map<String, Double> {
        val request = HttpRequest.newBuilder()
            .uri(URI.create("$apiUrl?apikey=$apiKey"))
            .GET()
            .build()
        
        val response = httpClient.send(request, HttpResponse.BodyHandlers.ofString())
        
        if (response.statusCode() == 200) {
            val ratesResponse = objectMapper.readValue(response.body(), CurrencyRatesResponse::class.java)
            return ratesResponse.data
        } else {
            throw RuntimeException("Failed to fetch currency rates: ${response.statusCode()}")
        }
    }
    
    fun convertCurrency(from: String, to: String, amount: Double): Pair<Double, Double> {
        val rates = fetchCurrencyRates()
        
        val fromRate = rates[from] ?: throw IllegalArgumentException("Currency $from not found")
        val toRate = rates[to] ?: throw IllegalArgumentException("Currency $to not found")
        
        // Convert to USD first (base currency), then to target currency
        val amountInUSD = amount / fromRate
        val convertedAmount = amountInUSD * toRate
        val rate = toRate / fromRate
        
        return Pair(convertedAmount, rate)
    }
}
