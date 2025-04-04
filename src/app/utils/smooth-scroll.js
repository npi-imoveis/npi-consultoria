export const smoothScroll = (e) => {
    if (e) e.preventDefault();
    const targetId = e && e.currentTarget ? e.currentTarget.getAttribute('href') : null;

    if (targetId && targetId.startsWith('#')) {
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            // Verifica se precisamos rolar
            const rect = targetElement.getBoundingClientRect();
            const isInView = (
                rect.top >= 0 &&
                rect.left >= 0 &&
                rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                rect.right <= (window.innerWidth || document.documentElement.clientWidth)
            );

            if (!isInView) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    }
};

// Função para remover o hash da URL sem recarregar a página
export const removeHash = () => {
    const loc = window.location;
    if (loc.hash) {
        // Preserve o histórico atual
        history.pushState("", document.title, loc.pathname + loc.search);
    }
}

// Função para lidar com o carregamento inicial da página
export const handleInitialScroll = () => {
    // Se não houver hash, garantir que a página comece no topo
    if (!window.location.hash) {
        window.scrollTo(0, 0);
    } else {
        // Se houver um hash, esperar um pouco para que a página carregue e depois rolar suavemente
        setTimeout(() => {
            const targetElement = document.querySelector(window.location.hash);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            } else {
                // Se o elemento não for encontrado, voltar ao topo
                window.scrollTo(0, 0);
            }
        }, 300);
    }
}; 