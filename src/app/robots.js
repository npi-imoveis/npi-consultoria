// src/app/robots.js - CORRIGIDO PARA GSC

/**
 * @returns {import('next').MetadataRoute.Robots}
 */
export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/static/',
          '/_next/data/',
          '/admin/',
          '/dashboard/'
        ],
        // REMOVIDO: crawlDelay: 1, - Googlebot ignora
      },
      
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/static/',
          '/_next/data/',
          '/admin/',
          '/dashboard/'
        ],
        // REMOVIDO: crawlDelay: 1,
      },
      
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/static/',
          '/_next/data/',
          '/admin/',
          '/dashboard/'
        ],
        // REMOVIDO: crawlDelay: 2,
      },
      
      // ✅ OpenAI (ChatGPT, GPTs) - MANTIDO
      {
        userAgent: 'GPTBot',
        allow: '/',
      },
      {
        userAgent: 'OAI-SearchBot',
        allow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
      },
      {
        userAgent: 'ChatGPT-User/2.0',
        allow: '/',
      },
      // ✅ Anthropic (Claude) - MANTIDO
      {
        userAgent: 'ClaudeBot',
        allow: '/',
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
      },
      {
        userAgent: 'Claude-SearchBot',
        allow: '/',
      },
      {
        userAgent: 'Claude-User',
        allow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
      },
      // ✅ Common Crawl (usado para treinar diversas IAs) - MANTIDO
      {
        userAgent: 'CCBot',
        allow: '/',
      },
      // ✅ Google Bard/Gemini - MANTIDO
      {
        userAgent: 'Google-Extended',
        allow: '/',
      },
      {
        userAgent: 'GoogleOther',
        allow: '/',
      },
      // ✅ Perplexity AI - MANTIDO
      {
        userAgent: 'PerplexityBot',
        allow: '/',
      },
      {
        userAgent: 'Perplexity-User',
        allow: '/',
      },
      // ✅ Meta AI (Llama) - MANTIDO
      {
        userAgent: 'Meta-ExternalAgent',
        allow: '/',
      },
      {
        userAgent: 'FacebookBot',
        allow: '/',
      },
      // ✅ xAI (Grok) - MANTIDO
      {
        userAgent: 'GrokBot',
        allow: '/',
      },
      {
        userAgent: 'xAI-Bot',
        allow: '/',
      },
      {
        userAgent: 'xAI-Crawler',
        allow: '/',
      },
      // ✅ DeepSeek AI - MANTIDO
      {
        userAgent: 'DeepSeek-Bot',
        allow: '/',
      },
      {
        userAgent: 'deepseek-ai',
        allow: '/',
      },
      {
        userAgent: 'DeepSeekBot',
        allow: '/',
      },
      // ✅ You.com (One/Search) - MANTIDO
      {
        userAgent: 'You.com',
        allow: '/',
      },
      {
        userAgent: 'YouBot',
        allow: '/',
      },
      {
        userAgent: 'You-Bot',
        allow: '/',
      },
      // ✅ Amazon AI/Alexa - MANTIDO
      {
        userAgent: 'Amazonbot',
        allow: '/',
      },
      // ✅ Apple Intelligence/Siri - MANTIDO
      {
        userAgent: 'Applebot',
        allow: '/',
      },
      {
        userAgent: 'Applebot-Extended',
        allow: '/',
      },
      // ✅ ByteDance/TikTok AI - MANTIDO
      {
        userAgent: 'Bytespider',
        allow: '/',
      },
      // ✅ DuckDuckGo AI - MANTIDO
      {
        userAgent: 'DuckAssistBot',
        allow: '/',
      },
      // ✅ Cohere AI - MANTIDO
      {
        userAgent: 'cohere-ai',
        allow: '/',
      },
      {
        userAgent: 'cohere-training-data-crawler',
        allow: '/',
      },
      // ✅ LinkedIn AI - MANTIDO
      {
        userAgent: 'LinkedInBot',
        allow: '/',
      },
      // ✅ Outros emergentes - MANTIDO
      {
        userAgent: 'AndiBot',
        allow: '/',
      },
      {
        userAgent: 'AI2Bot',
        allow: '/',
      },
      {
        userAgent: 'bedrockbot',
        allow: '/',
      },
    ],
    host: baseUrl,
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
