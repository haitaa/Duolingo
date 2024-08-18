import {
    Datagrid,
    List,
    TextField,
    ReferenceField,
    NumberField,
} from "react-admin";

export const LessonList = () => {
    return (
        <List>
            <Datagrid rowClick="edit">
                <TextField source="id" />
                <TextField source="title" />
                <ReferenceField source="unitId" reference="units" label="Units">
                    <TextField source="title" />
                </ReferenceField>
                <NumberField source="order" />
            </Datagrid>
        </List>
    );
};
