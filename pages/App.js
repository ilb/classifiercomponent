import Classifier from '../src/classifier/client/components/Classifier';
import ClassifierSchemaBuilder from '../src/classifier/schema/builders/ClassifierSchemaBuilder.mjs';
import { useState } from 'react';
import matching from '../src/classifier/schema/matching.mjs';
import schema from '../src/classifier/schema/index.mjs';

const builder = new ClassifierSchemaBuilder({ matching });

export default function App() {
  const uuid = '7533b049-88ca-489b-878a-3ac1c8616fe7';
  const [classifierSchema] = useState(builder.build(schema, { stateCode: 'CREATION' }));

  return (
    <div style={{ marginTop: 50 }} className="ui container">
      <Classifier
        uuid={uuid}
        name="classifier"
        // onUpdate={onDocumentsUpdate}
        // onRemove={onDocumentsRemove}
        // onDrag={onDrag}
        // showError={(err) => Toast.error(err)}
        schema={classifierSchema}
      />
    </div>
  );
};
