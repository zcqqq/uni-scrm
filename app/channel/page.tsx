"use client";

import { Card, Col, Row, ConfigProvider, theme, Layout, Tabs } from 'antd';
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import Index from '../index';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { generateClient } from 'aws-amplify/data';
import { FileUploader } from '@aws-amplify/ui-react-storage';
import { uploadData } from 'aws-amplify/storage';
import { getCurrentUser } from 'aws-amplify/auth';
import { backend } from './backend';
import Link from 'next/link'


const { Header } = Layout;
const { Meta } = Card;
const Channel: React.FC = () => {
  const [channels, setChannels] = useState<any[]>([]);

  useEffect(() => {    
    const getChannels = async () => {
      const data = await backend.fetchChannels();
      setChannels(data);
    };

    getChannels();
  }, []);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const tiktokAuthUrl = `https://www.tiktok.com/v2/auth/authorize/?` +
    `client_key=sbawqxclmj4epo0txj` +
    `&response_type=code` +
    `&scope=user.info.basic,user.info.profile,user.info.stats,video.list,video.publish,video.upload` +
    `&redirect_uri=https://imh484s1bh.execute-api.us-east-1.amazonaws.com/tiktok` +
    `&state=0`;

  return (
    <Layout hasSider>
      <Index />
      <Layout style={{ marginLeft: 200 }}>
        <Header style={{ padding: 0, background: colorBgContainer }} />
        <Tabs
          items={[
            {
              key: 'CONNECTED',
              label: i18n.t('channel:tabs.connected'),
              children: (
                <Row gutter={36}>
                  {channels.map((channel) => (
                    <Col span={4} key={channel.id}>
                      <Card 
                        bordered={true} 
                        cover={
                          <img 
                            src="/asset/logo/tiktok.png"
                          />
                        }
                        actions={[
                          <Link 
                            key="channelTiktok" 
                            href={`/channel/tiktok/${channel.id}`}
                          >
                            <SettingOutlined />
                          </Link>
                        ]}
                      >
                        <Meta title={channel.channel_name} style={{ textAlign: 'center' }} />
                      </Card>
                    </Col>
                  ))}
                </Row>
              ),
            },
            {
              key: 'CREATE',
              label: i18n.t('channel:tabs.create'),
              children: (
                <Row gutter={36}>
                 <Col span={4}>
                    <Card 
                      bordered={true} 
                      cover={
                        <img 
                          src="/asset/logo/tiktok.png" 
                        />
                      }
                      actions={[<SettingOutlined key="connectTiktok" onClick={() => window.open(tiktokAuthUrl, '_blank')} />]}
                    >
                      <Meta title={i18n.t('channel:tiktok.channelType')} style={{ textAlign: 'center' }} />
                    </Card>
                  </Col>
                  <Col span={4}>
                    <Card 
                      bordered={true} 
                      cover={
                        <img 
                          src="/asset/logo/douyin.svg" 
                        />
                      }
                      actions={[<SettingOutlined key="connectTiktok" onClick={() => window.open(tiktokAuthUrl, '_blank')} />]}
                    >
                      <Meta title={i18n.t('channel:douyin.channelType')} style={{ textAlign: 'center' }} />
                    </Card>
                  </Col>
                  <Col span={4}>
                    <Card 
                      bordered={true} 
                      cover={
                        <img 
                          src="/asset/logo/weixin.png" 
                        />
                      }
                      actions={[<SettingOutlined key="connectWeixin" onClick={() => window.open('https://baidu.com', '_blank')}
                      />]}
                    >
                      <Meta title={i18n.t('channel:weixin.channelType')} style={{ textAlign: 'center' }} />
                    </Card>
                  </Col>
                  <Col span={4}>
                    <Card 
                      bordered={true} 
                      cover={
                        <img 
                          src="/asset/logo/weixinwork.png" 
                        />
                      }
                      actions={[<SettingOutlined key="connectWeixinWork" onClick={() => window.open('https://baidu.com', '_blank')}
                      />]}
                    >
                      <Meta title={i18n.t('channel:weixinwork.channelType')} style={{ textAlign: 'center' }} />
                    </Card>
                  </Col>
                </Row>
              ),
            },
          ]}
        />
      </Layout>
    </Layout>
  )
};

export default Channel;