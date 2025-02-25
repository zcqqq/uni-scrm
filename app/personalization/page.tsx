"use client";

import { Card, Col, Row, ConfigProvider, theme, Layout, Tabs, Select, Form, Button } from 'antd';
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import SettingMenu from '../settingMenu';
import { generateClient } from 'aws-amplify/data';
import { FileUploader } from '@aws-amplify/ui-react-storage';
import { uploadData } from 'aws-amplify/storage';
import { getCurrentUser } from 'aws-amplify/auth';
import Link from 'next/link';
import i18n from '../i18n';

const Personalization: React.FC = () => {
  const [form] = Form.useForm();

  const languageOptions = [
    { value: 'EN', label: 'English' },
    { value: 'CN', label: '中文' },
  ];

  const handleSubmit = () => {
    const values = form.getFieldsValue();
    i18n.changeLanguage(values.language);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <SettingMenu />
      <Layout style={{ marginLeft: 200, minHeight: '100vh', padding: '24px' }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ language: i18n.language }}
        >
          <Form.Item
            label={i18n.t('Setting:Personalization.Language')}
            name="language"
            style={{ width: 200 }}
          >
            <Select options={languageOptions} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" onClick={handleSubmit}>
              {i18n.t('Form.Save')}
            </Button>
          </Form.Item>
        </Form>
      </Layout>
    </Layout>
  );
};

export default Personalization;