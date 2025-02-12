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
import { fetchAuthSession } from 'aws-amplify/auth';
import { post } from 'aws-amplify/api';



const client = generateClient<Schema>();
type Channel = Schema['Channel']['type'];
type Content = Schema['Content']['type'];
type ContentPublish = Schema['ContentPublish']['type'];
const { Header, Content } = Layout;
const ContentImage: React.FC = () => {
    const [form] = Form.useForm();
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
                    filter: { content_type: { eq: 'IMAGE' } },
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

    const handleGenerate = async (values: any) => {
        setIsSubmitted(true);
        let model_input;
        if (values.quality === 'HIGH') { model_input = { prompt: values.prompt, go_fast: false, megapixels: '10', num_outputs: 4, aspect_ratio: values.ratio, output_quality: '100', num_inference_steps: '4' } }
        else { model_input = { prompt: values.prompt, go_fast: true, megapixels: '1', num_outputs: 1, aspect_ratio: values.ratio, output_quality: '80', num_inference_steps: '1' } }
        const content = {
            content_type: 'IMAGE' as const,
            content_campaign: values.campaign,
            content_model: values.model,
            content_prompt: values.prompt,
            model_input: JSON.stringify(model_input),
            folder_id: entityId
        }
        //write data table
        const { data: createdContent, errors: createdContentErrors } = await client.models.Content.create(content, { authMode: 'userPool' });
        if (createdContentErrors) console.error('createdContentErrors:', JSON.stringify(createdContentErrors, null, 2));
        if (!createdContent?.id) { console.error('Failed to create content'); return; }
        try {// call API
            const restOperation = post({
                apiName: 'myRestApi', path: `content/${createdContent.id}`,
                options: { body: content, headers: { 'Content-Type': 'application/json' } }
            });
            const { body } = await restOperation.response;
            const response = await body.json();
        } catch (error) {
            console.error('REST POST error:', error);
        }
    };
    const handleRegenerate = () => {
        console.log('handleReset called');
        console.log('isSubmitted before:', isSubmitted);
        form.resetFields();
        setIsSubmitted(false);
        console.log('isSubmitted after setState call');
    };

    const handlePublish = async () => {
        if (!selectedContent?.id) { console.error('No content selected'); return; }
        await Promise.all(selectedChannels.map(async channelId => {
            const contentPublish = {
                content_id: selectedContent.id,
                channel_id: channelId,
            }
            const { data: createdContentPublish, errors: createdContentPublishErrors } = await client.models.ContentPublish.create(contentPublish, { authMode: 'userPool' });
            if (createdContentPublishErrors) console.error('createdContentPublishErrors:', JSON.stringify(createdContentPublishErrors, null, 2));
            try {
                const restOperation = post({
                    apiName: 'myRestApi',
                    path: `contentPublish/${createdContentPublish?.id}`,
                    options: { headers: { 'Content-Type': 'application/json' } }
                });
                const { body } = await restOperation.response;
                const response = await body.json();
            } catch (error) {
                console.log('REST POST error:', error);
            }
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
                                    model: "black-forest-labs/flux-schnell",
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
                                    <Tooltip title={i18n.t('Content:Tooltip.Campaign')}><span style={{ borderBottom: '1px dashed #999' }}>{i18n.t('Marketing.Campaign')}</span></Tooltip>
                                } required><Input />
                                </Form.Item>
                                <Form.Item name="prompt" label={
                                    <Tooltip title={i18n.t('Content:Tooltip.Prompt')}><span style={{ borderBottom: '1px dashed #999' }}>{i18n.t('Content:Model.Prompt')}</span></Tooltip>
                                } required><Input.TextArea rows={4} />
                                </Form.Item>
                                <Form.Item name="quality" label={
                                    <Tooltip title={i18n.t('Content:Tooltip.Quality')}><span style={{ borderBottom: '1px dashed #999' }}>{i18n.t('Content:Model.Quality')}</span></Tooltip>
                                }>
                                    <Radio.Group>
                                        <Radio.Button value="NORMAL">{i18n.t('Content:Model.Quality.Normal')}</Radio.Button>
                                        <Radio.Button value="HIGH">{i18n.t('Content:Model.Quality.High')}</Radio.Button>
                                    </Radio.Group>
                                </Form.Item>
                                <Form.Item name="ratio" label={
                                    <Tooltip title={i18n.t('Content:Tooltip.Ratio')}><span style={{ borderBottom: '1px dashed #999' }}>{i18n.t('Content:Model.Ratio')}</span></Tooltip>
                                }>
                                    <Select>
                                        <Select.Option value="1:1">{i18n.t('Content:Model.Ratio.Square')}</Select.Option>
                                        <Select.Option value="16:9">{i18n.t('Content:Model.Ratio.Landscape')}</Select.Option>
                                        <Select.Option value="9:16">{i18n.t('Content:Model.Ratio.Portrait')}</Select.Option>
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
                                {i18n.t('Content:Current')}{i18n.t('Content:File.Image')}
                            </div>

                            {/* Image preview area */}
                            <div
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    overflow: 'hidden',
                                }}
                            >
                                <Image
                                    src={`https://file.uni-scrm.com/image/${entityId}/${selectedContent?.content_content}.webp`}
                                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                                />
                            </div>

                            {/* Input text area */}
                            <div style={{ padding: '16px' }}>
                                <Input.TextArea rows={4} placeholder='相关文案' />
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
                            {i18n.t('Content:File.Image')}{i18n.t('Content:HistoryList')}
                            {contents.map((content, index) => (
                                <div key={index}>
                                    <Image src={`https://file.uni-scrm.com/image/${entityId}/${content.content_content}.webp`} />
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