"use client";
import simpleRestProvider from "ra-data-simple-rest";
import { Admin, Resource } from "react-admin";

import { CourseList } from "./course/list";
import { CourseCreate } from "./course/create";
import { CourseEdit } from "./course/edit";
import { UnitList } from "./unit/list";
import { UnitCreate } from "./unit/create";
import { UnitEdit } from "./unit/edit";
import { LessonList } from "./lesson/list";
import { LessonCreate } from "./lesson/create";
import { LessonEdit } from "./lesson/edit";
import { ChallengeList } from "./challenge/list";
import { ChallengeCreate } from "./challenge/create";
import { ChallengeEdit } from "./challenge/edit";
import { ChallengeOptionList } from "./challengeOption/list";
import { ChallengeOptionEdit } from "./challengeOption/edit";
import { ChallengeOptionCreate } from "./challengeOption/create";

const dataProvider = simpleRestProvider("/api");

const App = () => {
    return (
        <Admin dataProvider={dataProvider}>
            <Resource
                name="courses"
                recordRepresentation={"title"}
                create={CourseCreate}
                list={CourseList}
                edit={CourseEdit}
            />
            <Resource
                name="units"
                recordRepresentation={"units"}
                list={UnitList}
                create={UnitCreate}
                edit={UnitEdit}
            />
            <Resource
                name="lessons"
                recordRepresentation={"lessons"}
                list={LessonList}
                create={LessonCreate}
                edit={LessonEdit}
            />
            <Resource
                name="challenges"
                recordRepresentation={"challenges"}
                list={ChallengeList}
                create={ChallengeCreate}
                edit={ChallengeEdit}
            />
            <Resource
                name="challengeOptions"
                recordRepresentation={"challengeOptions"}
                list={ChallengeOptionList}
                edit={ChallengeOptionEdit}
                create={ChallengeOptionCreate}
            />
        </Admin>
    );
};

export default App;
