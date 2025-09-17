# Kotlin Projects

This directory contains Kotlin programming language projects including web applications, Android apps, and multiplatform projects.

## Prerequisites

- JDK 11+ (JDK 17+ recommended)
- Gradle 7+ or Maven 3.8+
- IntelliJ IDEA (recommended) or Android Studio
- Git for version control

## Setup Instructions

1. **Install JDK**
   ```bash
   # macOS (using SDKMAN)
   curl -s "https://get.sdkman.io" | bash
   sdk install java 17.0.1-oracle
   
   # Ubuntu/Debian
   sudo apt update && sudo apt install openjdk-17-jdk
   ```

2. **Install Gradle**
   ```bash
   # macOS
   brew install gradle
   
   # Ubuntu/Debian
   sudo apt install gradle
   
   # Or use Gradle Wrapper (recommended)
   ```

3. **Verify Installation**
   ```bash
   java --version
   gradle --version
   ```

4. **Create New Kotlin Project**

   **Using Gradle:**
   ```bash
   mkdir my-kotlin-app
   cd my-kotlin-app
   gradle init --type kotlin-application
   ```

   **Using Spring Boot Initializer:**
   ```bash
   curl https://start.spring.io/starter.zip \
     -d language=kotlin \
     -d dependencies=web,jpa,h2 \
     -d name=my-app \
     -o my-app.zip
   unzip my-app.zip
   ```

## Project Structure

### Gradle Kotlin Project
```
kotlin-project/
├── src/
│   ├── main/
│   │   ├── kotlin/
│   │   │   └── com/example/
│   │   │       ├── Application.kt
│   │   │       ├── controller/
│   │   │       ├── service/
│   │   │       ├── repository/
│   │   │       └── model/
│   │   └── resources/
│   │       ├── application.yml
│   │       └── static/
│   └── test/
│       ├── kotlin/
│       └── resources/
├── build/              # Build output
├── gradle/
├── gradlew
├── gradlew.bat
├── build.gradle.kts    # Kotlin DSL build script
├── settings.gradle.kts
└── README.md
```

## Essential Commands

### Gradle Commands
```bash
# Clean and build
./gradlew clean build

# Run application
./gradlew run

# Run tests
./gradlew test

# Continuous build
./gradlew build --continuous

# Run with specific profile
./gradlew bootRun --args='--spring.profiles.active=dev'

# Generate project report
./gradlew dependencyInsight --dependency kotlin-stdlib
```

### Kotlin Compiler Commands
```bash
# Compile Kotlin file
kotlinc hello.kt -include-runtime -d hello.jar

# Run compiled Kotlin
java -jar hello.jar

# Compile to JavaScript
kotlinc-js hello.kt -output hello.js
```

## Best Practices

- Use immutable data structures by default (val, List vs MutableList)
- Leverage Kotlin's null safety features
- Use data classes for simple data containers
- Implement extension functions for clean, readable code
- Use sealed classes for restricted class hierarchies
- Write expressive code using Kotlin idioms
- Use coroutines for asynchronous programming
- Follow functional programming principles when appropriate
- Use meaningful variable and function names
- Keep functions focused and small

## Recommended Libraries

- **Web Framework**: Spring Boot, Ktor
- **Serialization**: KotlinX Serialization, Jackson Kotlin Module
- **Database**: Exposed, Spring Data JPA
- **Testing**: JUnit 5, MockK, Kotest, Strikt
- **Coroutines**: KotlinX Coroutines
- **HTTP Client**: Ktor Client, OkHttp
- **Validation**: Konform, Spring Boot Validation
- **Logging**: Kotlin Logging, SLF4J
- **DI**: Koin, Kodein

## Gradle Kotlin DSL Example

```kotlin
// build.gradle.kts
plugins {
    kotlin("jvm") version "1.9.21"
    kotlin("plugin.spring") version "1.9.21"
    id("org.springframework.boot") version "3.2.0"
    id("io.spring.dependency-management") version "1.1.4"
}

group = "com.example"
version = "0.0.1-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("io.mockk:mockk:1.13.8")
}

tasks.withType<Test> {
    useJUnitPlatform()
}
```

## Coroutines Example

```kotlin
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

class UserService {
    suspend fun getUser(id: Long): User {
        delay(100) // Simulate network call
        return User(id, "User $id")
    }
    
    fun getAllUsers(): Flow<User> = flow {
        for (i in 1..10) {
            emit(getUser(i.toLong()))
        }
    }
}

// Usage
runBlocking {
    val userService = UserService()
    
    // Collect users
    userService.getAllUsers()
        .collect { user ->
            println("Received: $user")
        }
}
```

## Testing Example

```kotlin
import io.mockk.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import strikt.api.expectThat
import strikt.assertions.*

class UserServiceTest {
    
    private val userRepository = mockk<UserRepository>()
    private val userService = UserService(userRepository)
    
    @Test
    fun `should return user when found`() {
        // Given
        val userId = 1L
        val expectedUser = User(userId, "John Doe")
        every { userRepository.findById(userId) } returns expectedUser
        
        // When
        val result = userService.getUser(userId)
        
        // Then
        expectThat(result).isEqualTo(expectedUser)
        verify { userRepository.findById(userId) }
    }
}
```

## Code Quality Tools

```bash
# Detekt (static analysis)
./gradlew detekt

# ktlint (formatting)
./gradlew ktlintCheck
./gradlew ktlintFormat

# Kotlin compiler warnings as errors
kotlinOptions {
    allWarningsAsErrors = true
}
```

## Resources

- [Kotlin Documentation](https://kotlinlang.org/docs/)
- [Kotlin Coding Conventions](https://kotlinlang.org/docs/coding-conventions.html)
- [KotlinX Coroutines Guide](https://kotlinlang.org/docs/coroutines-guide.html)
- [Spring Boot with Kotlin](https://spring.io/guides/tutorials/spring-boot-kotlin/)
- [Kotlin for Android](https://developer.android.com/kotlin)