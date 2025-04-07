import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import LoginForm from "@/app/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log In | ClimbTime",
  description: "Log in to your ClimbTime account",
};

export default async function LoginPage() {
  const session = await getServerSession();
  
  if (session) {
    redirect("/");
  }
  
  return (
    <div className="max-w-4xl mx-auto py-8">
      <LoginForm />
    </div>
  );
} 