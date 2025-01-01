// pages/index.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentUser } from 'aws-amplify/auth';
import { Flex, Menu, Image } from 'antd';
import type { MenuProps } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { HomeOutlined, UserOutlined, TeamOutlined, TagOutlined, ReadOutlined, CommentOutlined, SubnodeOutlined, SettingOutlined } from '@ant-design/icons';
import i18next from './i18n';
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs);

const Index: React.FC = () => {
  type MenuItem = Required<MenuProps>['items'][number];
  
  function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: 'group',
  ): MenuItem {
    const itemLabel = children ? label : <Link href={key.toString()}>{label}</Link>;
    return { key, icon, children, label: itemLabel, type } as MenuItem;
  }

  const items: MenuProps['items'] = [
    getItem(i18next.t('menu.home'), '/channel', <HomeOutlined />),
    getItem(i18next.t('menu.marketing'), '/marketing', null, [
      getItem(i18next.t('menu.content'), '/content', <ReadOutlined/>),
      getItem(i18next.t('menu.strategy'), '/strategy', <SubnodeOutlined/>),
      getItem(i18next.t('menu.audience'), '/audience', <CommentOutlined/>)
    ], 'group'),
    getItem(i18next.t('menu.data'), '/data', null, [
      getItem(i18next.t('menu.customer'), '/customer', <UserOutlined/>),
      getItem(i18next.t('menu.group'), '/group', <TeamOutlined/>),
      getItem(i18next.t('menu.tag'), '/tag', <TagOutlined/>)
    ], 'group'),
  ];

  const [loginId, setLoginId] = useState(String);
  useEffect(() => {
    const fetchLoginId = async () => {
      try {
        const { signInDetails } = await getCurrentUser();
        const id = signInDetails?.loginId ?? '';
        setLoginId(id);
      } catch (error) {
        console.error(error);
      }
    };
    fetchLoginId();
  }, []);

  const [current, setCurrent] = useState('');

  const onClick: MenuProps['onClick'] = (e) => {
    setCurrent(e.key);
  };

  return (
    <Sider style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0 }}>
      <Menu
        style={{ height: '100%', borderRight: 0, width: '100%' }}
        onClick={onClick}
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['sub1']}
        mode='inline'
        items={items}
      />
    </Sider>
  );
};

export default Index;