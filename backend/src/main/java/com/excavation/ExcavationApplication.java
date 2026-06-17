package com.excavation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableJpaAuditing
@EnableAsync
public class ExcavationApplication {

    public static void main(String[] args) {
        SpringApplication.run(ExcavationApplication.class, args);
        System.out.println("============================================================");
        System.out.println("  考古发掘现场记录系统 - 后端服务启动成功！");
        System.out.println("  API地址: http://localhost:8080/api");
        System.out.println("  日志级别: DEBUG (已开启)");
        System.out.println("============================================================");
    }
}
