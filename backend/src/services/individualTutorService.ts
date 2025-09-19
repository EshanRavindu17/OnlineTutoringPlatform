import prisma from "../prismaClient";


export const getAllSubjects = async () => {
  const subjects = await prisma.subjects.findMany();
  return subjects;
};

export const getAllTitlesBySubject = async (sub_id:string) => {
  const titles = await prisma.titles.findMany({
    where: {
      sub_id: sub_id
    }
  });
  return titles;
};

export const getAllTitles = async () => {
const titles = await prisma.titles.findMany({
    select: {
        name: true,
        Subjects: {
            select: {
                name: true
            }
        }
    }
});
  return titles;
};

export const createSubject = async (name: string) => {
  // Check if subject already exists
  const existingSubject = await prisma.subjects.findFirst({
    where: {
      name: {
        equals: name,
        mode: 'insensitive' // Case-insensitive search
      }
    }
  });

  if (existingSubject) {
    throw new Error('Subject already exists');
  }

  const subject = await prisma.subjects.create({
    data: {
      name: name
    }
  });
  return subject;
};

export const createTitle = async (name: string, sub_id: string) => {
  // Check if title already exists for this subject
  const existingTitle = await prisma.titles.findFirst({
    where: {
      name: {
        equals: name,
        mode: 'insensitive' // Case-insensitive search
      },
      sub_id: sub_id
    }
  });

  if (existingTitle) {
    throw new Error('Title already exists for this subject');
  }

  // Verify subject exists
  const subject = await prisma.subjects.findUnique({
    where: {
      sub_id: sub_id
    }
  });

  if (!subject) {
    throw new Error('Subject not found');
  }

  const title = await prisma.titles.create({
    data: {
      name: name,
      sub_id: sub_id
    }
  });
  return title;
};
