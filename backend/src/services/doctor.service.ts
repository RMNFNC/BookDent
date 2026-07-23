import { prisma } from '../config/prisma';

export const getAllDoctors = async () => {
  return prisma.doctor.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
    orderBy: {
      id: 'asc',
    },
  });
};

export const getDoctorById = async (id: number) => {
  return prisma.doctor.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
      slots: true,
    },
  });
};
