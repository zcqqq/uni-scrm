// pages/index.tsx
"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import { Flex, Menu, Image, Button } from 'antd';
import type { MenuProps } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { HomeOutlined, UserOutlined, TeamOutlined, TagOutlined, ReadOutlined, CommentOutlined, SubnodeOutlined, SettingOutlined } from '@ant-design/icons';
import i18next from './i18n';
import { useRouter } from "next/navigation";

const Index: React.FC = () => {
  type MenuItem = Required<MenuProps>['items'][number];

  function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[],
    type?: 'group',
    options?: { disabled?: boolean },
  ): MenuItem {
    const itemLabel = children || options?.disabled ? label : <Link href={key.toString()}>{label}</Link>;
    return {
      key,
      icon,
      children,
      label: itemLabel,
      type,
      disabled: options?.disabled
    } as MenuItem;
  }

  const items: MenuProps['items'] = [
    getItem(i18next.t('Menu.Home'), '/channel', <HomeOutlined />),
    getItem(i18next.t('Menu.Marketing'), '/marketing', null, [
      getItem(i18next.t('Menu.Content'), '/content', <ReadOutlined />, [
        getItem(i18next.t('Menu.Content.Image'), '/content/image', null),
        getItem(i18next.t('Menu.Content.Text'), '/content/text', <Image src='/asset/icon/coming_soon.svg' height={24} width={24} />, undefined, undefined, { disabled: true }),
        getItem(i18next.t('Menu.Content.Video'), '/content/video', null)
      ]),
      getItem(i18next.t('Menu.Strategy'), '/strategy', <Image src='/asset/icon/coming_soon.svg' height={24} width={24} />, undefined, undefined, { disabled: true }),
      getItem(i18next.t('Menu.Audience'), '/audience', <Image src='/asset/icon/coming_soon.svg' height={24} width={24} />, undefined, undefined, { disabled: true }),
    ], 'group'),
    getItem(i18next.t('Menu.Data'), '/data', null, [
      getItem(i18next.t('Menu.Customer'), '/customer', <Image src='/asset/icon/coming_soon.svg' height={24} width={24} />, undefined, undefined, { disabled: true }),
      getItem(i18next.t('Menu.Group'), '/group', <Image src='/asset/icon/coming_soon.svg' height={24} width={24} />, undefined, undefined, { disabled: true }),
      getItem(i18next.t('Menu.Tag'), '/tag', <Image src='/asset/icon/coming_soon.svg' height={24} width={24} />, undefined, undefined, { disabled: true }),
    ], 'group'),
    getItem(i18next.t('Menu.Setting'), '/personalization', <SettingOutlined />),
  ];

  const [loginId, setLoginId] = useState(String);
  const router = useRouter();
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
    <Sider style={{ height: '100%', position: 'fixed', left: 0, backgroundColor: '#ffffff' }}>
      <Menu
        onClick={onClick}
        selectedKeys={[current]}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
        mode='inline'
        items={items}
        style={{ 
          borderRight: 0,
          marginBottom: 0,  // Ensure no margin at bottom
          paddingBottom: 0  // Ensure no padding at bottom
        }}
      />
      <div style={{ 
        position: 'absolute', 
        bottom: 0, 
        width: '100%', 
        padding: '10px', 
        backgroundColor: '#ffffff' 
      }}>
        <Button
          type="default"
          style={{ width: '100%' }}
          onClick={async () => {
            await signOut();
            router.push("/login");
          }}
        >
          {i18next.t('Menu.SignOut')}
        </Button>
      </div>
    </Sider>
  );
};

export default Index;