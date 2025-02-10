import Image from "next/image";
const Cancellationandrefund: React.FC = () => {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="max-w-md p-8 bg-black rounded shadow-md">
        <Image className="mx-auto pb-8" width="200" height="200" alt="image" src="https://res.cloudinary.com/dr38lv00a/image/upload/v1739175911/cat2_jewelc.png" /> 
        <h2 className="text-2xl font-bold mb-4">Cancellation and Refund Policy</h2>

        <p className="mb-4">
          Welcome to Spectrum PCCOE! We&apos;re excited to have you join us for this event. Please take a moment to review our cancellation and refund policy outlined below:
        </p>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Cancellation:</h3>
          <p>Unfortunately, we are unable to process any cancellation requests for the Spectrum PCCOE event. Our team has dedicated considerable time and resources to make this event a success, and we are unable to accommodate cancellations at this time.</p>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Refund:</h3>
          <p>Refund requests will not be entertained. We appreciate your understanding that the funds collected contribute directly to the organization and execution of the event.</p>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Considerations:</h3>
          <p>We understand that unforeseen circumstances may arise, and we empathize with any challenges you may be facing. However, due to the nature of event planning and resource allocation, we are unable to make exceptions to our policy.</p>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Event Participation:</h3>
          <p>We encourage you to attend Spectrum PCCOE as planned. It promises to be an engaging and enriching experience for all participants.</p>
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Contact Us:</h3>
          <p>If you have any concerns or specific issues, please feel free to reach out to our team through the contact information provided on our website. We are here to assist you within the confines of our policies.</p>
        </div>

        <p className="text-sm text-gray-600">Thank you for your understanding and cooperation. We look forward to making Spectrum PCCOE a memorable event for everyone involved!</p>
      </div>
      </div>
    );
  };
  
  export default Cancellationandrefund;
  