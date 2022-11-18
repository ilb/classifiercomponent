import { Classifier } from '../src/client';
import { useRef, useState } from 'react';
import matching from '../src/mocks/matching.mjs';
import schema from '../src/mocks/schema.mjs';
import ClassifierSchemaBuilder from '../src/classifier/schema/ClassifierSchemaBuilder.mjs';

const builder = new ClassifierSchemaBuilder(matching);

export default function App() {
  const uuid = '7533b049-88ca-489b-878a-3ac1c8616fe7';
  const [classifierSchema] = useState(builder.build(schema, { stateCode: 'CREATION' }));

  const childRef = useRef();

  return (
    <div
      style={{
        border: '1px solid #b0b0b0',
        borderRadius: 10,
        padding: 20,
        marginTop: 50,
        width: 1127,
        marginLeft: 'auto !important',
        marginRight: 'auto !important',
        display: 'block',
        maxWidth: '100% !important'
      }}
      className="ui container">
      {/*<button style={{ margin: 20 }} onClick={() => {*/}
      {/*  console.log(childRef);*/}
      {/*  return childRef.current.changeSelectedTab('passport');*/}
      {/*}}>*/}
      {/*  Select passport*/}
      {/*</button>*/}
      <Classifier
        ref={childRef}
        uuid={uuid}
        name="classifier"
        withViewTypes
        defaultViewType="grid"
        schema={classifierSchema}
        onUpdate={console.log}
      />
    </div>
  );
}
