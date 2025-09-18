# Java Projects

This directory contains Java programming language projects including web applications, microservices, and enterprise applications.

## Prerequisites

- Java 17+ (Java 21 LTS recommended)
- Maven 3.8+ or Gradle 7+
- IDE with Java support (IntelliJ IDEA, Eclipse, VS Code)
- Git for version control

## Setup Instructions

1. **Install Java JDK**
   ```bash
   # macOS (using SDKMAN)
   curl -s "https://get.sdkman.io" | bash
   sdk install java 21.0.1-oracle
   
   # Ubuntu/Debian
   sudo apt update && sudo apt install openjdk-21-jdk
   
   # Windows
   # Download from: https://www.oracle.com/java/technologies/downloads/
   ```

2. **Install Build Tool**
   ```bash
   # Maven
   # macOS
   brew install maven
   
   # Ubuntu/Debian
   sudo apt install maven
   
   # Gradle
   # macOS
   brew install gradle
   
   # Ubuntu/Debian
   sudo apt install gradle
   ```

3. **Verify Installation**
   ```bash
   java --version
   javac --version
   mvn --version  # or gradle --version
   ```

4. **Create New Project**

   **Using Maven:**
   ```bash
   mvn archetype:generate -DgroupId=com.example -DartifactId=my-app -DarchetypeArtifactId=maven-archetype-quickstart -DinteractiveMode=false
   ```

   **Using Spring Boot (Maven):**
   ```bash
   curl https://start.spring.io/starter.zip -d dependencies=web,jpa,h2 -d name=my-app -o my-app.zip
   unzip my-app.zip
   ```

   **Using Gradle:**
   ```bash
   gradle init --type java-application
   ```

## Project Structure

### Maven Project Structure
```
java-project/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/app/
│   │   │       ├── Application.java
│   │   │       ├── controller/
│   │   │       ├── service/
│   │   │       ├── repository/
│   │   │       └── model/
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── static/
│   │       └── templates/
│   └── test/
│       ├── java/
│       └── resources/
├── target/              # Build output
├── pom.xml             # Maven configuration
└── README.md
```

### Gradle Project Structure
```
java-project/
├── src/
│   ├── main/
│   └── test/
├── build/              # Build output
├── gradle/
├── gradlew
├── gradlew.bat
├── build.gradle
├── settings.gradle
└── README.md
```

## Essential Commands

### Maven Commands
```bash
# Clean and compile
mvn clean compile

# Run tests
mvn test

# Package application
mvn package

# Install to local repository
mvn install

# Run Spring Boot application
mvn spring-boot:run

# Generate project from archetype
mvn archetype:generate

# Dependency analysis
mvn dependency:tree
```

### Gradle Commands
```bash
# Clean and build
gradle clean build

# Run tests
gradle test

# Run application
gradle run

# Generate wrapper
gradle wrapper

# List dependencies
gradle dependencies

# Continuous build
gradle build --continuous
```

## Best Practices

- Follow Java naming conventions consistently
- Use meaningful package names with reverse domain notation
- Implement proper exception handling and logging
- Use dependency injection for better testability
- Write comprehensive unit and integration tests
- Use static analysis tools (SonarQube, SpotBugs, PMD)
- Implement proper configuration management
- Use profiles for different environments
- Follow SOLID principles and design patterns
- Document public APIs with Javadoc

## Recommended Libraries

- **Web Framework**: Spring Boot, Spring MVC
- **Database**: Spring Data JPA, Hibernate, MyBatis
- **Testing**: JUnit 5, Mockito, TestContainers, AssertJ
- **JSON**: Jackson, Gson
- **HTTP Client**: OkHttp, Apache HttpClient, WebClient
- **Validation**: Bean Validation (Hibernate Validator)
- **Logging**: SLF4J, Logback, Log4j2
- **Utilities**: Apache Commons, Google Guava
- **Security**: Spring Security, JJWT

## Code Quality Tools

```bash
# SpotBugs (Maven)
mvn spotbugs:check

# PMD (Maven)
mvn pmd:check

# Checkstyle (Maven)
mvn checkstyle:check

# JaCoCo coverage (Maven)
mvn jacoco:report

# SonarQube analysis
mvn sonar:sonar
```

## Spring Boot Specific

```bash
# Create Spring Boot project
curl https://start.spring.io/starter.zip \
  -d dependencies=web,jpa,h2,actuator \
  -d name=my-app \
  -d packageName=com.example.myapp \
  -o my-app.zip

# Run with different profiles
java -jar app.jar --spring.profiles.active=prod

# Health check
curl http://localhost:8080/actuator/health
```

## Environment Variables

```bash
export JAVA_HOME=/path/to/jdk
export MAVEN_HOME=/path/to/maven
export GRADLE_HOME=/path/to/gradle
export PATH=$JAVA_HOME/bin:$MAVEN_HOME/bin:$GRADLE_HOME/bin:$PATH
```

## Docker Support

```dockerfile
FROM openjdk:21-jre-slim
COPY target/app.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

## Resources

- [Oracle Java Documentation](https://docs.oracle.com/en/java/)
- [Spring Framework Documentation](https://spring.io/docs)
- [Maven Documentation](https://maven.apache.org/guides/)
- [Gradle Documentation](https://docs.gradle.org/)
- [Java Code Conventions](https://www.oracle.com/java/technologies/javase/codeconventions-contents.html)