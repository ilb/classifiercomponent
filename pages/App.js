import { Classifier } from '../src/client';
import { useState } from 'react';
import matching from '../src/mocks/matching.mjs';
import schema from '../src/mocks/schema.mjs';
import ClassifierSchemaBuilder from '../src/mocks/ClassifierSchemaBuilder.mjs';

const builder = new ClassifierSchemaBuilder(matching);

export default function App() {
  const uuid = '7533b049-88ca-489b-878a-3ac1c8616fe7';
  const [classifierSchema] = useState(builder.build(schema, { stateCode: 'CREATION' }));

  return (
    <div style={{ marginTop: 50 }} className="ui container">
      <Classifier uuid={uuid} name="classifier" schema={classifierSchema} />
    </div>
  );
};
