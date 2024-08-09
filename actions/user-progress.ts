"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

import db from "@/db/drizzle";
import { getCourseById, getUserProgress } from "@/db/queries";
import { userProgress } from "@/db/schema";
import { redirect } from "next/navigation";

export const upsertUserProgress = async (courseId: number) => {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
        throw new Error("Unauthorized");
    }

    const course = await getCourseById(courseId);
    console.log('course', course);

    if (!course) {
        throw new Error("Course not found!");
    }

    // TODO: Enable once units and lessons are added
    // if (!course.units.length || !course.units[0].lessons.length) {
    //     throw new Error("Course is empty");
    // }

    const existingUserProgress = await getUserProgress();

    if(existingUserProgress) {
        await db.update(userProgress).set({
            activeCoursesId: courseId,
            userName: user.firstName || "User",
            userImageSrc: user.imageUrl || "mascot.svg",
        })

        revalidatePath("/courses");
        revalidatePath("/learn");
        redirect("/learn");
    }

    await db.insert(userProgress).values({
        userId,
        activeCoursesId: courseId,
        userName: user.firstName || "User",
        userImageSrc: user.imageUrl || "mascot.svg",
    })

    revalidatePath("/courses");
    revalidatePath("/learn");
    redirect("/learn");
}