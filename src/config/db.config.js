import env from './env.config.js';

export const dbConfig = {
  uri: env.MONGO_URI,
  options: {
    autoIndex: true,
  },
};
