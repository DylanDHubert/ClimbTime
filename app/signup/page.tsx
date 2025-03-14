import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import SignupForm from "@/app/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Sign Up | SocialApp",
  description: "Create a new SocialApp account",
};

export default async function SignupPage() {
  const session = await getServerSession();
  
  if (session) {
    redirect("/");
  }
  
  return (
    <div className="max-w-4xl mx-auto py-8">
      <SignupForm />
    </div>
  );
} 