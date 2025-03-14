import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore | SocialApp",
  description: "Discover posts from all users",
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 