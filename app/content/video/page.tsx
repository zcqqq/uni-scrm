'use client';

import '@aws-amplify/ui-react/styles.css';
import { list, ListPaginateWithPathOutput } from 'aws-amplify/storage';
import React, { useState, useEffect } from 'react';
import { Radio, Button, Input, Image, Form, Flex, Tooltip, Layout, Checkbox, List } from 'antd';
import { Player } from 'video-react';
import 'video-react/dist/video-react.css';
import { QuestionCircleOutlined } from '@ant-design/icons';
import Index from '../../index';
import { contentBackend } from '../../../lib/content';
import { channelBackend } from '../../../lib/channel';

const { Header, Content } = Layout;
const ContentVideo: React.FC = () => {
    const [videos, setVideos] = useState<ListPaginateWithPathOutput>();
    const [selectedVideoPath, setSelectedVideoPath] = useState<string | null>(null);
    const [channels, setChannels] = useState<any[]>([]);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch videos
                const result = await list({
                    path: ({ identityId }) => `public/video/`
                });
                const filteredItems = result.items.filter(item => !item.path.endsWith('/'));
                setVideos({ ...result, items: filteredItems });

                // Set the first video as default
                if (filteredItems.length > 0) {
                    setSelectedVideoPath(filteredItems[0].path);
                }

                // Fetch channels
                const channelsList = await channelBackend.listChannels();
                setChannels(channelsList);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    console.log('selectedVideoPath', selectedVideoPath);
    console.log('channels', channels);

    const [form] = Form.useForm();
    const handleSubmit = (values: any) => {
        contentBackend.postContentVideo(values, '', '');
        setIsSubmitted(true);
    };

    const handleReset = () => {
        form.resetFields();
        setIsSubmitted(false);
    };

    return (
        <Layout>
            <Index />
            <Layout>
                <Header></Header>
                <Content>
                    <Flex gap="large">
                        <div style={{ flex: 1 }}>
                            <Flex align="center" gap={8}>
                                <h3 style={{ margin: 0 }}>模型:</h3>
                                <Radio.Group defaultValue="1">
                                    <Radio.Button value="1">腾讯混元</Radio.Button>
                                    <Radio.Button value="2">MiniMax海螺</Radio.Button>
                                </Radio.Group>
                            </Flex>
                            <Form
                                form={form}
                                onFinish={handleSubmit}
                                disabled={isSubmitted}
                                initialValues={{
                                    width: 864,
                                    height: 480,
                                }}
                                style={{ maxWidth: '500px', margin: '20px' }}
                                layout="horizontal"
                                labelCol={{ flex: '80px' }}
                                labelAlign="left"
                                colon={true}
                                labelWrap={false}
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
                                    px&nbsp;&nbsp;&nbsp;&nbsp;
                                    宽
                                    <Form.Item name="height" style={{ flex: 1, marginBottom: 0 }}><Input type="number" /></Form.Item>
                                    px
                                </Flex>
                                <Form.Item style={{ marginTop: '24px', textAlign: 'center' }}>
                                    <Button 
                                        type={isSubmitted ? "default" : "primary"}
                                        htmlType={isSubmitted ? "button" : "submit"}
                                        size="large"
                                        onClick={isSubmitted ? handleReset : undefined}
                                        disabled={false}
                                    >
                                        {isSubmitted ? "重新生成" : "生成"}
                                    </Button>
                                </Form.Item>
                            </Form>
                        </div>

                        <div style={{ flex: 2 }}>
                            当前视频
                            <Player>
                                <source src={`https://file.uni-scrm.com/${selectedVideoPath || ''}`} />
                            </Player>
                            <Flex justify="center">
                                <Button type="primary" size="large" style={{ marginTop: '24px' }}>
                                    发布
                                </Button>
                            </Flex>
                            <div style={{ marginTop: '4px' }}></div>
                            {
                                channels.map((channel) => (
                                    <Checkbox key={channel.id} style={{ marginTop: '24px' }}>{channel.channel_type}&nbsp;{channel.channel_name}</Checkbox>
                                ))
                            }
                        </div>

                        <div style={{ flex: 1 }}>
                            历史视频列表
                            {videos?.items.map((item, index) => (
                                <div key={index}>
                                    <Player>
                                        <source src={`https://file.uni-scrm.com/${item.path}`} />
                                    </Player>
                                </div>
                            ))}
                        </div>
                    </Flex>
                </Content>
            </Layout>
        </Layout>
    );
};

export default ContentVideo;