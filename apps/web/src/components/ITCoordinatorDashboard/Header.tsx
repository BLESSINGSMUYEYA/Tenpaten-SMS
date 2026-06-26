import React from 'react';
import { DashboardHeader } from '../DashboardHeader';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => (
  <DashboardHeader onMenuClick={onMenuClick} />
);
