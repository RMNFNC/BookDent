import { prisma } from '../config/prisma';

interface CreateServiceInput {
  name: string;
  description?: string;
  durationMin?: number;
  price?: number;
}

export const getAllServices = async (includeInactive = false) => {
  return prisma.dentalService.findMany({
    where: includeInactive ? {} : { isActive: true },
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

interface UpdateServiceInput {
  name?: string;
  description?: string;
  durationMin?: number;
  price?: number;
  isActive?: boolean;
}

export const updateDentalService = async (id: number, data: UpdateServiceInput) => {
  const service = await prisma.dentalService.findUnique({ where: { id } });
  if (!service) throw new Error('Prestazione non trovata');

  if (data.name) {
    const existingService = await prisma.dentalService.findUnique({
      where: { name: data.name },
    });

    if (existingService && existingService.id !== id) {
      throw new Error('Esiste già un’altra prestazione con questo nome');
    }
  }

  return prisma.dentalService.update({
    where: { id },
    data,
  });
};
