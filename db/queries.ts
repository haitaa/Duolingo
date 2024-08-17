import { cache } from "react"
import db from "./drizzle"
import { auth } from "@clerk/nextjs/server"
import { eq } from "drizzle-orm";
import { courses, units, userProgress, challenges, lessons, challengeProgress, userSubsciption } from "@/db/schema";

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
    const { userId } = await auth();
    const userProgress = await getUserProgress();

    if (!userId || !userProgress?.activeCourseId) {
        return [];
    }

    const data = await db.query.units.findMany({
        orderBy: (units, { asc }) => [asc(units.order)],
        where: eq(units.courseId, userProgress.activeCourseId),
        with: {
            lessons: {
                orderBy: (lessons, { asc }) => [asc(lessons.order)],
                with: {
                    challenges: {
                        orderBy: (challenges, { asc }) => [asc(challenges.order)],
                        with: {
                            challengeProgress: {
                                where: eq(challengeProgress.userId, userId)
                            },
                        }
                    }
                },
            },
        }
    })

    const normalizedData = data.map((unit) => { // data dizisindeki her birimi işlemek için map fonksiyonu kullanılıyor.
    
        // Her bir dersin tamamlanma durumunu belirlemek için lessons üzerinde map işlemi yapılıyor.
        const lessonsWithCompletedStatus = unit.lessons.map((lesson) => {

            if (lesson.challenges.length === 0) {
                return { ...lesson, completed: false}
            }
    
            // Tüm zorlukların tamamlanıp tamamlanmadığını kontrol etmek için challenges üzerinde every işlemi yapılıyor.
            const allCompletedChallenges = lesson.challenges.every((challenge) => {
    
                // Zorluğun ilerleme durumunu kontrol ediyor:
                // - challenge.challengesProgress mevcut mu?
                // - challenge.challengesProgress dizisinde en az bir ilerleme kaydı var mı?
                // - challenge.challengesProgress'teki her ilerleme kaydı completed mı (tamamlanmış mı)?
                return challenge.challengeProgress 
                    && challenge.challengeProgress.length > 0 
                    && challenge.challengeProgress.every((progress) => progress.completed);
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
        where: eq(courses.id, courseId),
        with: {
            units: {
                orderBy: (units, { asc }) => [asc(units.order)],
                with: {
                    lessons: {
                        orderBy: (lessons, { asc }) => [asc(lessons.order)]
                    }
                }
            }
        }
    })

    return data;
})

export const getCourseProgress = cache(async () => {
    const { userId } = await auth();
    const userProgress = await getUserProgress();

    if(!userId || !userProgress?.activeCourseId) {
        return null;
    }

    // Aktif kursun ID'sine sahip üniteleri, bu ünitelerdeki dersleri ve derslere bağlı zorlukları al
    const unitsInActiveCourse = await db.query.units.findMany({
        // Üniteleri sıralamak için 'orderBy' kullanılır (sıralama: artan)
        orderBy: (units, { asc }) => [asc(units.order)],
        
        // Aktif kurs kimliğine sahip üniteleri seç
        where: eq(units.courseId, userProgress.activeCourseId),
        
        // İlgili ünitelerin derslerini ve derslere bağlı zorlukları getir
        with: {
            lessons: {
                // Dersleri sıralamak için 'orderBy' kullanılır (sıralama: artan)
                orderBy: (lessons, { asc }) => [asc(lessons.order)],
                
                // Her dersin ait olduğu üniteyi ve derslere bağlı zorlukları getir
                with: {
                    unit: true,
                    challenges: {
                        with: {
                            challengeProgress: {
                                // Kullanıcıya ait zorluk ilerlemesini al
                                where: eq(challengeProgress.userId, userId),
                            },
                        },
                    },
                },
            },
        },
    });

    // Aktif kursta bulunan derslerden, tamamlanmamış ilk dersi bul
    const firstUncompletedLesson = unitsInActiveCourse
        .flatMap((unit) => unit.lessons) // Üniteler içindeki dersleri düz bir listeye çevirir
        .find((lesson) => {
            // Bir dersin zorlukları arasında, tamamlanmamış olan birini bulur
            return lesson.challenges.some((challenge) => {
                return !challenge.challengeProgress 
                || challenge.challengeProgress.length === 0
                || challenge.challengeProgress.some((progress) => progress.completed === false)
            });
        });

    // Bulunan ilk tamamlanmamış dersi ve dersin kimliğini döndür
    return {
        activeLesson: firstUncompletedLesson,
        activeLessonId: firstUncompletedLesson?.id,
    };
})


// Fonksiyon: Belirli bir dersi veya aktif dersi almak için kullanılan asenkron bir fonksiyon.
// Bu fonksiyon, veritabanından dersi ve bu derse bağlı zorlukları getirir.
export const getLesson = cache(async (id?: number) => {
    // Kullanıcı kimliğini al (kimlik doğrulama işlemi)
    const { userId } = await auth();

    // Eğer kullanıcı kimliği mevcut değilse, null döndür
    if (!userId) {
        return null;
    }

    // Kullanıcının kurs ilerlemesini al
    const courseProgress = await getCourseProgress();

    // Belirtilmiş bir ders ID'si varsa onu kullan, aksi takdirde aktif dersi kullan
    const lessonId = id || courseProgress?.activeLessonId;

    // Eğer ders ID'si yoksa, null döndür
    if (!lessonId) {
        return null;
    }

    // Belirtilen ders ID'sine sahip ilk dersi ve bu derse bağlı zorlukları al
    const data = await db.query.lessons.findFirst({
        // Ders ID'sine göre filtrele
        where: eq(lessons.id, lessonId),
        
        // Zorluklar ile birlikte getir (sıralama ve detayları ile)
        with: {
            challenges: {
                // Zorlukları sıralamak için 'orderBy' kullanılır (sıralama: artan)
                orderBy: (challenges, { asc }) => [asc(challenges.order)],
                
                // Her zorluğun seçeneklerini ve zorluk ilerlemesini getir
                with: {
                    challengeOptions: true,
                    challengeProgress: {
                        // Kullanıcıya ait zorluk ilerlemesini al
                        where: eq(challengeProgress.userId, userId),
                    },
                },
            },
        },
    });

    // Eğer veri veya zorluklar mevcut değilse, null döndür
    if (!data || !data.challenges) {
        return null;
    }

    // Zorlukları normalleştir ve tamamlanmış olup olmadığını belirle
    const normalizedChallenges = data.challenges.map((challenge) => {
        // Zorluk tamamlanmış mı kontrol et
        const completed = challenge.challengeProgress 
            && challenge.challengeProgress.length > 0
            && challenge.challengeProgress.every((progress) => progress.completed);

        // Zorluğu tamamlanmış bilgisi ile birlikte döndür
        return { ...challenge, completed: completed };
    });

    // Veriyi ve normalleştirilmiş zorlukları döndür
    return { ...data, challenges: normalizedChallenges };
});


export const getLessonPercentage = cache(async () => {
    const courseProgress = await getCourseProgress();

    if(!courseProgress?.activeLessonId) {
        return 0;
    }

    const lesson = await getLesson(courseProgress.activeLessonId);

    if(!lesson) {
        return 0;
    }

    const completedChallenges = lesson.challenges.filter((challenge) => challenge.completed);
    const percentage = Math.round((completedChallenges.length / lesson.challenges.length) * 100)

    return percentage;
})


const DAY_IN_MS = 86_400_000
export const getUserSubscription = cache(async () => {
    const { userId } = await auth();

    if(!userId) return null;

    const data = await db.query.userSubsciption.findFirst({
        where: eq(userSubsciption.userId, userId),
    })

    if (!data) return null;

    const isActive = data.stripePriceId && data.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();

    return {
        ...data, isActive: !!isActive,
    }
})


export const getTopTenUsers = cache(async () => {
    const { userId } = await auth();

    if(!userId) {
        return [];
    }

    const data = await db.query.userProgress.findMany({
        orderBy: (userProgress, { desc }) => [desc(userProgress.points)],
        limit: 10,
        columns: {
            userId: true,
            userName: true,
            userImageSrc: true,
            points: true,
        }
    })

    return data;
})