'use client';

import '@aws-amplify/ui-react/styles.css';
import { list, ListPaginateWithPathOutput } from 'aws-amplify/storage';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/amplify/data/resource';
import React, { useState, useEffect } from 'react';
import { Radio, Button, Input, Image, Form, Flex, Tooltip, Layout, Checkbox, List, Select } from 'antd';
import { CheckOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import Index from '../../index';
import i18n from '../../i18n';
import { contentBackend } from '../../../lib/content';


const client = generateClient<Schema>();
type Channel = Schema['Channel']['type'];
type Content = Schema['Content']['type'];
type ContentChannel = Schema['ContentChannel']['type'];
const { Header, Content } = Layout;
const ContentImage: React.FC = () => {
    const [channels, setChannels] = useState<Channel[]>([]);
    const [contents, setContents] = useState<Content[]>([]);
    const [selectedContent, setSelectedContent] = useState<Content>();
    const [contentChannels, setContentChannels] = useState<ContentChannel[]>([]);
    const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
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
                    filter: { content_type: { eq: 'IMAGE' } },
                    limit: 5,
                    authMode: 'userPool'
                });
                if (listContentsErrors) console.error('listContentsErrors:', JSON.stringify(listContentsErrors, null, 2));
                setContents(contents);

                // Fetch contentChannels
                const { data: contentChannels, errors: listContentChannelsErrors } = await client.models.ContentChannel.list({
                    filter: { content_id: { eq: contents[0].id } },
                    authMode: 'userPool'
                });
                if (listContentChannelsErrors) console.error('listContentChannelsErrors:', JSON.stringify(listContentChannelsErrors, null, 2));
                setContentChannels(contentChannels);

                if (contentChannels) {
                    setSelectedContent(contents[0]);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const [form] = Form.useForm();
    const handleGenerate = async (values: any) => {
        const content = {
            content_type: 'IMAGE' as const,
            content_campaign: values.campaign,
            content_model: values.model,
            content_prompt: values.prompt,
            content_quality: values.quality,
            content_ratio: values.ratio,
        }

        const { data: createdContent, errors: createdContentErrors } = await client.models.Content.create(content, { authMode: 'userPool' });
        if (createdContentErrors) console.error('createdContentErrors:', JSON.stringify(createdContentErrors, null, 2));
        contentBackend.postContentImage(values);
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
            const contentChannel = {
                content_id: selectedContent.id,
                channel_id: channelId,
                content_type: 'IMAGE' as const,
                channel_type: channels.find(channel => channel.id === channelId)?.channel_type || '',
            }
            const { data: createdContentChannel, errors: createdContentChannelErrors } = await client.models.ContentChannel.create(contentChannel, { authMode: 'userPool' });
            if (createdContentChannelErrors) console.error('createdContentChannelErrors:', JSON.stringify(createdContentChannelErrors, null, 2));
            contentBackend.postContentChannelImageTiktok(contentChannel);
        }));
    };

    return (
        <Layout>
            <Index />
            <Layout>
                <Header></Header>
                <Content>
                    <Flex gap="large">
                        <div style={{ flex: 1 }}>
                            <Form
                                form={form}
                                onFinish={handleGenerate}
                                disabled={isSubmitted}
                                initialValues={{
                                    model: "black-forest-labs/flux-schnell",
                                    quality: "NORMAL",
                                    ratio: "Square",
                                }}
                                style={{ maxWidth: '500px', margin: '20px' }}
                                layout="horizontal"
                                labelCol={{ flex: '80px' }}
                                labelAlign="left"
                                colon={true}
                                labelWrap={false}
                            >
                                <Form.Item
                                    name="model"
                                    label={
                                        <span>{i18n.t('Content:Model.Model')}&nbsp;
                                            <Tooltip title="model"><QuestionCircleOutlined /></Tooltip>
                                        </span>
                                    }
                                >
                                    <Select
                                        onSelect={(value) => {
                                            if (value != "black-forest-labs/flux-schnell") {
                                                alert(i18n.t('Setting:Billing.UltraNeeded'));
                                                form.setFieldValue('model', 'black-forest-labs/flux-schnell');
                                            }
                                        }}
                                    >
                                        <Select.Option value="black-forest-labs/flux-schnell">{i18n.t('Content:Model.black-forest-labs/flux-schnell')}</Select.Option>
                                        <Select.Option value="abcd" style={{ color: '#999' }}>Flux Pro</Select.Option>
                                        <Select.Option value="abcd" style={{ color: '#999' }}>Midjourney</Select.Option>
                                    </Select>
                                </Form.Item>
                                <Form.Item name="campaign" label={
                                    <span>活动&nbsp;<Tooltip title="campaign"><QuestionCircleOutlined /></Tooltip></span>
                                } required><Input />
                                </Form.Item>
                                <Form.Item name="prompt" label={
                                    <span>{i18n.t('Content:Model.Prompt')}&nbsp;<Tooltip title="prompt"><QuestionCircleOutlined /></Tooltip></span>
                                } required><Input.TextArea rows={4} />
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

                        <div style={{ flex: 2 }}>
                            {i18n.t('Content:Current')}{i18n.t('Content:File.Image')}
                            <Image src={`https://file.uni-scrm.com/${selectedContent?.content_content}`} />
                            <Input.TextArea rows={4} placeholder='相关文案' />
                            <Flex justify="center">
                                <Button type="primary" size="large" onClick={handlePublish} style={{ marginTop: '24px' }}>
                                    {i18n.t('Content:Publish')}
                                </Button>
                            </Flex>
                            <div style={{ marginTop: '4px' }}></div>
                            <Checkbox.Group value={selectedChannels}
                                onChange={setSelectedChannels}
                            >
                                {channels.map((channel) => (
                                    <Checkbox key={channel.id} value={channel.id}>
                                        {channel.channel_type}&nbsp;{channel.channel_name}
                                    </Checkbox>
                                ))}
                            </Checkbox.Group>
                        </div>

                        <div style={{ flex: 1 }}>
                            {i18n.t('Content:File.Image')}{i18n.t('Content:HistoryList')}
                            {contents.map((content, index) => (
                                <div key={index}>
                                    <Image src={`https://file.uni-scrm.com/${content.content_content}`} />
                                </div>
                            ))}
                        </div>
                    </Flex>
                </Content>
            </Layout>
        </Layout>
    );
};

export default ContentImage;