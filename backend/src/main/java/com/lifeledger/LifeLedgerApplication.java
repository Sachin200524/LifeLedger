package com.lifeledger;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class LifeLedgerApplication {

    public static void main(String[] args) {
        SpringApplication.run(LifeLedgerApplication.class, args);
    }
}
