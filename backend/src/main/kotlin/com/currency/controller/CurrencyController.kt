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
        val (convertedAmount, rate) = currencyService.convertCurrency(
            request.from,
            request.to,
            request.amount
        )
        
        return ConversionResponse(
            from = request.from,
            to = request.to,
            amount = request.amount,
            convertedAmount = convertedAmount,
            rate = rate
        )
    }
}
