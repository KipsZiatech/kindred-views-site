import React from 'react';
import { motion } from 'framer-motion';
import { AndroidTopBar } from './AndroidTopBar';
import { AndroidBottomNav } from './AndroidBottomNav';

interface AndroidLayoutProps {
  children: React.ReactNode;
  title: string;
  showTopBar?: boolean;
  showBottomNav?: boolean;
  showBack?: boolean;
  onBackClick?: () => void;
  actions?: React.ReactNode;
}

export function AndroidLayout({ 
  children, 
  title, 
  showTopBar = true, 
  showBottomNav = true, 
  showBack = false, 
  onBackClick,
  actions 
}: AndroidLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Android Top Bar */}
      {showTopBar && (
        <AndroidTopBar 
          title={title} 
          showBack={showBack}
          onBackClick={onBackClick}
          actions={actions}
        />
      )}

      {/* Main Content */}
      <motion.main 
        className={`flex-1 overflow-y-auto ${showBottomNav ? 'pb-20' : 'pb-4'} pt-4`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="safe-area-inset">
          {children}
        </div>
      </motion.main>

      {/* Android Bottom Navigation */}
      {showBottomNav && <AndroidBottomNav />}
    </div>
  );
}