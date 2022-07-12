import { notify } from '@ilb/mailer/src/errormailer';
import Response from './Response.mjs';
export async function processUsecaseApiInstance2(context, usecase) {
  const request = context.query;

  try {
    const result = await usecase.process(request);
    return buildResponse(result);
  } catch (err) {
    console.trace(err);
    notify(err).catch(console.log);

    return Response.badRequest(err);
  }
}

const buildResponse = (result) => {
  if (result) {
    let contentType = 'application/json';
    if (typeof result === 'string') {
      contentType = 'text/plain';
    }
    return Response.ok(result, contentType);
  } else {
    return Response.noContent();
  }
}