import React, { useEffect, useState } from "react";
import { Card, Form, InputNumber, Button, Spin, message } from "antd";
import { OverDueMinutes } from "../../../types/OverDueMinutes";
import _overDueMinutesService from "../../../services/overDueMinutesService";
const OverDueMinutesPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<OverDueMinutes | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await _overDueMinutesService.get();
      setData(response);
      form.setFieldValue("minutes", response.minutes);
    } catch (error) {
      message.error("Failed to fetch Overdue Minutes.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (!data) return;

      setSaving(true);
      await _overDueMinutesService.updateAsync(data.id, {
        ...data,
        minutes: values.minutes,
      });

      message.success("Overdue minutes updated successfully!");
    } catch (error) {
      message.error("Failed to update overdue minutes.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Card
      title="Overdue Minutes Settings"
      style={{ maxWidth: 400, margin: "40px auto" }}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin />
        </div>
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item
            name="minutes"
            label="Overdue Minutes"
            rules={[
              { required: true, message: "Please enter overdue minutes." },
            ]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" onClick={handleSave} loading={saving} block>
              Update
            </Button>
          </Form.Item>
        </Form>
      )}
    </Card>
  );
};

export default OverDueMinutesPage;
