"use client"
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '@/amplify/data/resource'
import React, { useState, useEffect } from 'react';
import { Card, Col, Row, ConfigProvider, theme, Layout, Button, Checkbox, Form, Input, Radio, Select, Flex, Menu, MenuProps, Modal, Upload } from 'antd';
import type { GetProp, UploadFile, UploadProps } from 'antd';
import { uploadData } from 'aws-amplify/storage';
import { AxiosResponse } from 'axios';
import type { CarouselProps, RadioChangeEvent } from 'antd';
import { Carousel } from 'antd';
import { StorageImage } from '@aws-amplify/ui-react-storage';
import { uploadFileToS3 } from './backend';


const client = generateClient<Schema>();

//menu
const items: MenuProps['items'] = [
    {
        label: '生成视频',
        key: '/generateVideo',
    },
    {
        label: '生成图片',
        key: 'app',
    },
    {
        label: '生成文案',
        key: 'app 2',
    }];
const { Header, Content, Sider } = Layout;

//form display
type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];
const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

//form submit
const onFinish = async (values: any) => {
    console.log('Success:', values);
};

const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
};

type FieldType = {
    image?: UploadFile[];
};

const uploadVideo = async () => {
    const axios = require('axios');
    let data = JSON.stringify({
        post_info: {
            privacy_level: "SELF_ONLY",
            title: "#hash @mention testTitle",
            brand_organic_toggle: true,
            is_aigc: true
        },
        source_info: {
            source: "PULL_FROM_URL",
            video_url: "https://sf16-va.tiktokcdn.com/obj/eden-va2/uvpapzpbxjH-aulauvJ-WV[[/ljhwZthlaukjlkulzlp/3min.mp4"
        }
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://open.tiktokapis.com/v2/post/publish/video/init/',
        headers: {
            'Authorization': 'Bearer act.fN9DzjKmEWLl64s39gIajHAWFKtLtmd12qIZJXBaiCWkgX8iJnneIj5FLDk8!5061.va',
            'Content-Type': 'application/json; charset=UTF-8'
        },
        data: data
    };

    axios.request(config)
        .then((response: AxiosResponse) => {
            console.log(JSON.stringify(response.data));
        })
        .catch((error: any) => {
            console.log(error);
        });

};

const App: React.FC = () => {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>([
        {
            uid: '-1',
            name: 'image.png',
            status: 'done',
            url: 'https://replicate.delivery/pbxt/JvLi9smWKKDfQpylBYosqQRfPKZPntuAziesp0VuPjidq61n/rocket.png',
        },
    ]);
    const [file, setFile] = useState<File | null>(null);


    useEffect(() => {
        const fetchImage = async () => {
            const response = await fetch('https://replicate.delivery/pbxt/JvLi9smWKKDfQpylBYosqQRfPKZPntuAziesp0VuPjidq61n/rocket.png');
            const blob = await response.blob();
            const imageFile = new File([blob], 'rocket.png', { type: 'image/png' });
            setFile(imageFile);
        }
        fetchImage();
    }, []);

    const handleCancel = () => setPreviewOpen(false);

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }
        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
    };

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
        setFileList(newFileList);

    return (
        <Layout hasSider>
            <Layout style={{ marginLeft: 200 }}>
                <Header style={{ padding: 0, background: colorBgContainer }} >
                    <Menu mode="horizontal" items={items} />
                </Header>
                <Layout>
                    <Content>
                        <Form
                            name="basic"
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 24 }}
                            style={{ maxWidth: 1000 }}
                            initialValues={{ remember: true }}
                            onFinish={onFinish}
                            onFinishFailed={onFinishFailed}
                            autoComplete="off"
                        >
                            <Form.Item<FieldType>
                                name="image"
                                label="Upload Image"
                                rules={[{ required: false }]}
                                wrapperCol={{ span: 16 }}
                            >
                                <Upload
                                    action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
                                    listType="picture-card"
                                    fileList={fileList}
                                    onPreview={handlePreview}
                                    onChange={handleChange}
                                >
                                    {fileList.length < 1 && '+ Upload'}
                                </Upload>
                                <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
                                    <img alt="example" style={{ width: '100%' }} src={previewImage} />
                                </Modal>
                            </Form.Item>
                            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    onClick={() => {
                                        if (file) {
                                            uploadFileToS3(file);
                                        }
                                    }}
                                >
                                    存入S3
                                </Button>
                                <Button type="primary" htmlType="submit">
                                    上传tiktok
                                </Button>
                                <Button type="primary" htmlType="submit" onClick={() => {
                                    uploadVideo()
                                }}>
                                    上传视频
                                </Button>
                            </Form.Item>
                        </Form>
                    </Content>
                    <Sider width="25%">
                        <Carousel dotPosition='right'>
                            <div>
                                <StorageImage alt="rocket" path="public/rocket.jpg" />;
                            </div>
                            <div>
                                <h3>2</h3>
                            </div>
                        </Carousel>
                    </Sider>
                </Layout>
            </Layout>
        </Layout>
    );
};

export default App;