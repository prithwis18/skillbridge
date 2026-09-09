const service = process.env.SERVICE_NAME ?? 'app';

function emit(level: string, fields: object, msg?: string) {
  const body: Record<string, unknown> = { ...fields, msg };
  // Errors don't survive JSON.stringify; keep the parts worth reading.
  if (body.err instanceof Error) body.err = { message: body.err.message, stack: body.err.stack };
  console.log(JSON.stringify({ t: new Date().toISOString(), level, service, ...body }));
}

export const log = {
  info: (fields: object, msg?: string) => emit('info', fields, msg),
  warn: (fields: object, msg?: string) => emit('warn', fields, msg),
  error: (fields: object, msg?: string) => emit('error', fields, msg),
};
