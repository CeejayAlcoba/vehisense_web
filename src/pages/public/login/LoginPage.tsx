import {
  Form,
  Input,
  Button,
  Checkbox,
  Card,
  Divider,
  message,
  Alert,
  Tag,
  theme,
  Typography,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
  CarOutlined,
} from "@ant-design/icons";
import "./Login.css";
import { LoginPayload } from "../../../types/Login";
import useUserContext from "../../../useUserContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import _accountService from "../../../services/accounService";

const { Text, Link } = Typography;

const LoginPage = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = theme.useToken();
  const { setUser } = useUserContext();
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      setIsSubmitting(true);
      setErrorMessage("");
      const response = await _accountService.login(values as LoginPayload);
      if (!response.user) return;

      setUser(response.user);
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      navigate("/");
    } catch (err: any) {
      setErrorMessage(err.response?.data ?? err.message ?? "");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="login-container">
      <Card className="login-card" style={{ borderRadius: 16, padding: 32 }}>
        <div
          className="login-header"
          style={{ textAlign: "center", marginBottom: 24 }}
        >
          <Tag bordered={false} color="blue" style={{ fontSize: 16 }}>
            Welcome Back
          </Tag>
          <h2 style={{ color: token.colorPrimary }}>Sign in to Your Account</h2>
          <p style={{ color: token.colorTextSecondary }}>
            Please login to access your dashboard
          </p>
        </div>

        {errorMessage && (
          <Alert
            message={errorMessage}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form
          name="normal_login"
          className="login-form"
          initialValues={{ remember: true }}
          onFinish={async (value: any) => await onFinish(value)}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please input your Username!" }]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="Username"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please input your Password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined className="site-form-item-icon" />}
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>

            {/* <Link
              className="login-form-forgot"
              style={{ float: "right" }}
              href="#"
            >
              Forgot password?
            </Link> */}
          </Form.Item>

          <Form.Item>
            <Button
              loading={isSubmitting}
              type="primary"
              htmlType="submit"
              size="large"
              block
              style={{ borderRadius: 8 }}
            >
              Log in
            </Button>
          </Form.Item>
        </Form>

        <Divider>Or</Divider>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Button
            type="default"
            icon={<CarOutlined />}
            size="large"
            style={{ borderRadius: 8 }}
            onClick={() => navigate("/vehicle-registration")}
          >
            Go to Vehicle Registration
          </Button>
          <Text
            style={{
              display: "block",
              marginTop: 8,
              color: token.colorTextSecondary,
            }}
          >
            Want to register a vehicle?
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
