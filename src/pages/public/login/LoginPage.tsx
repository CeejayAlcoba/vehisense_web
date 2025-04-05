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
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import "./Login.css"; // We'll create this next
import { LoginPayload } from "../../../types/Login";
import useUserContext from "../../../useUserContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import _accountService from "../../../services/accounservice";

const LoginPage = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const { token } = theme.useToken();
  const { setUser } = useUserContext();
  const navigate = useNavigate();
  const onFinish = async (values: any) => {
    try {
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
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-header">
          <Tag bordered={false}>Welcome Back</Tag>
          <h2 style={{ color: token.colorPrimary }}>Welcome Back</h2>
          <p>Please login to your account</p>
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
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
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

            <a className="login-form-forgot" href="#">
              Forgot password?
            </a>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              size="large"
              block
            >
              Log in
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
