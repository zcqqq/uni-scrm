// components/Login.tsx
"use client";

import { Authenticator } from "@aws-amplify/ui-react";
import { AuthUser } from "aws-amplify/auth";
import { redirect } from "next/navigation";

function Login({ user }: { user?: AuthUser }) {
  return (
    <Authenticator
      initialState='signUp'
      signUpAttributes={['nickname']}
    >
      {({ user }) => {
        if (user) {
          redirect("/");
        }
        return <div></div>;
      }}
    </Authenticator>
  );
}

export default Login;
