# Architecture Documentation

This document outlines the architecture of the ClassifierComponent project, which follows Clean Architecture and Domain-Driven Design principles.

## Architectural Overview

The system is organized into layers following Clean Architecture principles:

1. **Domain Layer**: Core business logic and entities
2. **Application Layer**: Use cases and application services
3. **Infrastructure Layer**: External dependencies and implementations
4. **Interface Layer**: API endpoints and controllers

Each layer depends only on layers more central than itself, with the domain layer having no dependencies on other layers.

## Layer Responsibilities

### Domain Layer

The domain layer contains the core business logic, entities, and interfaces:

- **Entities**: Core business objects (Dossier, Document, Page)
- **Repositories**: Interfaces for data access
- **Value Objects**: Immutable objects with business meaning (StorageLocation)
- **Domain Services**: Core business operations (DossierService)
- **Exceptions**: Domain-specific errors

### Application Layer

The application layer orchestrates the domain layer to fulfill use cases:

- **Use Cases**: Each business operation (AddPages, DeletePage, etc.)
- **Application Services**: Facades for related use cases (DossierApplicationService)

### Infrastructure Layer

The infrastructure layer implements interfaces defined in the domain layer:

- **Repositories**: Implementations of domain repositories (FilesystemDossierRepository)
- **File Processing**: Logic for handling different file types
- **Config**: Application configuration
- **DI Container**: Dependency injection setup

### Interface Layer

The interface layer provides access to the application:

- **API Adapters**: HTTP API endpoints for client interaction
- **Request/Response Mapping**: Translation between API and domain models

## Key Components

### Entities

- **Dossier**: A collection of documents
- **Document**: A classified document containing pages
- **Page**: A single page within a document

### Repositories

- **DossierRepository**: Interface for dossier persistence
- **PageRepository**: Interface for page persistence
- **FilesystemDossierRepository**: File-based implementation
- **FilesystemPageRepository**: File-based implementation

### Services

- **DossierService**: Domain service for dossier operations
- **DossierApplicationService**: Application service for dossier operations

### File Processing

- **FileProcessor**: Base class for file processors
- **PdfProcessor**: Processor for PDF files
- **ImageProcessor**: Processor for image files
- **FileProcessorFactory**: Factory for creating processors based on file type

### Storage

- **StorageLocation**: Value object for document storage locations
- **DocumentPathDb**: SQLite database for path mappings

## Patterns Used

1. **Repository Pattern**: For data access abstraction
2. **Factory Pattern**: For creating file processors
3. **Strategy Pattern**: For different file processing strategies
4. **Dependency Injection**: For loose coupling and testability
5. **Domain Events**: For communication between components
6. **Value Objects**: For encapsulating business concepts

## Directory Structure

```
src/
├── application/          # Application layer
│   ├── services/         # Application services
│   └── usecases/         # Use cases
├── domain/               # Domain layer
│   ├── entities/         # Domain entities
│   ├── exceptions/       # Domain exceptions
│   ├── repositories/     # Repository interfaces
│   ├── services/         # Domain services
│   └── valueobjects/     # Value objects
├── infrastructure/       # Infrastructure layer
│   ├── config/           # Configuration
│   ├── di/               # Dependency injection
│   ├── file/             # File processing
│   │   └── processors/   # File processors
│   └── repositories/     # Repository implementations
├── interfaces/           # Interface layer
│   └── http/             # HTTP adapters
├── classifier/           # Legacy implementation (for backwards compatibility)
└── util/                 # Utility classes
```

## Flow Examples

### Adding Pages

1. Request received by `ClassifierApiAdapter`
2. `AddPagesUseCase` orchestrates the operation
3. `FileProcessorFactory` creates appropriate processors for files
4. Processors convert files to `Page` entities
5. `DossierRepository` persists the updated dossier
6. Index files are updated for the new structure

### Getting Documents

1. Request received by `ClassifierApiAdapter`
2. `GetDocumentsUseCase` retrieves the dossier
3. Document information is mapped to response format
4. Response is sent back to client

## Migration Strategy

The system supports both old and new storage structures:

1. **Legacy Structure**: `/dossier/{uuid}`
2. **New Structure**: `/dossier/{year}/{month}/{day}/{uuid}`

When accessing documents:
1. First check if document exists in old structure
2. If not, look up path in SQLite database
3. Use path information to locate document

When creating new documents:
1. Always use new hierarchical structure
2. Store mapping in SQLite database
3. Maintain backward compatibility with existing code

This approach allows for a gradual migration with full backward compatibility.