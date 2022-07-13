import Response from './Response.mjs';

export async function defaultHandler(req, res, createScope, usecase) {
  const context = { query: { ...req.params, ...req.body, ...req.files }, req };
  const scope = await createScope(context.req);
  const instance = new usecase(scope.cradle);
  const { httpCode, data, contentType } = await processUsecase(context, instance);

  res.setHeader('Content-Type', contentType);
  res.status(httpCode).send(data);
}

export async function fileHandler(req, res, createScope, usecase) {
  const context = { query: { ...req.params, ...req.body }, req };
  const scope = await createScope(context.req);
  const instance = new usecase(scope.cradle);
  const { data } = await processUsecase(context, instance);
  const { file, mimeType, filename } = data;

  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Length', file.length);
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.send(file);
}

export async function processUsecase(context, usecase) {
  const result = await usecase.process(context.query);
  return buildResponse(result);
}

const buildResponse = (result) => {
  if (result) {
    const contentType = typeof result === 'string' ? 'text/plain' : 'application/json';

    return Response.ok(result, contentType);
  } else {
    return Response.noContent();
  }
}