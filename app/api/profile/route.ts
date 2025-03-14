import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/app/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user ID exists in session
    if (!session.user.id) {
      console.error("User ID missing from session:", session);
      return NextResponse.json(
        { error: "Unauthorized - User ID missing" },
        { status: 401 }
      );
    }
    
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const location = formData.get("location") as string;
    const website = formData.get("website") as string;
    
    // Handle profile picture and banner uploads
    const profilePicture = formData.get("profilePicture") as File | null;
    const bannerPicture = formData.get("bannerPicture") as File | null;
    
    // For data URLs that might be passed directly
    const profilePictureDataUrl = formData.get("profilePictureDataUrl") as string | null;
    const bannerPictureDataUrl = formData.get("bannerPictureDataUrl") as string | null;
    
    console.log("Profile update data:", {
      name,
      bio,
      location,
      website,
      hasProfilePicture: !!profilePicture,
      hasBannerPicture: !!bannerPicture,
      hasProfileDataUrl: !!profilePictureDataUrl,
      hasBannerDataUrl: !!bannerPictureDataUrl
    });
    
    // Simple file handling - in a production app, you'd use a service like AWS S3 or similar
    let profilePictureUrl = null;
    let bannerPictureUrl = null;
    
    // Use data URLs directly for now (not recommended for production)
    if (profilePictureDataUrl) {
      profilePictureUrl = profilePictureDataUrl;
    } else if (profilePicture && profilePicture.size > 0) {
      // For demo purposes, we're just storing the file name
      // In a real app, you'd upload to a storage service and store the URL
      profilePictureUrl = `/uploads/${session.user.id}_profile_${Date.now()}_${profilePicture.name}`;
    }
    
    if (bannerPictureDataUrl) {
      bannerPictureUrl = bannerPictureDataUrl;
    } else if (bannerPicture && bannerPicture.size > 0) {
      bannerPictureUrl = `/uploads/${session.user.id}_banner_${Date.now()}_${bannerPicture.name}`;
    }
    
    // Update user profile in database
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name: name || undefined,
        bio: bio || undefined,
        location: location || undefined,
        website: website || undefined,
        image: profilePictureUrl || undefined,
        bannerImage: bannerPictureUrl || undefined,
      },
    });
    
    return NextResponse.json({ 
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        bio: updatedUser.bio,
        location: updatedUser.location,
        website: updatedUser.website,
        image: updatedUser.image,
        bannerImage: updatedUser.bannerImage,
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
} 