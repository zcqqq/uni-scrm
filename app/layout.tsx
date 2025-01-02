import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import ConfigureAmplifyClientSide from "@/components/ConfigureAmplify";


const RootLayout = ({ children }: React.PropsWithChildren) => (
  <html lang="en">
    <body>
      <AntdRegistry>        <ConfigureAmplifyClientSide />
        {children}</AntdRegistry>
    </body>
  </html>
);

export default RootLayout;