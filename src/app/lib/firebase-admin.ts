import * as admin from "firebase-admin";

if (!admin.apps.length) {
    try {
        // Verifica se as variáveis de ambiente estão definidas
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;

        if (!projectId || !clientEmail || !privateKey) {
            console.warn("Variáveis de ambiente do Firebase não encontradas. Inicializando com configuração padrão para build.");
            // Para builds/desenvolvimento, usar configuração mínima
            admin.initializeApp({
                projectId: "default-project",
            });
        } else {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey: privateKey.replace(/\\n/g, "\n"),
                }),
            });
        }
    } catch (error) {
        console.error("Erro ao inicializar Firebase Admin:", error);
        // Fallback para builds
        if (!admin.apps.length) {
            admin.initializeApp({
                projectId: "default-project",
            });
        }
    }
}

export default admin;
