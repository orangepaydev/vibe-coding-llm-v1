# Go Copilot Instructions

## Project Setup
- Use Go version 1.21+ for latest features and security patches
- Initialize projects with `go mod init module-name`
- Follow Go module best practices for dependency management
- Use semantic versioning for releases
- Implement proper error handling with wrapped errors
- Use context.Context for cancellation and timeouts

## Coding Style Guidelines
- Follow Go's official style guidelines (gofmt, golint, go vet)
- Use camelCase for exported functions and PascalCase for types
- Use short, descriptive variable names (i, j for loops; err for errors)
- Organize code in packages with clear, single responsibilities
- Write self-documenting code with meaningful function and variable names
- Add godoc comments for all exported functions, types, and constants
- Use receiver names that are short and consistent (usually 1-2 letters)

## Code Organization
- cmd/ - Main applications and entry points
- internal/ - Private application and library code
- pkg/ - Library code that can be used by external applications
- api/ - OpenAPI/Swagger specs, JSON schema files, protocol definition files
- web/ - Web application specific components
- configs/ - Configuration file templates or default configs
- scripts/ - Scripts for build, install, analysis, etc.
- docs/ - Design and user documents
- examples/ - Examples for your applications and/or public libraries

## Best Practices
- Use interfaces for dependency injection and testing
- Implement proper logging with structured logging (slog package)
- Use channels and goroutines appropriately for concurrency
- Implement graceful shutdown for services
- Use context for request-scoped values and cancellation
- Write comprehensive unit tests with table-driven tests
- Use build tags for platform-specific code
- Implement proper validation for input data

## Testing
- Use testing package for unit tests
- Follow table-driven test patterns
- Use testify/assert for better test assertions
- Implement integration tests in separate files (*_integration_test.go)
- Use httptest for HTTP handler testing
- Mock external dependencies using interfaces