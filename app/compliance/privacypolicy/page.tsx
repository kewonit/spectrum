import Image from "next/image";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="max-w-md p-8 bg-black rounded shadow-md text-white">
        <Image className="mx-auto pb-8" width="200" height="200" alt="image" src="https://res.cloudinary.com/dr38lv00a/image/upload/v1739175910/cat1_oginwg.webp" /> 

        <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>
        
        <p className="mb-4">
          Thank you for visiting Spectrum Pccoe&apos;25 website. This Privacy Policy outlines the types of personal information we collect, how we collect it, how we use it, and how we keep it safe. By using our website, you agree to the terms outlined in this policy.
        </p>

        {/* Information We Collect */}
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-4">Information We Collect:</h2>
          {/* Personal Information */}
          <p>- Name</p>
          <p>- Email address</p>
          <p>- Contact number</p>
          <p>- College/University affiliation</p>
          <p>- Any additional information voluntarily provided by the user</p>
          {/* Non-personal Information */}
          <p>- Browser type</p>
          <p>- IP address</p>
          <p>- Operating system</p>
        </section>

        {/* How We Collect Information */}
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-4">How We Collect Information:</h2>
          <p>We collect information through:</p>
          <p>- Registration forms for events</p>
          <p>- Volunteer sign-ups</p>
          <p>- Interactive features on our website</p>
          <p>- Cookies and similar technologies for analytics</p>
        </section>

        {/* How We Use Collected Information */}
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-4">How We Use Collected Information:</h2>
          <p>We use the information for:</p>
          <p>- Sending event updates and notifications</p>
          <p>- Processing event registrations</p>
          <p>- Improving user experience on the website</p>
          <p>- Analyzing website traffic and user behavior</p>
        </section>

        {/* How We Keep Information Safe */}
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-4">How We Keep Information Safe:</h2>
          <p>We employ reasonable security measures to protect your information from unauthorized access, disclosure, alteration, and destruction. This includes secure data storage, limited access to information, and encryption protocols.</p>
        </section>

        {/* Information Sharing with Third Parties */}
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-4">Information Sharing with Third Parties:</h2>
          <p>We do not sell, trade, or otherwise transfer your personally identifiable information to third parties without your consent. However, we may share information with trusted third-party service providers involved in organizing and managing the college fest. These third parties are required to maintain the confidentiality and security of your information.</p>
        </section>

        {/* Third-Party Links */}
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-4">Third-Party Links:</h2>
          <p>Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these sites. We encourage users to be aware when they leave our site and to read the privacy statements of any other site that collects personally identifiable information.</p>
        </section>

        {/* Consent */}
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-4">Consent:</h2>
          <p>By using our website, you consent to the terms outlined in this Privacy Policy.</p>
        </section>

        {/* Changes to the Privacy Policy */}
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-4">Changes to the Privacy Policy:</h2>
          <p>We reserve the right to update and make changes to this Privacy Policy. Users are encouraged to review this page periodically for any changes.</p>
        </section>

        {/* Contact Information */}
        <section className="mb-6">
          <h2 className="text-xl font-bold mb-4">Contact Information:</h2>
          <p>If you have any questions or concerns regarding this Privacy Policy, please contact us at pccoe.spectrum.25@gmail.com</p>
        </section>

        <p className="text-sm text-gray-500">By using our website, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.</p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
