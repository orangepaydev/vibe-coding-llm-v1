# Kotlin Copilot Instructions

## Project Setup
- Use Kotlin 1.9+ for latest features and performance improvements
- Use Gradle with Kotlin DSL for build configuration
- Use Spring Boot for web applications and microservices
- Implement coroutines for asynchronous programming
- Use KotlinX Serialization for JSON handling
- Follow Kotlin coding conventions and idioms

## Coding Style Guidelines
- Follow Kotlin Coding Conventions (kotlinlang.org/docs/coding-conventions.html)
- Use PascalCase for class names, camelCase for functions and properties
- Use UPPER_SNAKE_CASE for constants and enum values
- Prefer expressions over statements when possible
- Use trailing commas in multi-line declarations
- Limit line length to 120 characters
- Use meaningful names and avoid abbreviations
- Prefer immutable data structures (val over var, List over MutableList)

## Code Organization
- src/main/kotlin/ - Main source code
- src/main/resources/ - Configuration files and resources
- src/test/kotlin/ - Unit and integration tests
- src/test/resources/ - Test resources and configurations
- build/ - Gradle build artifacts
- gradle/ - Gradle wrapper and configuration
- docs/ - Project documentation

## Best Practices
- Use data classes for DTOs and simple data containers
- Leverage null safety features (nullable types, safe calls)
- Use extension functions to add functionality to existing classes
- Implement sealed classes for restricted hierarchies
- Use object declarations for singletons
- Prefer higher-order functions and lambdas over anonymous classes
- Use coroutines for asynchronous and concurrent programming
- Follow functional programming principles when appropriate

## Coroutines and Concurrency
- Use suspend functions for asynchronous operations
- Implement proper coroutine scope management
- Use structured concurrency principles
- Handle exceptions in coroutines properly
- Use Flow for reactive streams
- Implement proper cancellation handling
- Use appropriate dispatchers for different workloads

## Testing
- Use JUnit 5 with Kotlin test extensions
- Use MockK for mocking (Kotlin-friendly alternative to Mockito)
- Write tests using Kotlin's expressive syntax
- Use kotest for behavior-driven testing
- Implement property-based testing with kotlintest
- Use TestContainers for integration testing
- Follow given-when-then structure in tests

## Android Development (if applicable)
- Use Android Architecture Components (ViewModel, LiveData, Room)
- Implement MVVM or MVI architecture patterns
- Use Android KTX extensions for concise code
- Implement proper lifecycle management
- Use data binding or view binding
- Follow Material Design guidelines