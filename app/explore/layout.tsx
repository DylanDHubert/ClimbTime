import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore | ClimbTime",
  description: "Discover posts from all users",
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 