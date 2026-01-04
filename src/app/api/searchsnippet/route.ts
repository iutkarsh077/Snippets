"use server";

import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../prisma";

export async function POST(req: NextRequest){
    try {
        const { searchQuery, userInfo, limit, currentPage } = await req.json();
        const skip = (currentPage - 1) * limit;

        const whereFilter: any = {};

        if(searchQuery){
            whereFilter.OR = [
                { programmingLanguage: { contains: searchQuery, mode: "insensitive" } },
                { question: { contains: searchQuery, mode: "insensitive" } }
            ]
        }

        if(userInfo.id){
            whereFilter.authorId = userInfo.id
        }

        const findSnippets = await prisma.postSnippet.findMany({
            where: whereFilter,
            take: limit,
            skip: skip,
            orderBy: {
                createdAt: "desc"
            }
        })

        const getTotalPages = await prisma.postSnippet.count({
            where: whereFilter
        })

        const result = {
            totalPages: getTotalPages,
            snippets: findSnippets
        }
        
        // console.log(getTotalPages)

        return NextResponse.json({message: "Information Retrieved successfully", data: result, status: true}, {status: 200})
    } catch (error) {
        console.log(error)
        return NextResponse.json({message: "Internal Server error", status: false}, {status: 500});
    }
}