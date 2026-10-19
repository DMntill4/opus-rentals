package com.opusrentals;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = "com.opusrentals")
@EnableJpaRepositories(basePackages = "com.opusrentals")
public class OpusRentalsApplication extends SpringBootServletInitializer {

    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(OpusRentalsApplication.class);
    }

    public static void main(String[] args) {
        SpringApplication.run(OpusRentalsApplication.class, args);
    }
}
