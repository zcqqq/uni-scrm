"use client"
import { Layout, Button } from 'antd';
import { Descriptions } from 'antd';
import type { DescriptionsProps } from 'antd';
import React from 'react';
import { useParams } from 'next/navigation';
import Index from '../../../index';
import { tiktokBackend } from './backend';
import { type Schema } from '@/amplify/data/resource';
import { useState, useEffect } from 'react';
import { generateClient } from "aws-amplify/api"

const client = generateClient<Schema>()
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
                    const { data: channel } = await client.models.Channel.get({ id: id as string });
                    console.log('Fetched channel data:', channel);
                    setChannel(channel);
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