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
import { type Schema } from '@/amplify/data/resource';
import Link from 'next/link';

const { Header } = Layout;
const { Meta } = Card;

const cardStyle = {
  width: '100%',
  height: '100%'
};

const imageStyle = {
  width: '100%',
  height: '160px', // Fixed height for all images
  objectFit: 'contain' as const,
  padding: '20px'
};

const disabledIconStyle = {
  color: '#d9d9d9',
  cursor: 'not-allowed'
};

const client = generateClient<Schema>();
const Channel: React.FC = () => {
  const [channels, setChannels] = useState<any[]>([]);

  useEffect(() => {
    const getChannels = async () => {
      const {data} = await client.models.Channel.list({
        filter: { is_deleted: { eq: false } }, authMode: 'userPool'
    });
      setChannels(data);
    };

    getChannels();
  }, []);

  const tiktokAuthUrl = `https://www.tiktok.com/v2/auth/authorize/?` +
    `client_key=` + process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY +
    `&response_type=code` +
    `&scope=user.info.basic,user.info.profile,user.info.stats,video.list,video.publish,video.upload` +
    `&redirect_uri=` + process.env.NEXT_PUBLIC_CALLBACK_HOST + `/callback/tiktok` +
    `&state=0`;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Index />
      <Layout style={{ marginLeft: 200, minHeight: '100vh', padding: '24px' }}>
        <Tabs
          defaultActiveKey={channels.length === 0 ? 'CREATE' : 'CONNECTED'}
          items={[
            {
              key: 'CONNECTED',
              label: i18n.t('Channel:Tab.Existing'),
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
              label: i18n.t('Channel:Tab.New'),
              children: (
                <Row gutter={36}>
                  <Col span={4}>
                    <Card
                      bordered={true}
                      style={cardStyle}
                      cover={
                        <img
                          src="/asset/logo/tiktok.png"
                          style={imageStyle}
                        />
                      }
                      actions={[<SettingOutlined key="connectTiktok" onClick={() => window.location.href = tiktokAuthUrl} />]}
                    >
                      <Meta title={i18n.t('Channel:TIKTOK.ChannelType')} style={{ textAlign: 'center' }} />
                    </Card>
                  </Col>
                  <Col span={4}>
                    <Card
                      bordered={true}
                      style={cardStyle}
                      cover={
                        <img
                          src="/asset/logo/douyin.svg"
                          style={imageStyle}
                        />
                      }
                      actions={[
                        <SettingOutlined key="connectTiktok" style={disabledIconStyle} />                      ]}
                    >
                      <Meta title={i18n.t('Channel:DOUYIN.ChannelType')} style={{ textAlign: 'center' }} />
                    </Card>
                  </Col>
                  <Col span={4}>
                    <Card
                      bordered={true}
                      style={cardStyle}
                      cover={
                        <img
                          src="/asset/logo/weixin.png"
                          style={imageStyle}
                        />
                      }
                      actions={[<SettingOutlined key="connectWeixin" style={disabledIconStyle} />]}
                    >
                      <Meta title={i18n.t('Channel:WEIXIN.ChannelType')} style={{ textAlign: 'center' }} />
                    </Card>
                  </Col>
                  <Col span={4}>
                    <Card
                      bordered={true}
                      style={cardStyle}
                      cover={
                        <img
                          src="/asset/logo/weixinwork.png"
                          style={imageStyle}
                        />
                      }
                      actions={[<SettingOutlined key="connectWeixinWork" style={disabledIconStyle} />]}
                    >
                      <Meta title={i18n.t('Channel:WEIXINWORK.ChannelType')} style={{ textAlign: 'center' }} />
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