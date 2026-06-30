import dotenv from 'dotenv';

dotenv.config();

const required = ['MONGO_URI', 'JWT_SECRET'];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  // eslint-disable-next-line no-console
  console.warn(
    `[env] Missing recommended environment variables: ${missing.join(', ')}. ` +
      'Copy .env.example to .env and fill in the values.',
  );
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-code-review',
  jwt: {
    secret: process.env.JWT_SECRET || 'insecure_dev_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  ai: {
    provider: (process.env.AI_PROVIDER || 'gemini').toLowerCase(),
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    },
  },
};

export const isProd = env.nodeEnv === 'production';
