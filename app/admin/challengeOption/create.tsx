import {
    SimpleForm,
    Create,
    TextInput,
    ReferenceInput,
    required,
    BooleanInput,
    SelectInput,
} from "react-admin";

export const ChallengeOptionCreate = () => {
    return (
        <Create>
            <SimpleForm>
                <TextInput source="text" validate={[required()]} label="Text" />
                <BooleanInput source="correct" label="Correct option" />
                <ReferenceInput source="challengeId" reference="challenges">
                    <SelectInput optionText="question" />
                </ReferenceInput>
                <TextInput source="imageSrc" label="Image URL" />
                <TextInput source="audioSrc" label="Audio URL" />
            </SimpleForm>
        </Create>
    );
};
