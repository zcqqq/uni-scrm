// components/Login.tsx
"use client";

import { Authenticator } from "@aws-amplify/ui-react";
import { redirect } from "next/navigation";
import { I18n } from 'aws-amplify/utils';
import { translations } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import '../globals.css'

I18n.putVocabularies(translations);
I18n.setLanguage('en');

I18n.putVocabularies({
  zh: {
    'Nickname': '公司名称',
    'Enter your Nickname': '输入公司名称',
    'Password is shown': '隐藏密码',
    'Password is hidden': '显示密码',
  },
  en: {
    'Nickname': 'Company Name',
    'Enter your Nickname': 'Enter your Company name',
  },
});

function Login() {
  return (
    <Authenticator
      initialState='signUp'
      signUpAttributes={['nickname']}
    >
      {({ signOut, user }) => {
        if (user) {
          redirect("/channel");
        }
        return <div></div>;
      }}
    </Authenticator>
  );
}

export default Login;
