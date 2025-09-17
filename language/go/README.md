# Go Projects

This directory contains Go programming language projects including web services, CLI tools, and libraries.

## Prerequisites

- Go 1.21+ installed
- Git for version control
- A code editor with Go support (VS Code, GoLand, Vim with go plugin)

## Setup Instructions

1. **Install Go**
   ```bash
   # macOS
   brew install go
   
   # Ubuntu/Debian
   sudo apt update && sudo apt install golang-go
   
   # Windows (using installer)
   # Download from: https://golang.org/dl/
   ```

2. **Verify Installation**
   ```bash
   go version
   ```

3. **Set Go Environment (if needed)**
   ```bash
   export GOPATH=$HOME/go
   export PATH=$PATH:$GOPATH/bin
   ```

4. **Initialize a New Go Module**
   ```bash
   mkdir my-go-project
   cd my-go-project
   go mod init github.com/username/my-go-project
   ```

5. **Create a Basic Main File**
   ```go
   package main

   import "fmt"

   func main() {
       fmt.Println("Hello, World!")
   }
   ```

6. **Run the Program**
   ```bash
   go run main.go
   ```

## Project Structure

```
go-project/
├── cmd/                  # Main applications
│   └── myapp/
│       └── main.go
├── internal/             # Private application code
│   ├── handlers/
│   ├── models/
│   └── services/
├── pkg/                  # Public library code
├── api/                  # API definitions
├── web/                  # Web assets
├── configs/              # Configuration files
├── scripts/              # Build and deployment scripts
├── docs/                 # Documentation
├── examples/             # Usage examples
├── go.mod               # Go module file
├── go.sum               # Go module checksums
├── Makefile             # Build automation
└── README.md            # Project documentation
```

## Essential Commands

```bash
# Module management
go mod init <module-name>    # Initialize new module
go mod tidy                  # Add missing and remove unused modules
go mod download              # Download modules to local cache
go mod vendor                # Make vendored copy of dependencies

# Building and running
go build                     # Compile packages and dependencies
go run main.go              # Compile and run Go program
go install                  # Compile and install packages and dependencies

# Testing
go test                     # Test packages
go test -v                  # Verbose test output
go test -cover              # Test with coverage
go test -race               # Test with race detection
go test ./...               # Test all packages

# Code quality
go fmt                      # Format Go source code
go vet                      # Report likely mistakes in packages
go clean                    # Remove object files and cached files

# Getting packages
go get <package>            # Add dependency to current module
go get -u <package>         # Update dependency to latest version
```

## Best Practices

- Follow Go's naming conventions (camelCase, PascalCase)
- Use `gofmt` to format your code consistently
- Write comprehensive tests with good coverage
- Use interfaces for better testability and flexibility
- Handle errors explicitly and appropriately
- Use context.Context for cancellation and timeouts
- Implement graceful shutdown for long-running services
- Use structured logging (slog package)
- Follow the principle of least surprise
- Keep functions and methods focused and small

## Recommended Libraries

- **Web Frameworks**: Gin, Echo, Fiber, Chi
- **Database**: GORM, Squirrel, sqlx
- **Testing**: Testify, GoMock, Ginkgo
- **Logging**: Logrus, Zap, slog
- **Configuration**: Viper, Cobra
- **HTTP Client**: Resty, Go standard library
- **Validation**: Validator, Ozzo-validation
- **CLI**: Cobra, Urfave/cli

## Code Quality Tools

```bash
# Install useful tools
go install golang.org/x/tools/cmd/goimports@latest
go install golang.org/x/lint/golint@latest
go install honnef.co/go/tools/cmd/staticcheck@latest
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest

# Run quality checks
goimports -w .              # Format imports
golint ./...                # Lint code
staticcheck ./...           # Static analysis
golangci-lint run          # Comprehensive linting
```

## Environment Variables

```bash
export GOOS=linux          # Target operating system
export GOARCH=amd64        # Target architecture
export CGO_ENABLED=0       # Disable CGO for static binaries
export GO111MODULE=on      # Enable Go modules (default in Go 1.16+)
```

## Resources

- [Go Documentation](https://golang.org/doc/)
- [Effective Go](https://golang.org/doc/effective_go.html)
- [Go by Example](https://gobyexample.com/)
- [Go Standard Library](https://pkg.go.dev/std)
- [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments)