# Java Copilot Instructions

## Project Setup
- Use Java 17+ LTS for new projects (Java 21 LTS recommended)
- Use Maven or Gradle for dependency management and build automation
- Follow Maven Standard Directory Layout or Gradle conventions
- Use Spring Boot for web applications and microservices
- Implement proper logging with SLF4J and Logback
- Use profiles for environment-specific configurations

## Coding Style Guidelines
- Follow Oracle Java Code Conventions and Google Java Style Guide
- Use PascalCase for class names, camelCase for methods and variables
- Use UPPER_SNAKE_CASE for constants
- Organize imports and remove unused imports
- Use meaningful package names (reverse domain naming)
- Limit line length to 120 characters
- Use proper indentation (4 spaces, no tabs)
- Add comprehensive Javadoc for public APIs

## Code Organization
- src/main/java/ - Main source code
- src/main/resources/ - Configuration files and resources
- src/test/java/ - Unit and integration tests
- src/test/resources/ - Test resources and configurations
- target/ (Maven) or build/ (Gradle) - Build artifacts
- docs/ - Project documentation
- scripts/ - Build and deployment scripts

## Best Practices
- Use dependency injection (Spring or CDI)
- Implement proper exception handling with custom exceptions
- Use Optional for null safety
- Implement equals(), hashCode(), and toString() methods properly
- Use streams and lambdas for functional programming
- Implement proper validation with Bean Validation (JSR 303)
- Use design patterns appropriately (Singleton, Factory, Observer, etc.)
- Follow SOLID principles and clean code practices

## Testing
- Use JUnit 5 for unit testing
- Use Mockito for mocking dependencies
- Implement integration tests with @SpringBootTest
- Use TestContainers for database integration tests
- Follow AAA pattern (Arrange, Act, Assert)
- Aim for high test coverage but focus on meaningful tests
- Use parameterized tests for multiple test scenarios

## Security
- Use Spring Security for authentication and authorization
- Validate all inputs and sanitize outputs
- Use HTTPS for all communications
- Implement proper CORS configuration
- Use JWT tokens for stateless authentication
- Follow OWASP security guidelines