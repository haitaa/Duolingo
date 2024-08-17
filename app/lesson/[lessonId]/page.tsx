import { redirect } from "next/navigation";

import { getLesson, getUserProgress, getUserSubscription } from "@/db/queries";
import Quiz from "../quiz";

type Props = {
    params: {
        lessonId: number;
    };
};

const LessonIdPage = async ({ params }: Props) => {
    const lessonData = await getLesson(params.lessonId);
    const userProgressData = await getUserProgress();
    const userSubsciptionData = await getUserSubscription();

    const [lesson, userProgress, userSubsciption] = await Promise.all([
        lessonData,
        userProgressData,
        userSubsciptionData,
    ]);

    if (!lesson || !userProgress) {
        redirect("/learn");
    }

    const initialPercentage =
        (lesson.challenges.filter((challenge) => challenge.completed).length /
            lesson.challenges.length) *
        100;

    return (
        <Quiz
            initialLessonId={lesson.id}
            initialLessonChallenges={lesson.challenges}
            initialHearts={userProgress.hearts}
            initialPercentage={initialPercentage}
            userSubscription={userSubsciption}
        />
    );
};

export default LessonIdPage;
