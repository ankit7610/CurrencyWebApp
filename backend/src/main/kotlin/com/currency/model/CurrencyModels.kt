package com.currency.model

data class CurrencyRatesResponse(
    val data: Map<String, Double>
)

data class ConversionRequest(
    val from: String,
    val to: String,
    val amount: Double
)

data class ConversionResponse(
    val from: String,
    val to: String,
    val amount: Double,
    val convertedAmount: Double,
    val rate: Double
)

data class CurrenciesResponse(
    val currencies: Map<String, Double>
)
