import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import shwariLogo from '@/assets/shwari-logo.png';

interface AndroidTopBarProps {
  title: string;
  showBack?: boolean;
  onBackClick?: () => void;
  actions?: React.ReactNode;
}

export function AndroidTopBar({ title, showBack = false, onBackClick, actions }: AndroidTopBarProps) {
  return (
    <motion.div 
      className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-between px-4 py-3 h-14">
        <div className="flex items-center space-x-3">
          {showBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBackClick}
              className="text-primary-foreground hover:bg-primary-foreground/10 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center space-x-2">
            <img 
              src={shwariLogo} 
              alt="Shwari M-Pesa" 
              className="w-8 h-8 object-contain rounded-lg"
            />
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {actions}
          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10 rounded-full"
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}