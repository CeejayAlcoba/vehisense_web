import { Form, Input, Button, Card, message } from "antd";
import useUserContext from "../../../useUserContext";
import { ProfileEditDTO } from "../../../types/ProfileEditDTO";
import _meService from "../../../services/meService";
import { AxiosError } from "axios";

export default function ProfilePage() {
  const [form] = Form.useForm();
  const { user, setUser } = useUserContext();
  const onFinish = async (values: ProfileEditDTO) => {
    try {
      await _meService.Update(values);
      message.success("Profile updated successfully!");
      setUser({
        username: values.username,
        roleId: user?.roleId ?? 0,
        createdAt: user?.createdAt,
      });
    } catch (e: any) {
      const ex: AxiosError = e;

      const errorMessage =
        (ex.response?.data as any)?.message || "Failed to update profile.";

      message.error(errorMessage);
      console.error(ex);
    }
  };

  return (
    <Card title="Edit Profile" className="max-w-md mx-auto mt-6">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={
          user
            ? { ...user, currentPassword: null, newPassword: null }
            : {
                username: "",
                currentPassword: null,
                newPassword: null,
              }
        }
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Please enter your username!" }]}
        >
          <Input placeholder="Enter your username" />
        </Form.Item>

        <Form.Item
          name="currentPassword"
          label="Current Password"
          rules={[
            { required: true, message: "Please enter your current password!" },
          ]}
        >
          <Input.Password placeholder="Enter a current password" />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="New Password (optional)"
          rules={[]}
        >
          <Input.Password placeholder="Enter a new password (optional)" />
        </Form.Item>

        {/* Confirm New Password */}
        <Form.Item
          name="confirmNewPassword"
          label="Confirm New Password"
          dependencies={["newPassword"]}
          rules={[
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!getFieldValue("newPassword")) {
                  return Promise.resolve();
                }
                if (!value) {
                  return Promise.reject(
                    new Error("Please confirm your new password!")
                  );
                }
                if (value !== getFieldValue("newPassword")) {
                  return Promise.reject(
                    new Error("The new passwords do not match!")
                  );
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirm your new password" />
        </Form.Item>

        {/* Submit */}
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
