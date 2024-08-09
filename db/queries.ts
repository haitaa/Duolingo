import { cache } from "react"
import db from "./drizzle"
import { auth } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm";
import { courses, units, userProgress, challenges, challengesProgress, lessons } from "@/db/schema";

export const getUserProgress = cache(async () => {
    const { userId } = await auth();

    if(!userId) {
        return null;
    }
    
    const data = await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, userId),
        with: {
            activeCourse: true,
        },
    })

    return data;
})

export const getUnits = cache(async () => {
    const userProgress = await getUserProgress();

    if (!userProgress?.activeCoursesId) {
        return [];
    }

    const data = await db.query.units.findMany({
        where: eq(units.course_id, userProgress.activeCoursesId),
        with: {
            lessons: {
                with: {
                    challenges: {
                        with: {
                            challengesProgress: true,
                        }
                    }
                },
            },
        }
    })

    const normalizedData = data.map((unit) => { // data dizisindeki her birimi işlemek için map fonksiyonu kullanılıyor.
    
        // Her bir dersin tamamlanma durumunu belirlemek için lessons üzerinde map işlemi yapılıyor.
        const lessonsWithCompletedStatus = unit.lessons.map((lesson) => {
    
            // Tüm zorlukların tamamlanıp tamamlanmadığını kontrol etmek için challenges üzerinde every işlemi yapılıyor.
            const allCompletedChallenges = lesson.challenges.every((challenge) => {
    
                // Zorluğun ilerleme durumunu kontrol ediyor:
                // - challenge.challengesProgress mevcut mu?
                // - challenge.challengesProgress dizisinde en az bir ilerleme kaydı var mı?
                // - challenge.challengesProgress'teki her ilerleme kaydı completed mı (tamamlanmış mı)?
                return challenge.challengesProgress 
                    && challenge.challengesProgress.length > 0 
                    && challenge.challengesProgress.every((progress) => progress.completed);
            })
    
            // Dersin mevcut özelliklerini kopyalar ve completed özelliğini ekleyerek geri döner.
            // Eğer allCompletedChallenges true ise, dersin tüm zorlukları tamamlanmış demektir.
            return { ...lesson, completed: allCompletedChallenges }
        })
    
        // Burada lessonsWithCompletedStatus ile işlenmiş dersler birime eklenmiş olmalı (eksik kısmı tamamlamak için)
        // Normalde burada lessonsWithCompletedStatus kullanılarak işlenmiş dersler birime eklenir ve geri döndürülür.
        return { ...unit, lessons: lessonsWithCompletedStatus}
    }); 

    return normalizedData;
});

export const getCourses = cache(async () => {
    const data = await db.query.courses.findMany()

    return data;
})

export const getCourseById = cache(async (courseId: number) => {
    const data = await db.query.courses.findFirst({
        where: eq(courses.id, courseId)
    })

    return data;
})