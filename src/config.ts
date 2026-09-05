export const config = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  // Injected by the CI pipeline later (e.g. the git SHA) so you can tell
  // which build is actually running in an environment.
  version: process.env.APP_VERSION ?? '1.0.0',
  commit: process.env.GIT_COMMIT ?? 'local',
};

export const broken: number = 'not a number';
