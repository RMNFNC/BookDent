import { prisma } from '../config/prisma';

interface CreateServiceInput {
  name: string;
  description?: string;
  durationMin?: number;
  price?: number;
}

export const getAllServices = async () => {
  return prisma.dentalService.findMany({
    orderBy: {
      id: 'asc',
    },
  });
};

export const createDentalService = async ({
  name,
  description,
  durationMin,
  price,
}: CreateServiceInput) => {
  const existingService = await prisma.dentalService.findUnique({
    where: { name },
  });

  if (existingService) {
    throw new Error('Prestazione già esistente');
  }

  return prisma.dentalService.create({
    data: {
      name,
      description,
      durationMin,
      price,
    },
  });
};
