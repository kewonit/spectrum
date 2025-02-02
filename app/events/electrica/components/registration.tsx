import Image from "next/image"
import { Button } from "@/components/ui/button"

export function Electrica_registarion() {
    return (
            <div className="p-4 lg:p-8">
                <div className="w-full max-w-sm bg-white mx-auto">
                    <h1 className="scroll-m-20 p-6 text-4xl font-extrabold text-black tracking-tight lg:text-5xl lg:p-8">
                        Registration Page :
                    </h1>
                    <a>
                        <Image className="px-8 pb-8 rounded-t-lg" src="https://i.imgur.com/zACkQk8_d.webp?maxwidth=760&fidelity=grand" alt="product image" width={1200} height={1000} />
                    </a>
                    <div className="px-5 pb-5">
                        <a>
                            <h5 className="text-xl font-semibold tracking-tight text-black">Electrica </h5>
                        </a>
                        <div className="flex items-center justify-between pt-4 ">
                            <span className="text-3xl font-bold text-gray-900">&#8377;100/-</span>
                            <a href="/signup"><Button className="">Register</Button></a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }