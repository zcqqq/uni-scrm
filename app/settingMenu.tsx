// pages/index.tsx
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentUser } from 'aws-amplify/auth';
import { Flex, Menu, Image } from 'antd';
import type { MenuProps } from 'antd';
import Sider from 'antd/es/layout/Sider';
import { RobotOutlined, RollbackOutlined, SmileOutlined,UserOutlined, TeamOutlined, TagOutlined, ReadOutlined, CommentOutlined, SubnodeOutlined, SettingOutlined } from '@ant-design/icons';
import i18next from './i18n';

const SettingMenu: React.FC = () => {
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
      label: itemLabel, 
      key, 
      icon, 
      children, 
      type, 
      disabled: options?.disabled 
    } as MenuItem;
  }

  const items: MenuProps['items'] = [
    getItem(i18next.t('Setting:Menu.BackToHome'), '/channel', <RollbackOutlined />),
    getItem(i18next.t('Setting:Menu.Personalization'), '/personalization', <SmileOutlined />),
    getItem(i18next.t('Setting:Menu.Metadata'), '/metadata', null, [
      getItem(i18next.t('Setting:Metadata.CustomerAttributes'), '/metadata/customerAttributes', <Image src='/asset/icon/coming_soon.svg' height={24} width={24} />, undefined, undefined, { disabled: true }),
    ], 'group'),
    getItem(i18next.t('Setting:Menu.Configuration'), '/configuration', null, [
      getItem('AI '+i18next.t('Setting:Menu.Configuration'), '/configuration/ai', <RobotOutlined />),
      getItem(i18next.t('Setting:Billing.Billing'), '/configuration/billing', <Image src='/asset/icon/coming_soon.svg' height={24} width={24} />, undefined, undefined, { disabled: true }),
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
    <Sider style={{ height: '100%', position: 'fixed', left: 0 }}>
      <Menu
        onClick={onClick}
        selectedKeys={[current]}
        openKeys={openKeys}
        onOpenChange={onOpenChange}
        mode='inline'
        items={items}
        style={{ height: '100%', borderRight: 0 }}
      />
    </Sider>
  );
};

export default SettingMenu;