[14:14:41.945] Running build in Washington, D.C., USA (East) – iad1
[14:14:41.946] Build machine configuration: 4 cores, 8 GB
[14:14:41.959] Cloning github.com/npi-imoveis/npi-consultoria (Branch: master, Commit: 36b8df4)
[14:14:43.757] Cloning completed: 1.797s
[14:14:46.119] Restored build cache from previous deployment (ErokjaMF3kNUNyVpopmWs7AnwfiP)
[14:14:46.924] Running "vercel build"
[14:14:47.368] Vercel CLI 43.3.0
[14:14:47.757] Installing dependencies...
[14:14:49.270] 
[14:14:49.271] up to date in 1s
[14:14:49.271] 
[14:14:49.271] 67 packages are looking for funding
[14:14:49.271]   run `npm fund` for details
[14:14:49.303] Detected Next.js version: 14.2.3
[14:14:49.309] Running "npm run build"
[14:14:49.427] 
[14:14:49.427] > npi-front@0.1.0 build
[14:14:49.427] > next build
[14:14:49.427] 
[14:14:50.123]   ▲ Next.js 14.2.3
[14:14:50.123] 
[14:14:50.211]    Creating an optimized production build ...
[14:14:50.951]  ⚠ Found lockfile missing swc dependencies, run next locally to automatically patch
[14:14:56.096]  ⚠ Found lockfile missing swc dependencies, run next locally to automatically patch
[14:14:57.177] Failed to compile.
[14:14:57.178] 
[14:14:57.178] ./src/middleware.js
[14:14:57.178] Error: 
[14:14:57.179]   [31mx[0m Unknown regular expression flags.
[14:14:57.179]     ,-[[36;1;4m/vercel/path0/src/middleware.js[0m:13:1]
[14:14:57.179]  [2m13[0m |   const { pathname } = request.nextUrl;
[14:14:57.179]  [2m14[0m | 
[14:14:57.179]  [2m15[0m |   // Se a URL for /imovel-123 (sem barra ou slug)
[14:14:57.179]  [2m16[0m |   const match = pathname.match(/^\\/imovel-(\\d+)$/);
[14:14:57.179]     : [31;1m                               ^^^^^^^^^^^[0m
[14:14:57.179]  [2m17[0m |   if (match) {
[14:14:57.179]  [2m18[0m |     const id = match[1];
[14:14:57.179]  [2m19[0m |     // Reescreve para /imovel/id (a página [id]/[slug] já faz o redirect para o slug correto)
[14:14:57.179]     `----
[14:14:57.179] 
[14:14:57.179]   [31mx[0m Expected unicode escape
[14:14:57.179]     ,-[[36;1;4m/vercel/path0/src/middleware.js[0m:13:1]
[14:14:57.179]  [2m13[0m |   const { pathname } = request.nextUrl;
[14:14:57.179]  [2m14[0m | 
[14:14:57.179]  [2m15[0m |   // Se a URL for /imovel-123 (sem barra ou slug)
[14:14:57.179]  [2m16[0m |   const match = pathname.match(/^\\/imovel-(\\d+)$/);
[14:14:57.179]     : [31;1m                                             ^[0m
[14:14:57.179]  [2m17[0m |   if (match) {
[14:14:57.180]  [2m18[0m |     const id = match[1];
[14:14:57.180]  [2m19[0m |     // Reescreve para /imovel/id (a página [id]/[slug] já faz o redirect para o slug correto)
[14:14:57.180]     `----
[14:14:57.180] 
[14:14:57.180] Caused by:
[14:14:57.180]     Syntax Error
[14:14:57.181] 
[14:14:57.191] 
[14:14:57.191] > Build failed because of webpack errors
[14:14:57.219] Error: Command "npm run build" exited with 1
[14:14:57.648] 
[14:15:00.606] Exiting build container
