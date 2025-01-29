import { SignUpForm } from "./components/SignUp";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-[#EBE9E0] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <SignUpForm />
      </div>
    </main>
  );
}
