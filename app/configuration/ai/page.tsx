"use client";

import { Card, Col, Row, ConfigProvider, theme, Layout, Tabs, Select, Form, Button } from 'antd';
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import SettingMenu from '../../settingMenu';
import { generateClient } from 'aws-amplify/data';
import { FileUploader } from '@aws-amplify/ui-react-storage';
import { uploadData } from 'aws-amplify/storage';
import { getCurrentUser } from 'aws-amplify/auth';
import Link from 'next/link';
import i18n from '../../i18n';

const ConfigurationAI: React.FC = () => {
  const [form] = Form.useForm();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <SettingMenu />
      <Layout style={{ marginLeft: 200, minHeight: '100vh', padding: '24px' }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ baseModel: 'meta/meta-llama-3-8b-instruct' }}
        >
          <Form.Item
            label={i18n.t('Content:Model.BaseModel')}
            name="baseModel"
            style={{ width: 200 }}
          >
            <Select onSelect={(value) => {
                                            if (value != "meta/meta-llama-3-8b-instruct") {
                                                alert(i18n.t('Setting:Billing.UltraNeeded'));
                                                form.setFieldValue('baseModel', 'meta/meta-llama-3-8b-instruct');
                                            }
                                        }}>
              <Select.Option value="meta/meta-llama-3-8b-instruct">
                {i18n.t('Content:Model.meta/meta-llama-3-8b-instruct')}
              </Select.Option>
              <Select.Option value="deepseek-ai/deepseek-r1">
                {i18n.t('Content:Model.deepseek-ai/deepseek-r1')}
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {i18n.t('Form.Save')}
            </Button>
          </Form.Item>
        </Form>
      </Layout>
    </Layout>
  );
};

export default ConfigurationAI;