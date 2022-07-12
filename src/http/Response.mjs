export default class Response {
  static createResponse(httpCode, data, contentType) {
    if (data) {
      return { httpCode, data, contentType };
    } else {
      return { httpCode, contentType };
    }
  }
  static ok(data, contentType) {
    return Response.createResponse(200, data, contentType);
  }
  static noContent() {
    return Response.createResponse(204, null, 'application/json');
  }
  static badRequest(error) {
    return Response.createResponse(400, {error: { type: error.message, description: error.description }}, 'application/json');
  }
}
