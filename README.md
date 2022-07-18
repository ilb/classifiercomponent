# Установка
```
npm i @ilb/classifiercomponent
```

Задать переменную `DOSSIER_DOCUMENT_PATH` в .env

### Клиент:
```
<Classifier uuid={uuid} name="classifier" schema={classifierSchema} />
```

Пример schema: https://github.com/ilb/classifiercomponent/blob/master/src/mocks/schema.mjs


### Сервер:

```js
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

В DI должна быть переменная `dossierBuilder` являющаяся экземпляром класса `DossierBuilder`

И, случае использования классификатора: `verificationService`, `verificationRepository`, `classifierQuantity`