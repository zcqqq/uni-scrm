'use client';

import { Authenticator } from '@aws-amplify/ui-react';
import { FileUploader } from '@aws-amplify/ui-react-storage';
import '@aws-amplify/ui-react/styles.css';
import { StorageImage } from '@aws-amplify/ui-react-storage';
import React, { useState, useEffect } from 'react';
import type { CarouselProps, RadioChangeEvent } from 'antd';
import { Carousel, Radio, Button } from 'antd';
import { list, ListPaginateWithPathOutput } from 'aws-amplify/storage';
import { get } from 'aws-amplify/api';

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

    useEffect(() => {
        const fetchImages = async () => {
            const result = await list({
                path: ({ identityId }) => `private/`
            });
            console.log(result);
            setImages(result);
        };
        fetchImages();
    }, []);
    return (
        <Carousel dotPosition='right'>
            {images?.items.map((item, index) => (
                <div key={index}>
                    <StorageImage
                        alt={`Image ${index + 1}`}
                        className="amplify-storageimage"
                        path={item.path}
                    />
                </div>
            ))}
        </Carousel>

    );
};

const Content2: React.FC = () => {
    const [itemData, setItemData] = useState<string | undefined>(undefined);

    useEffect(() => {
        getItem().then(result => setItemData(result));
    }, []);

    return (
        <Authenticator>
            {({ signOut, user }) => (
                <>
                    <div>{itemData || 'Loading...'}</div>
                    <FileUploader
                        acceptedFileTypes={['image/*']}
                        path={({ identityId }) => `private/${identityId}/`}
                        maxFileCount={1}
                        isResumable
                    />
                    <Authenticator>
                        <AmplifyCarousel />
                    </Authenticator>
                </>
            )}
        </Authenticator>
    );
};

export default Content2;