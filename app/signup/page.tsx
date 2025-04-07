import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import SignupForm from "@/app/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Sign Up | ClimbTime",
  description: "Create a new ClimbTime account",
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