'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { PrismaUserRole } from '@/lib/db';

export async function createUser(data: FormData) {
  const name = data.get('name') as string;
  const mobile = data.get('mobile') as string;
  const pin = data.get('pin') as string;
  const role = data.get('role') as PrismaUserRole;
  
  if (!name || !mobile || !pin || !role) {
    throw new Error('All fields are required');
  }

  const hashed_pin = await bcrypt.hash(pin, 10);

  await prisma.user.create({
    data: {
      name,
      mobile,
      hashed_pin,
      role,
    },
  });

  revalidatePath('/admin/dashboard/users');
}

export async function updateUser(id: string, data: FormData) {
  const name = data.get('name') as string;
  const mobile = data.get('mobile') as string;
  const role = data.get('role') as PrismaUserRole;

  if (!name || !mobile || !role) {
    throw new Error('Required fields are missing');
  }

  await prisma.user.update({
    where: { id },
    data: {
      name,
      mobile,
      role,
    },
  });

  revalidatePath('/admin/dashboard/users');
}

export async function deleteUser(id: string) {
  await prisma.user.delete({
    where: { id },
  });

  revalidatePath('/admin/dashboard/users');
}
