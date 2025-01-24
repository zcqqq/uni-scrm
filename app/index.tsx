// pages/index.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentUser } from 'aws-amplify/auth';
import { Flex, Menu, Image } from 'antd';
import type { MenuProps } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { HomeOutlined, UserOutlined, TeamOutlined, TagOutlined, ReadOutlined, CommentOutlined, SubnodeOutlined, SettingOutlined } from '@ant-design/icons';
import i18next from './i18n';

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
      getItem(i18next.t('menu.content'), '/content', <ReadOutlined/>, [
        getItem(i18next.t('menu.content.image'), '/content/image', null),
        getItem(i18next.t('menu.content.text'), '/content/text', null),
        getItem(i18next.t('menu.content.video'), '/content/video', null)
      ]),
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
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    // Get current path from window location
    const path = window.location.pathname;
    setCurrent(path);

    // Split path into segments and build parent paths
    const pathSegments = path.split('/').filter(Boolean);
    const parentKeys = pathSegments.reduce((acc: string[], curr: string, index: number) => {
      const parentPath = '/' + pathSegments.slice(0, index + 1).join('/');
      acc.push(parentPath);
      return acc;
    }, []);
    
    // Remove the last key (current page) to get parent menu keys
    setOpenKeys(parentKeys.slice(0, -1));
  }, []);

  const onClick: MenuProps['onClick'] = (e) => {
    setCurrent(e.key);
  };

  const onOpenChange: MenuProps['onOpenChange'] = (keys) => {
    setOpenKeys(keys);
  };

  return (
    <Sider>
      <Menu
        onClick={onClick}
        selectedKeys={[current]}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
        mode='inline'
        items={items}
      />
    </Sider>
  );
};

export default Index;