# Classifier Component

Document classification and management component for Next.js applications.

## Features

- Document upload and classification
- Drag-and-drop interface for managing documents
- PDF handling and image processing
- Automatic document type detection
- React components for document classification UI
- REST API for document management

## Installation

```bash
npm install @ilb/classifiercomponent
# or
yarn add @ilb/classifiercomponent
```

## Requirements

- Node.js 14+
- Poppler (for PDF processing)
- ImageMagick (for image conversion)

## Configuration

Configure the component by setting the following environment variables:

```
DOSSIER_DOCUMENT_PATH=/path/to/documents
BASE_URL=http://localhost:3010
POPPLER_BIN_PATH=/usr/bin
```

## Usage

### Client-side Component

```jsx
import { Classifier } from '@ilb/classifiercomponent/src/client';

// Example schema
const schema = {
  classifier: {
    readonly: false,
    disabled: false
  },
  tabs: [
    {
      type: 'PASSPORT',
      name: 'Паспорт',
      readonly: false,
      accept: 'image/*,application/pdf'
    },
    {
      type: 'SNILS',
      name: 'СНИЛС',
      readonly: false,
      accept: 'image/*,application/pdf'
    }
  ],
  blocks: []
};

export default function MyApp() {
  return (
    <Classifier 
      uuid="document-uuid" 
      schema={schema} 
      onInit={docs => console.log('Documents initialized', docs)}
      onUpdate={(tab, docs) => console.log('Documents updated', tab, docs)}
      onRemove={(tab, docs) => console.log('Document removed', tab, docs)}
      onChange={docs => console.log('Documents changed', docs)}
    />
  );
}
```

### Server-side API

```javascript
// pages/api/classifications/[...classifier].js
import { ClassifierApi } from '@ilb/classifiercomponent/src/server.mjs';
import { createScope } from '../../../libs/usecases/index.mjs';
import { onError, onNoMatch } from '../../../libs/middlewares/index.mjs';

export const config = {
  api: {
    bodyParser: false
  }
};

export default ClassifierApi(createScope, onError, onNoMatch);
```

The DI container must have the following dependencies:
- `dossierBuilder` - Instance of the `DossierBuilder` class
- `fileService` - File handling service
- For classification: `verificationService`, `verificationRepository`, `classifierQuantity`

## Example

```bash
git clone https://github.com/ilb/classifiercomponent.git
npm i
cp .env.example .env
npm run dev
```

Navigate to http://127.0.0.1:3010

## Project Structure

```
src/
  classifier/
    client/         # Client-side components
      components/   # React components
      hooks/        # Custom hooks
      utils/        # Client utilities
      context/      # React context providers
    schema/         # Schema validation
    server/         # Server-side code
      core/         # Core business logic
      gates/        # API gateways
      usecases/     # Business use cases
  config/           # Configuration management
  di/               # Dependency injection
  http/             # HTTP utilities and handlers
  repository/       # Data access layer
  services/         # Business services
  util/             # Utility functions
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## API Reference

### Server API Endpoints

- `GET /api/classifications/:uuid` - Get document classification tasks
- `PUT /api/classifications/:uuid` - Classify documents
- `GET /api/classifications/:uuid/documents` - Get all documents
- `POST /api/classifications/:uuid/documents/correction` - Correct document classification
- `GET /api/classifications/:uuid/documents/:name` - Get document by name
- `PUT /api/classifications/:uuid/documents/:name` - Add pages to document
- `GET /api/classifications/:uuid/documents/:name/:number` - Get specific page
- `DELETE /api/classifications/:uuid/documents/:name/:pageUuid` - Delete page

## License

ISC