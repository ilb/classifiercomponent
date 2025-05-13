# Migration Plan

This document outlines the migration plan from the original architecture to the new Clean Architecture design. The migration is designed to be gradual and maintain backward compatibility throughout the process.

## Phase 1: Core Domain Model (Completed)

- Implemented core domain entities (Dossier, Document, Page)
- Created domain repositories and interfaces
- Defined value objects and domain services
- Implemented domain exceptions

## Phase 2: Infrastructure Layer (Completed)

- Implemented filesystem repositories
- Created file processors for different file types
- Built storage location abstraction
- Implemented SQLite document path database

## Phase 3: Application Layer (Completed)

- Implemented use cases for all operations
- Created application services as facades
- Built error handling and validation

## Phase 4: Interface Layer (Completed)

- Implemented HTTP adapters
- Created API endpoints matching original ones
- Ensured backward compatibility with existing clients

## Phase 5: Dependency Injection (Completed)

- Implemented DI container
- Registered all components in container
- Created application configuration

## Phase 6: Client Integration (In Progress)

- Update client components to use new API if needed
- Ensure all client functionality works with new implementation
- Test all operations end-to-end

## Phase 7: Testing (Pending)

- Add unit tests for all domain components
- Implement integration tests for use cases
- Create end-to-end tests for API endpoints

## Phase 8: Documentation (Pending)

- Update API documentation
- Create developer guides
- Document architecture and design decisions

## Phase 9: Cleanup (Pending)

- Remove deprecated code
- Finalize documentation
- Complete code reviews

## Migration Strategy for Client Code

The client code does not need immediate changes as the new implementation maintains the same API endpoints and response formats. However, future improvements could include:

1. Creating a proper client SDK for the API
2. Implementing strong typing for API requests and responses
3. Adding client-side validation

## File Storage Migration

For existing files in the old structure (`/dossier/{uuid}`), no migration is needed as the system is designed to work with both structures simultaneously:

1. The system first checks for files in the old structure
2. If not found, it looks up the path in the new database
3. New files are always saved in the new structure

Over time, as old documents are accessed and modified, their metadata will be updated to include index.json files compatible with the new structure.

## Fallback Strategy

If any issues are encountered with the new implementation, the system can fall back to the original code by:

1. Changing the entry point in the classifier API
2. Reverting the middlewares.mjs file
3. Updating the server index.mjs file

However, this should not be necessary as the new implementation maintains full backward compatibility.

## Verification Steps

Before considering the migration complete, verify that:

1. All API endpoints work as expected
2. File uploads and processing work correctly
3. Document classification functions properly
4. Pages can be moved between documents
5. Both old and new storage structures are supported
6. Performance meets or exceeds original implementation

## Timeline

- Phase 1-5: Completed
- Phase 6: 1-2 weeks
- Phase 7: 2-3 weeks
- Phase 8: 1 week
- Phase 9: 1 week

Total estimated time to completion: 5-7 weeks