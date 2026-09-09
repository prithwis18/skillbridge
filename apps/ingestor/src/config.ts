import { env, envInt } from '@sih/shared';

export const config = {
  port: envInt('PORT', 3003),
  adminToken: env('ADMIN_TOKEN', 'dev-admin-token'),
};
