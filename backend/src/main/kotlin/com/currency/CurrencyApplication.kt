package com.currency

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.cache.annotation.EnableCaching

@EnableCaching
@SpringBootApplication
class CurrencyApplication

fun main(args: Array<String>) {
    runApplication<CurrencyApplication>(*args)
}
