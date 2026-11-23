import 'server-only';

export function logBackendFailure(event: { requestId: string; code: string }) {
  console.error(
    JSON.stringify({
      event: 'BACKEND_FAILURE',
      requestId: event.requestId,
      code: event.code,
    }),
  );
}
