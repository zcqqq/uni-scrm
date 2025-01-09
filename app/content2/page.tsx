'use client';

import { Authenticator } from '@aws-amplify/ui-react';
import { FileUploader } from '@aws-amplify/ui-react-storage';
import '@aws-amplify/ui-react/styles.css';
import { StorageImage } from '@aws-amplify/ui-react-storage';
import React, { useState } from 'react';
import type { CarouselProps, RadioChangeEvent } from 'antd';
import { Carousel, Radio } from 'antd';

const Content2: React.FC = () => {

    return (
        <Authenticator>
            <FileUploader
                acceptedFileTypes={['image/*']}
                path={({ identityId }) => `private/${identityId}/`}
                maxFileCount={1}
                isResumable
            />
            <Carousel dotPosition='right'>
                <div>
                        <StorageImage
                            alt="rocket"
                            className="amplify-storageimage"
                            path={({ identityId }) => `private/${identityId}/rocket.png`}
                        />
                </div>
                <div>
                        <StorageImage
                            alt="rocket"
                            className="amplify-storageimage"
                            path={({ identityId }) => `private/${identityId}/rocket.png`}
                        />
                </div>
            </Carousel>
        </Authenticator>
    );
};

export default Content2;