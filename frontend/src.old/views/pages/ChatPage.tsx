/**
 * Chat Page Component - MVC/SOLID
 * Single Responsibility: Page layout structure only
 */

import React from 'react';
import { ChatContainer } from '../containers/ChatContainer';
import { MainLayout } from '../layouts/MainLayout';

export const ChatPage: React.FC = () => {
  return (
    <MainLayout>
      <ChatContainer />
    </MainLayout>
  );
};