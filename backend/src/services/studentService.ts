import prisma from "../prismaClient";

interface Individual{
    i_tutor_id : string;
    subjects: string[];
    titles: string[];
    hourly_rate: number;
    rating: number;
    description: string;
    heading?: string;
    User?: {
        name: string;
        photo_url: string | null;
    } | null;
}

export const getAllIndividualTutors = async (subjects:string,titles:string,min_hourly_rate:number,max_hourly_rate:number, rating:number,sort:string,page:number=1,limit:number=10) => {
    const tutors = await prisma.individual_Tutor.findMany({
        where: {
            ...(subjects &&  { subjects: { hasSome: subjects.split(',').map(subject => subject.trim()) } }),
            ...(titles && { titles: { hasSome: titles.split(',').map(title => title.trim()) } }),
            ...(min_hourly_rate && { hourly_rate: { gte: min_hourly_rate } }),
            ...(max_hourly_rate && { hourly_rate: { lte: max_hourly_rate } }),
            ...(rating && { rating: { gte: rating } }),
        },
        include: {
            User: {
                select: {
                    name: true,
                    photo_url: true
                }
            }
        },
        orderBy: (() => {
        switch (sort) {
        case 'price_asc': return { hourly_rate: 'asc' as const };
        case 'price_desc': return { hourly_rate: 'desc' as const };
        case 'rating_desc': return { rating: 'desc' as const };
        case 'rating_asc': return { rating: 'asc' as const };
        case 'all': return { i_tutor_id: 'asc' as const }; // original order
        default: return { rating: 'desc' as const }; // DEFAULT = highest rated
      }
    })(),
        skip: (page - 1) * limit,
        take: limit
    });
    return tutors;
}


