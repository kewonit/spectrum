import Image from "next/image";

const shippinganddelivery: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black">
            <div className="max-w-md p-8 bg-black rounded shadow-md">
            <Image className="mx-auto pb-8" width="200" height="200" alt="image" src="https://res.cloudinary.com/dr38lv00a/image/upload/v1739175909/cat5_enxn8d.jpg" />
            <h2 className="text-2xl text-[#2b364a] font-bold mb-4">Contact</h2>
            <p className="text-gray-600 mb-6">
            pccoe.spectrum.25@gmail.com
            </p>
            <p className="text-gray-600 mb-6">
               Timings - 9:00 AM to 5:00 PM IST, Monday to Friday
            </p>
        </div>
      </div>
    );
  };
  
  export default shippinganddelivery;
  