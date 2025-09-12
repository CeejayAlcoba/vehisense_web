
import { Layout, Button, Dropdown, Menu, Avatar } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined, UserOutlined, SettingOutlined, LogoutOutlined } from "@ant-design/icons";
import useUserContext, { UserContext } from "../useUserContext";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;

interface AppHeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function HeaderLayout(props:AppHeaderProps){
  const navigate = useNavigate();
  const {collapsed,setCollapsed} =props;
  const {user} =useUserContext();
 const {setUser}=useUserContext();
 const showLogoutConfirm = () => {
  Swal.fire({
    title: "Are you sure?",
    text: "You want to logout.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Logout"
  }).then((result) => {
    if (result.isConfirmed) {
      setUser(null)
      localStorage.clear();
    }
  });
};

const handleMenuClick = ({ key }: { key: string }) => {
  if (key === "logout") {
    showLogoutConfirm();
  } else if (key === "settings") {
    navigate("/profile")
  }
};


  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Settings
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} danger>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Header
      style={{
        padding: "0 16px",
        background: "#fff",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{
          fontSize: "16px",
          width: 64,
          height: 64,
        }}
      />
      <div>
      <strong className="p-2">{user?.username}</strong>
      <Dropdown overlay={menu} trigger={["click"]}>
        <Avatar style={{ cursor: "pointer" }} icon={<UserOutlined />} />
      </Dropdown>
      </div>
     
    </Header>
  );
};
