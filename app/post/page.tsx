import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import CreatePostForm from "@/app/components/post/CreatePostForm";

export const metadata: Metadata = {
  title: "Create Post | ClimbTime",
  description: "Share your thoughts and photos with your friends",
};

export default async function PostPage() {
  const session = await getServerSession();
  
  if (!session) {
    redirect("/login");
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      <CreatePostForm />
    </div>
  );
} 