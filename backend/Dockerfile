# =============================================================================
# STAGE 1: BUILD (Maven + OpenJDK 21)
# =============================================================================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy sources and package
COPY src ./src
RUN mvn clean package -DskipTests

# =============================================================================
# STAGE 2: RUNTIME (Lightweight JRE 21)
# =============================================================================
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Run as non-privileged spring user
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy built artifact
COPY --from=builder /app/target/*.war app.war

EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.war"]
