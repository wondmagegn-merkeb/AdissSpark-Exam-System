
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        username: data.username,
        gender: data.gender,
        studentType: data.studentType,
        institutionName: data.institutionName,
        department: data.department,
        gradeLevel: data.gradeLevel,
        image: data.image,
      },
    });
    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
    if (error.code === 'P2002' && error.meta?.target?.includes('username')) {
        return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
