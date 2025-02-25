import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import ConfigureAmplifyClientSide from "@/components/ConfigureAmplify";
import './globals.css'


const RootLayout = ({ children }: React.PropsWithChildren) => (
  <html lang="en">
    <body>
      <AntdRegistry>        <ConfigureAmplifyClientSide />
        {children}</AntdRegistry>
    </body>
  </html>
);

export default RootLayout;