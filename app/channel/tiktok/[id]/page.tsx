"use client"
import { Layout, Button } from 'antd';
import { Descriptions } from 'antd';
import type { DescriptionsProps } from 'antd';
import React from 'react';
import { useParams } from 'next/navigation';
import Index from '../../../index';
import { tiktokBackend } from './backend';
import { channelBackend } from '../../backend';
import { type Schema } from '@/amplify/data/resource';
import { useState,useEffect } from 'react';


const TiktokChannel: React.FC = () => {
    const params = useParams();
    const id = params.id;

    const [isLoading, setIsLoading] = useState(true);
    const [channel, setChannel] = useState<any>(null);

    useEffect(() => {
        const fetchChannel = async () => {
            if (id) {
                setIsLoading(true);
                try {
                    const channelData = await channelBackend.getChannel(id as string);
                    console.log('Fetched channel data:', channelData);
                    setChannel(channelData);
                } catch (error) {
                    console.error('Error fetching channel:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchChannel();
    }, [id]);

    const items: DescriptionsProps['items'] = [
        {
            key: '1',
            label: '渠道类型',
            children: channel?.channel_type
        }
    ];

    return (
        <Layout hasSider>
            <Layout style={{ marginLeft: 200 }}>
                <Descriptions title="渠道信息" items={items} />
                <Button type="primary" onClick={() => tiktokBackend.refreshToken(id as string)}>
                    刷新token
                </Button>
            </Layout>
        </Layout>
    )
};

export default TiktokChannel; 