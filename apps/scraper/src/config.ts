import { envInt } from '@sih/shared';

export const config = { port: envInt('PORT', 3002) };
