'use client';

import '@aws-amplify/ui-react/styles.css';
import { list, ListPaginateWithPathOutput } from 'aws-amplify/storage';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/amplify/data/resource';
import React, { useState, useEffect } from 'react';
import { Radio, Button, Input, Form, Flex, Tooltip, Layout, Checkbox, List, Select } from 'antd';
import { CheckOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import Index from '../../index';
import i18n from '../../i18n';
import { contentBackend } from '../../../lib/content';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Player } from 'video-react';
import 'video-react/dist/video-react.css';
import { FileUploader } from '@aws-amplify/ui-react-storage';



const client = generateClient<Schema>();
type Channel = Schema['Channel']['type'];
type Content = Schema['Content']['type'];
type ContentPublish = Schema['ContentPublish']['type'];
const { Header, Content } = Layout;
const ContentVideo: React.FC = () => {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [contents, setContents] = useState<Content[]>([]);
    const [selectedContent, setSelectedContent] = useState<Content>();
    const [contentPublishs, setContentPublishs] = useState<ContentPublish[]>([]);
    const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [entityId, setEntityId] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                fetchAuthSession().then((info) => {
                    const cognitoIdentityId = info.identityId;
                    console.log('cognitoIdentityId:', cognitoIdentityId);
                    setEntityId(cognitoIdentityId || '');
                });

                // Fetch channels
                const { data: channels, errors: listChannelsErrors } = await client.models.Channel.list({
                    filter: { is_deleted: { eq: false } },
                    authMode: 'userPool'
                });
                if (listChannelsErrors) console.error('listChannelsErrors:', JSON.stringify(listChannelsErrors, null, 2));
                // Set all channel IDs as selected by default
                setSelectedChannels(channels?.map((channel: { id: string }) => channel.id) || []);
                setChannels(channels);

                // Fetch contents
                const { data: contents, errors: listContentsErrors } = await client.models.Content.list({
                    filter: { content_type: { eq: 'VIDEO' } },
                    limit: 5,
                    authMode: 'userPool'
                });
                if (listContentsErrors) console.error('listContentsErrors:', JSON.stringify(listContentsErrors, null, 2));
                setContents(contents);

                setSelectedContent(contents[0]);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const [form] = Form.useForm();
    const handleGenerate = async (values: any) => {
        const content = {
            content_type: 'VIDEO' as const,
            content_campaign: values.campaign,
            content_model: values.model,
            content_prompt: values.prompt,
            content_quality: values.quality,
            content_ratio: values.ratio,
            content_content: Math.random().toString(36).substring(2, 15),
        }

        const { data: createdContent, errors: createdContentErrors } = await client.models.Content.create(content, { authMode: 'userPool' });
        if (createdContentErrors) console.error('createdContentErrors:', JSON.stringify(createdContentErrors, null, 2));
        if (!createdContent?.id || !createdContent.content_content) {
            console.error('Failed to create content: no ID or content_content returned');
            return;
        }
        contentBackend.postContentVideo(values, createdContent.id, createdContent.content_content);
        setIsSubmitted(true);
    };
    const handleRegenerate = () => {
        console.log('handleReset called');
        console.log('isSubmitted before:', isSubmitted);
        form.resetFields();
        setIsSubmitted(false);
        console.log('isSubmitted after setState call');
    };

    const handlePublish = async () => {
        if (!selectedContent?.id) {
            console.error('No content selected');
            return;
        }

        await Promise.all(selectedChannels.map(async channelId => {
            const contentPublish = {
                content_id: selectedContent.id,
                channel_id: channelId,
            }
            const { data: createdContentPublish, errors: createdContentPublishErrors } = await client.models.ContentPublish.create(contentPublish, { authMode: 'userPool' });
            if (createdContentPublishErrors) console.error('createdContentPublishErrors:', JSON.stringify(createdContentPublishErrors, null, 2));
            contentBackend.postContentPublish(createdContentPublish?.id || '');
        }));
    };

    return (
        <Layout>
            <Index />
            <Layout style={{ marginLeft: '200px', height: '100vh' }}>
                <Content>
                    <Flex gap="large">
                        <div style={{ flex: 1 }}>
                            <Form
                                form={form}
                                onFinish={handleGenerate}
                                disabled={isSubmitted}
                                initialValues={{
                                    model: "kwaivgi/kling-v1.6-standard",
                                    quality: "NORMAL",
                                    ratio: "Square",
                                }}
                                style={{ maxWidth: '500px', margin: '20px' }}
                                layout="horizontal"
                                labelCol={{ flex: '80px' }}
                                labelAlign="left"
                                colon={false}
                                labelWrap={false}
                            >
                                <Form.Item
                                    name="model"
                                    label={
                                        <Tooltip title={i18n.t('Content:Tooltip.Model')}><span style={{ borderBottom: '1px dashed #999' }}>{i18n.t('Content:Model.Model')}</span></Tooltip>
                                    }
                                >
                                    <Select
                                        onSelect={(value) => {
                                            if (value != "kwaivgi/kling-v1.6-standard") {
                                                alert(i18n.t('Setting:Billing.UltraNeeded'));
                                                form.setFieldValue('model', 'kwaivgi/kling-v1.6-standard');
                                            }
                                        }}
                                    >
                                        <Select.Option value="kwaivgi/kling-v1.6-standard">{i18n.t('Content:Model.kwaivgi/kling-v1.6-standard')}</Select.Option>
                                        <Select.Option value="kwaivgi/kling-v1.6-pro" style={{ color: '#999' }}>{i18n.t('Content:Model.kwaivgi/kling-v1.6-pro')}</Select.Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item name="campaign" label={
                                    <Tooltip title={i18n.t('Content:Tooltip.Campaign')}><span style={{ borderBottom: '1px dashed #999' }}>{i18n.t('Marketing.Campaign')}</span></Tooltip>
                                } required><Input />
                                </Form.Item>
                                <Form.Item name="prompt" label={
                                    <Tooltip title={i18n.t('Content:Tooltip.Prompt')}><span style={{ borderBottom: '1px dashed #999' }}>{i18n.t('Content:Model.Prompt')}</span></Tooltip>
                                } required><Input.TextArea rows={4} />
                                </Form.Item>
                                <span style={{ whiteSpace: 'normal'}}>Start Image</span>
                                <Form.Item 
                                    name="startImage"
                                >
                                    <FileUploader
                                        acceptedFileTypes={['image/*']}
                                        path="startImage/"
                                        maxFileCount={1}
                                        isResumable
                                    />
                                </Form.Item>
                                <Form.Item name="quality" label={
                                    <span>{i18n.t('Content:Model.Quality')}&nbsp;<Tooltip title="quality"><QuestionCircleOutlined /></Tooltip></span>
                                }>
                                    <Radio.Group>
                                        <Radio.Button value="NORMAL">{i18n.t('Content:Model.Quality.Normal')}</Radio.Button>
                                        <Radio.Button value="HIGH">{i18n.t('Content:Model.Quality.High')}</Radio.Button>
                                    </Radio.Group>
                                </Form.Item>
                                <Form.Item name="ratio" label={
                                    <span>{i18n.t('Content:Model.Ratio')}&nbsp;<Tooltip title="ratio"><QuestionCircleOutlined /></Tooltip></span>
                                }>
                                    <Select>
                                        <Select.Option value="Square">{i18n.t('Content:Model.Ratio.Square')}</Select.Option>
                                        <Select.Option value="Landscape">{i18n.t('Content:Model.Ratio.Landscape')}</Select.Option>
                                        <Select.Option value="Portrait">{i18n.t('Content:Model.Ratio.Portrait')}</Select.Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item style={{ marginTop: '24px', textAlign: 'center' }}>
                                    <Button
                                        type={isSubmitted ? "default" : "primary"}
                                        htmlType={isSubmitted ? "button" : "submit"}
                                        size="large"
                                        onClick={isSubmitted ? handleRegenerate : undefined}
                                        disabled={false}
                                    >
                                        {isSubmitted ? i18n.t('Content:Model.Re-Generate') : i18n.t('Content:Model.Generate')}
                                    </Button>
                                </Form.Item>
                            </Form>
                        </div>

                        <div style={{ flex: 2, height: '100vh', display: 'flex', flexDirection: 'column' }}>
                            {/* Header text */}
                            <div style={{ padding: '16px', textAlign: 'center' }}>
                                {i18n.t('Content:Current')}{i18n.t('Content:File.Video')}
                            </div>

                            {/* Video preview area */}
                            <div
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    overflow: 'hidden',
                                }}
                            >
                                <Player>
                                    <source src={`https://file.uni-scrm.com/video/${entityId}/${selectedContent?.content_content}.mp4`} />
                                </Player>                            </div>

                            {/* Input text area */}
                            <div style={{ padding: '16px' }}>
                                <Input.TextArea rows={4} placeholder={i18n.t('Content:File.Title')} />
                            </div>

                            {/* Publish button */}
                            <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
                                <Button type="primary" size="large" onClick={handlePublish}>
                                    {i18n.t('Content:Publish')}
                                </Button>
                            </div>

                            {/* Channel selection */}
                            <div style={{ padding: '8px 16px' }}>
                                <Checkbox.Group value={selectedChannels} onChange={setSelectedChannels}>
                                    {channels.map((channel) => (
                                        <Checkbox key={channel.id} value={channel.id}>
                                            {channel.channel_type}&nbsp;{channel.channel_name}
                                        </Checkbox>
                                    ))}
                                </Checkbox.Group>
                            </div>
                        </div>

                        <div style={{ flex: 1 }}>
                            {i18n.t('Content:File.Video')}{i18n.t('Content:HistoryList')}
                            {contents.map((content, index) => (
                                <div key={index}>
                                    <Player>
                                        <source src={`https://file.uni-scrm.com/video/${entityId}/${content.content_content}.mp4`} />
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