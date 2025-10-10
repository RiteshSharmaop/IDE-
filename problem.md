<!--

## Problem: when i'm running the docker-compose.executor.yml then
yeh image create kr rha hai and container bhi create kr rha but container run nahi ho tha jab bhi run kr rha hun container processing pr chale ja rha hai container restart ho ja rha automatically

docker-compose-executor.ylm mein ubuntu image run kr rha hun jo-> ubuntu mein file creation and code run krne ko help kr rha hai

normal docker compose mein emr backend server and redis kafka and mongodb run kr rha hai
but locally jab mein testing kr rha hun docker compose-executor-y.l and

 -->

- # Start services with Docker
- - docker-compose up -d

- # Start code executor container
- - docker-compose -f docker-compose.executor.yml up -d

# docker-compose.yml

version: "3.8"

services:
mongodb:
image: mongo:latest
container_name: code-ide-mongo
ports: - "27017:27017"
volumes: - mongodb_data:/data/db
environment:
MONGO_INITDB_DATABASE: code-ide

redis:
image: redis:alpine
container_name: code-ide-redis
ports: - "6379:6379"
volumes: - redis_data:/data

app:
build: .
container_name: code-ide-backend
ports: # - "5000:5000" - "8080:8080"
depends_on: - mongodb - redis
environment: - MONGODB_URI=mongodb+srv://ritesh:ritesh9122@ide.wco15ph.mongodb.net/ - REDIS_HOST=redis - REDIS_PORT=6379 # volumes: # - .:/app # - /app/node_modules # command: npm run dev
volumes: - ./src:/usr/src/app/src # <-- host src folder mounted into container - /usr/src/app/node_modules # avoid overwriting node_modules
command: npm run dev # run dev with nodemon
volumes:
mongodb_data:
redis_data:

# dockerFile

FROM node:18-alpine

WORKDIR /app

COPY package\*.json ./
RUN npm install
RUN npm install -g nodemon

COPY . .

EXPOSE 8080
CMD ["npm", "run", "dev"]

- this is my

# docker-compose.executor.yml

version: '3.8'

services:
code-executor:
build:
context: ./src/services/codeExecutor
dockerfile: Dockerfile
container_name: code-executor
security_opt: - no-new-privileges:true
cap_drop: - ALL
read_only: true
tmpfs: - /tmp - /execution
mem_limit: 512m
cpus: 0.5
pids_limit: 50
network_mode: none
restart: unless-stopped

# src/services/codeExecutor/Dockerfile

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
 && rm -rf /var/lib/apt/lists/\*

# Create execution directory

WORKDIR /execution

# Set resource limits

RUN ulimit -v 512000 # 512MB memory limit
RUN ulimit -t 10 # 10 second CPU time limit

# Create non-root user for execution

RUN useradd -m -u 1001 coderunner && \
 chown -R coderunner:coderunner /execution

USER coderunner

CMD ["/bin/bash"]

<!-- dockerExefutor.js : to run code -->

const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

class DockerExecutor {
constructor() {
this.containerName = 'code-executor';
this.timeout = 10000;
}

async executeInDocker(code, language, input = '') {
const tempFile = `/tmp/code_${Date.now()}`;
const commands = this.getCommands(language, tempFile);

    try {
      // Write code to temp file in container
      await execPromise(
        `docker exec ${this.containerName} bash -c "echo '${code.replace(/'/g, "'\\''")}' > ${tempFile}${commands.extension}"`
      );

      // Compile if needed
      if (commands.compile) {
        const compileCmd = `docker exec ${this.containerName} bash -c "${commands.compile}"`;
        await execPromise(compileCmd, { timeout: this.timeout / 2 });
      }

      // Execute
      const executeCmd = `docker exec ${this.containerName} bash -c "echo '${input}' | ${commands.execute}"`;
      const { stdout, stderr } = await execPromise(executeCmd, {
        timeout: this.timeout,
        maxBuffer: 1024 * 1024
      });

      // Cleanup
      await execPromise(
        `docker exec ${this.containerName} bash -c "rm -f ${tempFile}* || true"`
      );

      return {
        success: !stderr || stderr.trim() === '',
        output: stdout,
        error: stderr
      };

    } catch (error) {
      // Cleanup on error
      try {
        await execPromise(
          `docker exec ${this.containerName} bash -c "rm -f ${tempFile}* || true"`
        );
      } catch {}

      return {
        success: false,
        output: error.stdout || '',
        error: error.stderr || error.message
      };
    }

}

getCommands(language, tempFile) {
const commands = {
javascript: {
extension: '.js',
execute: `node ${tempFile}.js`
},
python: {
extension: '.py',
execute: `python3 ${tempFile}.py`
},
cpp: {
extension: '.cpp',
compile: `g++ ${tempFile}.cpp -o ${tempFile}.out`,
execute: `${tempFile}.out`
},
c: {
extension: '.c',
compile: `gcc ${tempFile}.c -o ${tempFile}.out`,
execute: `${tempFile}.out`
},
java: {
extension: '.java',
compile: `javac ${tempFile}.java`,
execute: `java -cp /tmp Main`
},
csharp: {
extension: '.cs',
compile: `mcs ${tempFile}.cs -out:${tempFile}.exe`,
execute: `mono ${tempFile}.exe`
}
};

    return commands[language] || commands.javascript;

}

async checkContainer() {
try {
const { stdout } = await execPromise(
`docker ps --filter name=${this.containerName} --format "{{.Names}}"`
);
return stdout.trim() === this.containerName;
} catch {
return false;
}
}

async startContainer() {
console.log("Ensuring Docker container is running...");

    const isRunning = await this.checkContainer();
    if (!isRunning) {
      await execPromise('docker-compose -f docker-compose.executor.yml up -d');
      // Wait for container to be ready
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    console.log("Docker container is running.");

}
}

module.exports = new DockerExecutor();
