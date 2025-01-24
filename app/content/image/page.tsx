'use client';

import { Authenticator } from '@aws-amplify/ui-react';
import { FileUploader } from '@aws-amplify/ui-react-storage';
import '@aws-amplify/ui-react/styles.css';
import { StorageImage } from '@aws-amplify/ui-react-storage';
import React, { useState, useEffect } from 'react';
import type { CarouselProps, RadioChangeEvent } from 'antd';
import { Carousel, Radio, Button, Input, Image } from 'antd';
import { list, ListPaginateWithPathOutput } from 'aws-amplify/storage';
import { get } from 'aws-amplify/api';
import { postContent } from './backend';
import { Layout } from 'antd';
const { Header, Content } = Layout;
import Index from '../../index';
import styles from './page.module.css';

async function getItem(): Promise<string | undefined> {
    try {
        const restOperation = await get({
            apiName: 'myRestApi',
            path: 'content'
        });
        const response = await restOperation.response;
        const text = await response.body.text();
        console.log('GET call succeeded: ', text);
        return text;
    } catch (error: any) {
        console.log('GET call failed: ', error);
        return undefined;
    }
}

const AmplifyCarousel = () => {
    const [images, setImages] = useState<ListPaginateWithPathOutput>();
    const [selectedImagePath, setSelectedImagePath] = useState<string | null>(null);

    useEffect(() => {
        const fetchImages = async () => {
            const result = await list({
                path: ({ identityId }) => `public/`
            });
            const filteredItems = result.items.filter(item => !item.path.endsWith('/'));
            console.log('filteredItems', filteredItems);
            setImages({ ...result, items: filteredItems });
            // Set the first image as default
            if (filteredItems.length > 0) {
                setSelectedImagePath(filteredItems[0].path);
            }
        };
        fetchImages();
    }, []);

    return (
        <>
            <div>
                {selectedImagePath && (  // Only render StorageImage when we have a path
                    <StorageImage 
                        id='selectedImage' 
                        path={selectedImagePath} 
                        alt='selectedImage'
                        className={styles.selectedImage}
                    />
                )}
            </div>
            <Carousel dotPosition='right' className={styles.carousel}>
                {images?.items.map((item, index) => (
                    <div 
                        key={index} 
                        onClick={() => setSelectedImagePath(item.path)}
                        style={{ cursor: 'pointer' }}
                    >
                        <StorageImage
                            alt={`Image ${index + 1}`}
                            className="amplify-storageimage"
                            path={item.path}
                        />
                    </div>
                ))}
            </Carousel>
        </>
    );
};

const ContentPage: React.FC = () => {
    const [itemData, setItemData] = useState<string | undefined>(undefined);
    const [prompt, setPrompt] = useState('');

    useEffect(() => {
        getItem().then(result => setItemData(result));
    }, []);

    return (
        <Authenticator>
            {({ signOut, user }) => (
                <Layout>
                    <Index />
                    <Layout>
                        <Header></Header>
                        <Content className={styles.aimage2}>
                            <div>
                            <Input placeholder="Enter prompt" onChange={(e) => setPrompt(e.target.value)} />
                            <Button onClick={() => postContent(prompt)}>Post Content</Button>
                            </div>
                            <div>
                                历史图片列表
                            <Authenticator>
                                <AmplifyCarousel />
                            </Authenticator>
                            </div>
                        </Content>
                    </Layout>
                </Layout>
            )}
        </Authenticator>
    );
};

export default ContentPage;