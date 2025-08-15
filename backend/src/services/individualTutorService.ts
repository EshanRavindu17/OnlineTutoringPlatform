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
