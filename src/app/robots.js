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
          '/imovel-*/facebook.com/',
          '/imovel-*/instagram.com/',
          '/imovel-*/linkedin.com/',
          '/imovel-*/twitter.com/',
          '/imovel-*/youtube.com/'
        ],
      },
      // ✅ OpenAI (ChatGPT, GPTs)
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
      // ✅ Anthropic (Claude)
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
      // ✅ Common Crawl (usado para treinar diversas IAs)
      {
        userAgent: 'CCBot',
        allow: '/',
      },
      // ✅ Google Bard/Gemini
      {
        userAgent: 'Google-Extended',
        allow: '/',
      },
      {
        userAgent: 'GoogleOther',
        allow: '/',
      },
      // ✅ Perplexity AI
      {
        userAgent: 'PerplexityBot',
        allow: '/',
      },
      {
        userAgent: 'Perplexity-User',
        allow: '/',
      },
      // ✅ Microsoft Copilot (via Bing)
      {
        userAgent: 'BingBot',
        allow: '/',
      },
      // ✅ Meta AI (Llama)
      {
        userAgent: 'Meta-ExternalAgent',
        allow: '/',
      },
      {
        userAgent: 'FacebookBot',
        allow: '/',
      },
      // ✅ xAI (Grok)
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
      // ✅ DeepSeek AI
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
      // ✅ You.com (One/Search)
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
      // ✅ Amazon AI/Alexa
      {
        userAgent: 'Amazonbot',
        allow: '/',
      },
      // ✅ Apple Intelligence/Siri
      {
        userAgent: 'Applebot',
        allow: '/',
      },
      {
        userAgent: 'Applebot-Extended',
        allow: '/',
      },
      // ✅ ByteDance/TikTok AI
      {
        userAgent: 'Bytespider',
        allow: '/',
      },
      // ✅ DuckDuckGo AI
      {
        userAgent: 'DuckAssistBot',
        allow: '/',
      },
      // ✅ Cohere AI
      {
        userAgent: 'cohere-ai',
        allow: '/',
      },
      {
        userAgent: 'cohere-training-data-crawler',
        allow: '/',
      },
      // ✅ LinkedIn AI
      {
        userAgent: 'LinkedInBot',
        allow: '/',
      },
      // ✅ Outros emergentes
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
