import { Form, Select } from "antd";

type SelectVehicleTypeProps = {
  name: string;
  label: string;
  rules: { required: boolean; message: string }[];
};

export default function SelectVehicleType(props: SelectVehicleTypeProps) {
  return (
    <Form.Item {...props}>
      <Select>
        <Select.Option value="Car">Car</Select.Option>
        <Select.Option value="Motorcycle">Motorcycle</Select.Option>
        <Select.Option value="Tricycle">Tricycle</Select.Option>
        <Select.Option value="Truck">Truck</Select.Option>
        <Select.Option value="Other">Other</Select.Option>
      </Select>
    </Form.Item>
  );
}
