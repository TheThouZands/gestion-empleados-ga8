import { HttpError } from '../errors/http-error.js';

export function errorHandler(error, _request, response, _next) {
  let failure = error;
  if (error.type === 'entity.parse.failed') {
    failure = new HttpError(400, 'invalid_json', 'El contenido JSON no es válido.');
  } else if (error.type === 'entity.too.large') {
    failure = new HttpError(413, 'body_too_large', 'La solicitud supera el tamaño permitido.');
  }
  if (!(failure instanceof HttpError)) {
    console.error('Error interno de la API:', error.name);
    failure = new HttpError(500, 'internal_error', 'No se pudo completar la solicitud.');
  }
  response.status(failure.status).json({
    error: {
      code: failure.code,
      message: failure.message,
      ...(failure.fields && { fields: failure.fields }),
    },
  });
}
