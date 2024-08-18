import {
    Edit,
    required,
    SimpleForm,
    TextInput,
    ReferenceInput,
    NumberInput,
} from "react-admin";

export const UnitEdit = () => {
    return (
        <Edit>
            <SimpleForm>
                <TextInput source="id" validate={[required()]} label="id" />
                <TextInput
                    source="title"
                    validate={[required()]}
                    label="Title"
                />
                <TextInput
                    source="description"
                    validate={[required()]}
                    label="Description"
                />
                <ReferenceInput source="courseId" reference="courses" />
                <NumberInput
                    source="order"
                    label="Order"
                    validate={[required()]}
                />
            </SimpleForm>
        </Edit>
    );
};
