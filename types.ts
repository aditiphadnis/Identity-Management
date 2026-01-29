
// Added React import to fix "Cannot find namespace 'React'" error
import React from 'react';

export type Environment = 'sandbox' | 'production';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  isActive?: boolean;
}