export default function Loading() {
    return (
        <div className="w-full h-screen flex flex-col items-center justify-center p-4 bg-white">
            <div className="relative">
                <div className="animate-spin rounded-full h-20 w-20 md:h-32 md:w-32 border-t-4 border-b-4 border-black" role="status">
                    <span className="sr-only">Carregando informações do imóvel...</span>
                </div>
                <img
                    src="/assets/images/bg-hub.png"
                    alt="Logo"
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-12 w-12 md:h-20 md:w-20 animate-pulse-opacity"
                />
            </div>
            <p className="mt-4 text-gray-600">Carregando informações do imóvel...</p>
        </div>
    );
} 