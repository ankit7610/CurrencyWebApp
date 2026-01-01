package com.currency

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class CurrencyApplication

fun main(args: Array<String>) {
    runApplication<CurrencyApplication>(*args)
}
