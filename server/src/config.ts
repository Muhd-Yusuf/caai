function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  supabaseUrl: requireEnv('SUPABASE_URL'),
  supabaseServiceRoleKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  jwtSecret: requireEnv('JWT_SECRET'),
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || '',
  openaiApiKey: requireEnv('OPENAI_API_KEY'),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
