## ---- Build stage ----
FROM mcr.microsoft.com/openjdk/jdk:21-ubuntu AS build
WORKDIR /workspace

# Copy Gradle wrapper and build scripts first for better layer caching
COPY java/socialapp/gradlew java/socialapp/settings.gradle java/socialapp/build.gradle ./java/socialapp/
COPY java/socialapp/gradle ./java/socialapp/gradle

WORKDIR /workspace/java/socialapp
RUN chmod +x gradlew \
    && ./gradlew --no-daemon dependencies > /dev/null 2>&1 || true

# Copy source
COPY java/socialapp/src ./src

# Build the application (skip tests for faster image build; adjust as needed)
RUN ./gradlew --no-daemon clean bootJar -x test

## ---- Runtime base (JRE) stage ----
FROM mcr.microsoft.com/openjdk/jdk:21-ubuntu AS jre-build
RUN apt-get update && apt-get install -y --no-install-recommends binutils && rm -rf /var/lib/apt/lists/*

# Create a slim JRE using jlink
RUN $JAVA_HOME/bin/jlink \
    --add-modules ALL-MODULE-PATH \
    --strip-debug \
    --no-man-pages \
    --no-header-files \
    --compress=2 \
    --output /custom-jre

## ---- Final runtime image ----
FROM ubuntu:24.04
ENV LANG=C.UTF-8 LC_ALL=C.UTF-8
ENV JAVA_HOME=/opt/java \
    PATH="/opt/java/bin:${PATH}" \
    APP_USER=appuser

# Add environment variable passthrough placeholders (Codespaces runtime will inject actual values)
ENV CODESPACE_NAME="" \
    GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN=""

# Install minimal dependencies (ca-certificates for HTTPS)
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates tzdata curl && rm -rf /var/lib/apt/lists/* \
    && groupadd -r ${APP_USER} && useradd -r -g ${APP_USER} ${APP_USER}

# Copy slim JRE
COPY --from=jre-build /custom-jre ${JAVA_HOME}

WORKDIR /app

# Ensure app directory writable by app user (needed for SQLite journal files)
RUN chown -R ${APP_USER}:${APP_USER} /app

# Copy built jar
COPY --from=build /workspace/java/socialapp/build/libs/*.jar app.jar

# Create SQLite database file (empty) at runtime image build time
RUN touch /app/sns_api.db && chown ${APP_USER}:${APP_USER} /app/sns_api.db

EXPOSE 8080
USER ${APP_USER}

ENTRYPOINT ["/opt/java/bin/java","-Djava.security.egd=file:/dev/./urandom","-jar","/app/app.jar"]
