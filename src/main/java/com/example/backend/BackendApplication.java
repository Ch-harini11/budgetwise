package com.example.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {

        // Load .env
        Dotenv dotenv = Dotenv.configure()
                .directory("./")
                .ignoreIfMissing()
                .load();

        System.setProperty("MAIL_USER", dotenv.get("MAIL_USER"));
        System.setProperty("MAIL_PASS", dotenv.get("MAIL_PASS"));
        System.setProperty("MONGO_URI", dotenv.get("MONGO_URI"));

        SpringApplication.run(BackendApplication.class, args);
    }
}