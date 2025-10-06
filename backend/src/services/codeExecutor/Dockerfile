
# src/services/codeExecutor/Dockerfile
# Multi-language code execution environment

FROM ubuntu:22.04

# Prevent timezone prompts
ENV DEBIAN_FRONTEND=noninteractive

# Update and install compilers/interpreters
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    gcc \
    g++ \
    openjdk-17-jdk \
    mono-mcs \
    mono-runtime \
    nodejs \
    npm \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Create execution directory
WORKDIR /execution

# Set resource limits
RUN ulimit -v 512000  # 512MB memory limit
RUN ulimit -t 10      # 10 second CPU time limit

# Create non-root user for execution
RUN useradd -m -u 1001 coderunner && \
    chown -R coderunner:coderunner /execution

USER coderunner

CMD ["/bin/bash"]

