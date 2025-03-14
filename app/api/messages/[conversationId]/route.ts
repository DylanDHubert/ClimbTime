import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/app/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(request: NextRequest, { params }: { params: { conversationId: string } }) {
    const { conversationId } = params;
    
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        
        // Verify the conversation exists and the user is part of it
        const conversation = await prisma.conversation.findUnique({
            where: {
                id: conversationId,
            },
        });
        
        if (!conversation) {
            return NextResponse.json(
                { error: "Conversation not found" },
                { status: 404 }
            );
        }
        
        if (
            conversation.initiatorId !== session.user.id &&
            conversation.receiverId !== session.user.id
        ) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }
        
        // Get messages
        const messages = await prisma.message.findMany({
            where: {
                conversationId,
            },
            orderBy: {
                createdAt: "asc",
            },
        });
        
        // Mark messages as read if the user is the receiver
        await prisma.message.updateMany({
            where: {
                conversationId,
                receiverId: session.user.id,
                read: false,
            },
            data: {
                read: true,
            },
        });
        
        return NextResponse.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
} 