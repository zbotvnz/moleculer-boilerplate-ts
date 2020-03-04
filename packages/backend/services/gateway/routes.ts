import { ServiceRouteOptions } from 'moleculer-apollo-server';

export const routes: ServiceRouteOptions[] = [
  {
    path: '/api/auth',
    authentication: false,
    aliases: {
      'POST login': 'auth.login'
    },
    bodyParsers: {
      json: true,
      urlencoded: { extended: true }
    }
  }
];
