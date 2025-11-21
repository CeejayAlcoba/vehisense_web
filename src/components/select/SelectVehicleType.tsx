import { Form, FormItemProps, Select } from "antd";
import { DefaultOptionType } from "antd/es/select";

type SelectVehicleTypeProps = {
  name: string;
  label?: string;
  rules?: { required: boolean; message: string }[];
  onChange?:
    | ((
        value: any,
        option?: DefaultOptionType | DefaultOptionType[] | undefined
      ) => void)
    | undefined;
} & FormItemProps;

export default function SelectVehicleType({
  onChange,
  ...props
}: SelectVehicleTypeProps) {
  return (
    <Form.Item {...props}>
      <Select onChange={onChange}>
        <Select.Option value="Car">Car</Select.Option>
        <Select.Option value="Motorcycle">Motorcycle</Select.Option>
        <Select.Option value="Tricycle">Tricycle</Select.Option>
        <Select.Option value="Truck">Truck</Select.Option>
        <Select.Option value="Other">Other</Select.Option>
      </Select>
    </Form.Item>
  );
}
