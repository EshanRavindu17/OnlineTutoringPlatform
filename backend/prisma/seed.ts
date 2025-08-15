import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Seed users
    await prisma.user.createMany({
        data: [
            {
                firebase_uid: "l0GqatIOw5MyvRDgolWvp4EW3aX2",
                email: "jane@gmail.com",
                name: "Jane Student",
                role: "student",
                id: "e834102b-47b9-4811-abf3-d1918a32dcf9",
                created_at: new Date(),
                photo_url: null,
                bio: "New student account ",

            },
            {
                firebase_uid: "CPirpalICedDPxAGeFbhSXrrQpy2",
                email: "kavishkagayashandesilva@gmail.com",
                name: "Kavishka Gayashan De Silva",
                role: "student",
                id: "1b821dae-04da-4d7c-82b7-a66d447523d2",
                created_at: new Date(),
                photo_url: "https://lh3.googleusercontent.com/a/ACg8ocKbe-55zJNIlj5KsEIW0JliQzwi07_0_7Q_qqXMKuiWSvvB5Q=s96-c",
                bio: "New student account ",
            },
            {
                firebase_uid: "8ixOoFjqn6VUVg47buGfPCo3q3U2",
                email: "thamara@gmail.com",
                name: "Thamara Gurasekara",
                role: "Individual",
                id: "6a8099ba-59be-43a0-8d7e-43a1c573129d",
                created_at: new Date(),
                photo_url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop&crop=center",
                bio: "New Individual account ",

            },
            {
                firebase_uid: "3pNi33YUJ0dL7j4LKCdQeSlxTyA3",
                email: "agith@gmail.com",
                name: "Ajith Perera",
                role: "Individual",
                id: "f4832651-f7ff-4466-a19a-87d83f27223e",
                created_at: new Date(),
                photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
                bio: "New Individual account ",
            }
        ]
    })

    // Seed Subjects
    await prisma.subjects.createMany({
        data: [
            { name: 'Mathematics' },
            { name: 'Physics' },
            { name: 'Chemistry' },
            { name: 'Biology' },
            { name: 'Computer Science' },
            { name: 'English Literature' },
            { name: 'History' },
            { name: 'Geography' },
            { name: 'Economics' },
            { name: 'Psychology' },
            { name: 'Career Guidance' }
        ]
    })

    // Get the created subjects to use their IDs for titles
    const subjects = await prisma.subjects.findMany();
    const subjectMap: { [key: string]: string } = {};
    subjects.forEach(subject => {
        if (subject.name) {
            subjectMap[subject.name] = subject.sub_id;
        }
    });

    // Seed Titles for each subject
    await prisma.titles.createMany({
        data: [
            // Mathematics titles
            { name: 'Algebra', sub_id: subjectMap['Mathematics'] },
            { name: 'Calculus', sub_id: subjectMap['Mathematics'] },
            { name: 'Geometry', sub_id: subjectMap['Mathematics'] },
            { name: 'Statistics', sub_id: subjectMap['Mathematics'] },
            { name: 'Trigonometry', sub_id: subjectMap['Mathematics'] },
            
            // Physics titles
            { name: 'Mechanics', sub_id: subjectMap['Physics'] },
            { name: 'Thermodynamics', sub_id: subjectMap['Physics'] },
            { name: 'Electromagnetism', sub_id: subjectMap['Physics'] },
            { name: 'Optics', sub_id: subjectMap['Physics'] },
            { name: 'Quantum Physics', sub_id: subjectMap['Physics'] },
            
            // Chemistry titles
            { name: 'Organic Chemistry', sub_id: subjectMap['Chemistry'] },
            { name: 'Inorganic Chemistry', sub_id: subjectMap['Chemistry'] },
            { name: 'Physical Chemistry', sub_id: subjectMap['Chemistry'] },
            { name: 'Analytical Chemistry', sub_id: subjectMap['Chemistry'] },
            
            // Biology titles
            { name: 'Cell Biology', sub_id: subjectMap['Biology'] },
            { name: 'Genetics', sub_id: subjectMap['Biology'] },
            { name: 'Ecology', sub_id: subjectMap['Biology'] },
            { name: 'Human Anatomy', sub_id: subjectMap['Biology'] },
            { name: 'Microbiology', sub_id: subjectMap['Biology'] },
            
            // Computer Science titles
            { name: 'Programming Fundamentals', sub_id: subjectMap['Computer Science'] },
            { name: 'Data Structures', sub_id: subjectMap['Computer Science'] },
            { name: 'Algorithms', sub_id: subjectMap['Computer Science'] },
            { name: 'Web Development', sub_id: subjectMap['Computer Science'] },
            { name: 'Database Management', sub_id: subjectMap['Computer Science'] },
            
            // English Literature titles
            { name: 'Poetry Analysis', sub_id: subjectMap['English Literature'] },
            { name: 'Novel Studies', sub_id: subjectMap['English Literature'] },
            { name: 'Drama and Theatre', sub_id: subjectMap['English Literature'] },
            { name: 'Creative Writing', sub_id: subjectMap['English Literature'] },
            
            // History titles
            { name: 'World History', sub_id: subjectMap['History'] },
            { name: 'Ancient Civilizations', sub_id: subjectMap['History'] },
            { name: 'Modern History', sub_id: subjectMap['History'] },
            { name: 'Political History', sub_id: subjectMap['History'] },
            
            // Geography titles
            { name: 'Physical Geography', sub_id: subjectMap['Geography'] },
            { name: 'Human Geography', sub_id: subjectMap['Geography'] },
            { name: 'Environmental Geography', sub_id: subjectMap['Geography'] },
            { name: 'Cartography', sub_id: subjectMap['Geography'] },
            
            // Economics titles
            { name: 'Microeconomics', sub_id: subjectMap['Economics'] },
            { name: 'Macroeconomics', sub_id: subjectMap['Economics'] },
            { name: 'International Economics', sub_id: subjectMap['Economics'] },
            { name: 'Development Economics', sub_id: subjectMap['Economics'] },
            
            // Psychology titles
            { name: 'Cognitive Psychology', sub_id: subjectMap['Psychology'] },
            { name: 'Developmental Psychology', sub_id: subjectMap['Psychology'] },
            { name: 'Social Psychology', sub_id: subjectMap['Psychology'] },
            { name: 'Clinical Psychology', sub_id: subjectMap['Psychology'] },
            
            // Career Guidance titles
            { name: 'University Admission', sub_id: subjectMap['Career Guidance'] },
            { name: 'Job Interview Skills', sub_id: subjectMap['Career Guidance'] },
            { name: 'Resume Writing', sub_id: subjectMap['Career Guidance'] },
            { name: 'Career Planning', sub_id: subjectMap['Career Guidance'] }
        ]
    })

    await prisma.individual_Tutor.createMany({
        data: [
            {
                i_tutor_id:"93e62aef-2762-4b11-beaf-c0cf73ad7084",
                user_id:"f4832651-f7ff-4466-a19a-87d83f27223e",
                subjects: ["Mathematics","Physics"],
                titles: ["Algebra","Calculus","Thermodynamics","Electromagnetism"],
                description: "Qualified tutor with B.Sc. degrees in Physics and Mathematics, passionate about simplifying complex topics. Combines patience, adaptability, and clear communication to tailor lessons to each student’s needs. Helps learners build strong foundations, improve problem-solving skills, and gain confidence in Mathematics and Physics for exams, coursework, or competitive tests.",
                heading:"A Maths and Physics Tutor with 10+ experience ",
                rating: 4.5,
                hourly_rate: 2000
            },
            {
                i_tutor_id:"a483bd73-046f-4262-a6ae-8a669309cc9d",
                user_id:"6a8099ba-59be-43a0-8d7e-43a1c573129d",
                subjects: ["Music"],
                titles: ["Piano Playing","Voice Training"],
                description: "Qualified tutor with a B.A. in Music (or related degree), skilled in guiding students through theory, performance, and composition. Combines patience, creativity, and clear instruction to tailor lessons to each learner’s goals and skill level. Helps students build strong technical skills, deepen musical understanding, and develop confidence for performances, exams, or personal growth.",
                heading:"Come to learn about Music,I will guide you",
                rating: 3.2,
                hourly_rate: 1000
            }
        ]
    })

    
}


main().then(() => console.log("Seeding completed successfully"))
.catch(e => {
    console.error("Error during seeding:", e);
    process.exit(1);
})
.finally(async () => {
    await prisma.$disconnect();
});