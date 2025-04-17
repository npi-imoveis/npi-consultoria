import Redis from 'ioredis';

let redisClient;

export function getRedisClient() {
    if (!redisClient) {
        // Usar variáveis de ambiente para configuração ou valores padrão
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

        redisClient = new Redis(redisUrl, {
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => {
                console.log(`Tentativa de reconexão ao Redis: ${times}`);
                return Math.min(times * 100, 3000); // Tempo entre tentativas
            },
        });

        redisClient.on('error', (err) => {
            console.error('Erro de conexão com Redis:', err);
        });

        redisClient.on('connect', () => {
            console.log('Conectado ao Redis com sucesso');
        });
    }

    return redisClient;
} 