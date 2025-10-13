// import { Menu } from "antd";
// import Sider from "antd/es/layout/Sider";
// import {
//   DesktopOutlined,
//   FileOutlined,
//   PieChartOutlined,
//   TeamOutlined,
//   UserOutlined,
// } from "@ant-design/icons";

// import { MenuClickEventHandler } from "rc-menu/lib/interface";
// import { useLocation, useNavigate } from "react-router-dom";
// type SidebarLayoutProps = {
//   collapsed: boolean;
// };

// export type MenuItem = {
//   key: React.Key;
//   icon?: React.ReactNode;
//   label: React.ReactNode;
//   children?: MenuItem[];
//   path?: string;
//   onClick?: MenuClickEventHandler;
// };

// export const sidebarItems: MenuItem[] = [
//   {
//     key: "1",
//     icon: <PieChartOutlined />,
//     label: "Dashboard",
//     path: "/",
//   },
//   {
//     key: "2",
//     icon: <DesktopOutlined />,
//     label: "Monitoring Today",
//     path: "/monitoring",
//   },
//   {
//     key: "3",
//     icon: <TeamOutlined />,
//     label: "Register Vehicle",
//     path: "/vehicle-management",
//   },
//   {
//     key: "4",
//     icon: <TeamOutlined />,
//     label: "Black Listed",
//     path: "/black-listed",
//   },
//   {
//     key: "5",
//     icon: <TeamOutlined />,
//     label: "Sidebar",
//     path: "/sidebar",
//   },
//    {
//     key: "6",
//     icon: <TeamOutlined />,
//     label: "Role",
//     path: "/role",
//   },
//   //   {
//   //     key: "sub1",
//   //     icon: <UserOutlined />,
//   //     label: "User",
//   //     children: [
//   //       {
//   //         key: "3",
//   //         label: "Tom",
//   //       },
//   //       {
//   //         key: "4",
//   //         label: "Bill",
//   //       },
//   //       {
//   //         key: "5",
//   //         label: "Alex",
//   //       },
//   //     ],
//   //   },
//   //   {
//   //     key: "sub2",
//   //     icon: <TeamOutlined />,
//   //     label: "Team",
//   //     children: [
//   //       {
//   //         key: "6",
//   //         label: "Team 1",
//   //       },
//   //       {
//   //         key: "8",
//   //         label: "Team 2",
//   //       },
//   //     ],
//   //   },
//   //   {
//   //     key: "9",
//   //     icon: <FileOutlined />,
//   //     label: "Files",
//   //   },
// ];

// export const getActiveMenu = (items: MenuItem[]) => {
//   const location = useLocation();
//   return items.find((i) => i.path == location.pathname);
// };
// export default function SidebarLayout(props: SidebarLayoutProps) {
//   const navigate = useNavigate();
//   const itemsWithPath = sidebarItems.map((i) => ({
//     ...i,
//     onClick: () => {
//       if (!i.path) return;
//       navigate(i.path);
//     },
//   }));
//   const { collapsed } = props;
//   const activeMenu = getActiveMenu(itemsWithPath);
//   return (
//     <Sider trigger={null} collapsible collapsed={collapsed}>
//       <div className="demo-logo-vertical" />
//       <Menu
//         mode="inline"
//         defaultSelectedKeys={[activeMenu?.key.toString() ?? ""]}
//         items={itemsWithPath}
//       />
//     </Sider>
//   );
// }

import { Menu, Spin } from "antd";
import Sider from "antd/es/layout/Sider";
import {
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";

import { MenuClickEventHandler } from "rc-menu/lib/interface";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import _sidebarService from "../services/sidebarService";
import { Sidebar } from "../types/Sidebar";
import AntIcon from "../components/antIcon/AntIcon";
type SidebarLayoutProps = {
  collapsed: boolean;
};

export type MenuItem = {
  key: React.Key;
  icon?: React.ReactNode;
  label: React.ReactNode;
  children?: MenuItem[];
  path?: string;
  onClick?: MenuClickEventHandler;
};

export const sidebarItems2: MenuItem[] = [
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
    label: "Register Vehicle",
    path: "/vehicle-management",
  },
  {
    key: "4",
    icon: <TeamOutlined />,
    label: "Black Listed",
    path: "/black-listed",
  },
  {
    key: "5",
    icon: <TeamOutlined />,
    label: "Sidebar",
    path: "/sidebar",
  },
  {
    key: "6",
    icon: <TeamOutlined />,
    label: "Role",
    path: "/role",
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

export const getActiveMenu = (items: MenuItem[]) => {
  const location = useLocation();
  return items.find((i) => i.path == location.pathname);
};

export default function SidebarLayout(props: SidebarLayoutProps) {
  const { collapsed } = props;
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarItems, setSidebarItems] = useState<any[]>([]);

  
 useEffect(() => {
  const fetchSidebar = async () => {
    try {
      const data: Sidebar[] = await _sidebarService.getByRoleIdAsync();

      const mappedItems = data.map((sb) => {
        if (sb.name === "Flagged") {
          return {
            key: sb.id?.toString(),
            icon: <AntIcon icon={sb.antIcon} />,
            label: sb.name,
            children: [
              {
                key: `${sb.id}-blacklisted`,
                label: "Blacklisted",
                onClick: () => navigate("/blacklisted"),
              },
              {
                key: `${sb.id}-warninglist`,
                label: "Warning List",
                onClick: () => navigate("/warninglist"),
              },
            ],
          };
        }

        return {
          key: sb.id?.toString(),
          icon: <AntIcon icon={sb.antIcon} />,
          label: sb.name,
          onClick: () => {
            if (!sb.path) return;
            navigate(sb.path);
          },
        };
      });

      setSidebarItems(mappedItems);
    } catch (err) {
      console.error("Failed to load sidebar items:", err);
    }
  };

  fetchSidebar();
}, [navigate]);

  const activeKey = sidebarItems.find((i) => i.path === location.pathname)?.key;

  return (
    <Sider trigger={null} collapsible collapsed={collapsed}>
      <div className="demo-logo-vertical" />

      <Menu
        mode="inline"
        selectedKeys={activeKey ? [activeKey] : []}
        items={sidebarItems}
      />
    </Sider>
  );
}
