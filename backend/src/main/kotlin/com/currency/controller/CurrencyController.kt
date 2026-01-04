package com.currency.controller

import com.currency.model.ConversionRequest
import com.currency.model.ConversionResponse
import com.currency.model.CurrenciesResponse
import com.currency.service.CurrencyService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = ["http://localhost:5173"])
class CurrencyController(private val currencyService: CurrencyService) {
    
    @GetMapping("/currencies")
    fun getCurrencies(): CurrenciesResponse {
        val rates = currencyService.fetchCurrencyRates()
        return CurrenciesResponse(currencies = rates)
    }
    
    @PostMapping("/convert")
    fun convertCurrency(@RequestBody request: ConversionRequest): ConversionResponse {
        // Validate request
        if (request.from.isBlank()) {
            throw IllegalArgumentException("Source currency is required")
        }
        if (request.to.isBlank()) {
            throw IllegalArgumentException("Target currency is required")
        }
        
        val (convertedAmount, rate) = currencyService.convertCurrency(
            request.from.uppercase(),
            request.to.uppercase(),
            request.amount
        )
        
        return ConversionResponse(
            from = request.from.uppercase(),
            to = request.to.uppercase(),
            amount = request.amount,
            convertedAmount = convertedAmount,
            rate = rate
        )
    }
}
