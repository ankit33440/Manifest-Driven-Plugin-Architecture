import React from 'react';
import AuthBrand from './AuthBrand';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      <AuthBrand />
      <div className="flex flex-1 flex-col items-center justify-center bg-canvas px-6 py-12 lg:px-16">
        {children}
      </div>
    </div>
  );
}
