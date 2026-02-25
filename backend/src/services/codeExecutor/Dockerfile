FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    python3 \
    openjdk-17-jdk \
    mono-mcs \
    mono-runtime \
    curl \
    bash \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /execution


RUN useradd -m -u 1001 coderunner && \
    chown -R coderunner:coderunner /execution

USER coderunner

CMD ["tail", "-f", "/dev/null"]
