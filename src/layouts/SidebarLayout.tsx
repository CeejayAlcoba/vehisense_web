import { Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";

import {
    MenuClickEventHandler,
  } from "rc-menu/lib/interface";
import { useLocation, useNavigate } from "react-router-dom";
type SidebarLayoutProps={
    collapsed:boolean
}

export type MenuItem = {
    key: React.Key;
    icon?: React.ReactNode;
    label: React.ReactNode;
    children?: MenuItem[];
    path?: string;
    onClick?: MenuClickEventHandler;
  };
  
  export const sidebarItems: MenuItem[] = [
    {
      key: "1",
      icon: <PieChartOutlined />,
      label: "Dashboard",
      path: "/",
    },
    {
      key: "2",
      icon: <DesktopOutlined />,
      label: "Monitoring Today",
      path: "/monitoring",
    },
    {
        key: "3",
        icon: <TeamOutlined />,
        label: "Vehicle",
        path: "/vehicle-management",
      },
  //   {
  //     key: "sub1",
  //     icon: <UserOutlined />,
  //     label: "User",
  //     children: [
  //       {
  //         key: "3",
  //         label: "Tom",
  //       },
  //       {
  //         key: "4",
  //         label: "Bill",
  //       },
  //       {
  //         key: "5",
  //         label: "Alex",
  //       },
  //     ],
  //   },
  //   {
  //     key: "sub2",
  //     icon: <TeamOutlined />,
  //     label: "Team",
  //     children: [
  //       {
  //         key: "6",
  //         label: "Team 1",
  //       },
  //       {
  //         key: "8",
  //         label: "Team 2",
  //       },
  //     ],
  //   },
  //   {
  //     key: "9",
  //     icon: <FileOutlined />,
  //     label: "Files",
  //   },
  ];
 
  export const getActiveMenu=(items:MenuItem[])=>{
    const location = useLocation();
    return items.find(i=>i.path==location.pathname); 
  }
export default function SidebarLayout(props :SidebarLayoutProps){
    const navigate = useNavigate();
    const itemsWithPath = sidebarItems.map((i) => ({
        ...i,
        onClick: () => {
          if (!i.path) return;
          navigate(i.path);
        },
      }));
    const {collapsed} = props;
    const activeMenu = getActiveMenu(itemsWithPath);
    return(
        <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" />
        <Menu
            mode="inline"
            defaultSelectedKeys={[activeMenu?.key.toString() ??""]}
            items={itemsWithPath}
        />
    </Sider>
    )
}