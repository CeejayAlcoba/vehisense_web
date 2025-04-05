import React, { useState } from "react";
import { Breadcrumb, Layout,  theme } from "antd";
import { Outlet, useLocation } from "react-router-dom";
import HeaderLayout from "./HeaderLayout";
import SidebarLayout, { getActiveMenu, sidebarItems } from "./SidebarLayout";
import Title from "antd/es/typography/Title";

const { Content } = Layout;


export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
 
  const activeMenu = getActiveMenu(sidebarItems)
  return (
    <Layout style={{ height: "100vh" }}>
      <SidebarLayout collapsed={collapsed} />
      <Layout>
        <HeaderLayout setCollapsed={setCollapsed} collapsed={collapsed} />
        <Content
          style={{
            overflowY: "auto",
            padding: 20,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >

          {activeMenu?.label && (
            <Title level={4} style={{ marginBottom: 24 }}>
              {activeMenu?.label}
            </Title>
          )}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
