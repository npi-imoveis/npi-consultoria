export default function Card({ title, value, description, buttonText, buttonHref }) {
    return (
        <div className="flex flex-col bg-white rounded-lg">
            <div className="px-6 py-8 sm:p-10 sm:pb-6">
                <div className="grid items-center justify-center w-full grid-cols-1 text-left">
                    <div>
                        <h2
                            className="text-lg font-medium tracking-tighter text-gray-600"
                        >
                            {title}
                        </h2>

                    </div>
                    <div className="mt-2">
                        <p>
                            <span className="text-xl font-bold tracking-tight text-black">
                                {value}
                            </span>

                        </p>
                    </div>
                </div>
            </div>
            <div className="flex px-6 pb-8 sm:px-8">
                <a
                    aria-describedby="tier-company"
                    className="flex items-center justify-center w-full px-6 py-2.5 text-center text-white duration-200 bg-black border-2 border-black rounded-lg nline-flex hover:bg-transparent hover:border-black hover:text-black focus:outline-none focus-visible:outline-black text-sm focus-visible:ring-black"
                    href="#"
                >
                    {buttonText}
                </a>
            </div>
        </div>
    )
}


