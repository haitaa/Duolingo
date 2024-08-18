import {
    SimpleForm,
    Create,
    TextInput,
    ReferenceInput,
    NumberInput,
    SelectInput,
    required,
} from "react-admin";

export const LessonCreate = () => {
    return (
        <Create>
            <SimpleForm>
                <TextInput
                    source="title"
                    validate={[required()]}
                    label="Title"
                />
                <ReferenceInput source="unitId" reference="units" label="Units">
                    <SelectInput optionText={"title"} />
                </ReferenceInput>
                <NumberInput
                    source="order"
                    validate={[required()]}
                    label="Order"
                />
            </SimpleForm>
        </Create>
    );
};
