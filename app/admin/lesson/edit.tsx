import {
    SimpleForm,
    Edit,
    TextInput,
    ReferenceInput,
    NumberInput,
    required,
    SelectInput,
} from "react-admin";

export const LessonEdit = () => {
    return (
        <Edit>
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
        </Edit>
    );
};
