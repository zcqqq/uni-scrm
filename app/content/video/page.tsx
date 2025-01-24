'use client';

import { Authenticator } from '@aws-amplify/ui-react';
import { FileUploader } from '@aws-amplify/ui-react-storage';
import '@aws-amplify/ui-react/styles.css';
import { StorageImage } from '@aws-amplify/ui-react-storage';
import React, { useState, useEffect } from 'react';
import type { CarouselProps, RadioChangeEvent } from 'antd';
import { Carousel, Radio, Button, Input, Image, Form, Flex, Tooltip } from 'antd';
import { list, ListPaginateWithPathOutput } from 'aws-amplify/storage';
import { get } from 'aws-amplify/api';
import { Layout } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
const { Header, Content } = Layout;
import Index from '../../index';
import { postContentVideo } from './backend';
import styles from './page.module.css';
import { Player } from 'video-react';
import 'video-react/dist/video-react.css';

const ContentVideo: React.FC = () => {
    const [videos, setVideos] = useState<ListPaginateWithPathOutput>();
    const [selectedVideoPath, setSelectedVideoPath] = useState<string | null>(null);
    useEffect(() => {
        const fetchVideos = async () => {
            const result = await list({
                path: ({ identityId }) => `public/video/`
            });
            const filteredItems = result.items.filter(item => !item.path.endsWith('/'));
            console.log('filteredItems', filteredItems);
            setVideos({ ...result, items: filteredItems });
            // Set the first video as default
            if (filteredItems.length > 0) {
                setSelectedVideoPath(filteredItems[0].path);
            }
        };
        fetchVideos();
    }, []);
    console.log('selectedVideoPath', selectedVideoPath);

    const [form] = Form.useForm();

    const handleSubmit = (values: any) => {
        postContentVideo(values);
    };

    return (
        <Layout>
            <Index />
            <Layout>
                <Header></Header>
                <Content className={styles.video}>
                    <Form
                        form={form}
                        onFinish={handleSubmit}
                        initialValues={{
                            width: 864,
                            height: 480,
                        }}
                        style={{ maxWidth: '500px', margin: '20px' }}
                        layout="horizontal"
                        labelCol={{ flex: '80px' }}
                        labelAlign="left"
                        colon={true}
                        labelWrap={true}
                    >
                        <Form.Item name="campaign" label={
                            <span>活动&nbsp;<Tooltip title="campaign"><QuestionCircleOutlined /></Tooltip></span>
                        } required><Input />
                        </Form.Item>
                        <Form.Item name="prompt" label={
                            <span>提示词&nbsp;<Tooltip title="prompt"><QuestionCircleOutlined /></Tooltip></span>
                        } required><Input.TextArea rows={4} />
                        </Form.Item>
                        <Form.Item name="quality" label={
                            <span>品质&nbsp;<Tooltip title="prompt"><QuestionCircleOutlined /></Tooltip></span>
                        }>
                            <Radio.Group defaultValue="normal">
                                <Radio.Button value="normal">Normal</Radio.Button>
                                <Radio.Button value="high">High</Radio.Button>
                            </Radio.Group>
                        </Form.Item>
                        <Flex align="center" gap={4}>
                            长
                            <Form.Item name="width" style={{ flex: 1, marginBottom: 0 }} ><Input type="number" /></Form.Item>
                            像素&nbsp;&nbsp;&nbsp;&nbsp;
                            宽
                            <Form.Item name="height" style={{ flex: 1, marginBottom: 0 }}><Input type="number" /></Form.Item>
                            像素
                        </Flex>
                        <Form.Item style={{ marginTop: '24px', textAlign: 'center' }}>
                            <Button type="primary" htmlType="submit" size="large">
                                Generate Video
                            </Button>
                        </Form.Item>
                    </Form>
                    <div>
                        当前视频
                        <Player>
                            <source src={`https://file.uni-scrm.com/${selectedVideoPath || ''}`} />
                        </Player>
                    </div>
                    <div style={{ width: '100px' }}>
                        历史视频列表
                        {videos?.items.map((item, index) => (
                            <div key={index} style={{ height: '100px' }}>
                                <Player >
                                    <source src={`https://file.uni-scrm.com/${item.path}`} />
                                </Player>
                            </div>
                        ))}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default ContentVideo;