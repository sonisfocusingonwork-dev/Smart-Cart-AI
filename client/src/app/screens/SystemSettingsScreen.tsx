import React, { useState } from 'react';
import { 
  Settings, 
  ShoppingCart, 
  Bot, 
  Users, 
  CreditCard, 
  Map, 
  Monitor, 
  DatabaseBackup,
  ChevronRight
} from 'lucide-react';
import { AICartConfigTab } from './settings/AICartConfigTab';
import { ChatbotConfigTab } from './settings/ChatbotConfigTab';
import { AccountsConfigTab } from './settings/AccountsConfigTab';
import { PaymentConfigTab } from './settings/PaymentConfigTab';
import { MapConfigTab } from './settings/MapConfigTab';
import { SystemUIConfigTab } from './settings/SystemUIConfigTab';
import { BackupConfigTab } from './settings/BackupConfigTab';

type SettingTab = 
  | 'cart' 
  | 'chatbot' 
  | 'accounts' 
  | 'payment' 
  | 'map' 
  | 'ui' 
  | 'backup';

export function SystemSettingsScreen() {
  const [activeTab, setActiveTab] = useState<SettingTab>('cart');

  const tabs = [
    { id: 'cart', label: 'Cấu hình xe đẩy AI', icon: <ShoppingCart size={18} /> },
    { id: 'chatbot', label: 'Cấu hình AI Chatbot', icon: <Bot size={18} /> },
    { id: 'accounts', label: 'Tài khoản & Phân quyền', icon: <Users size={18} /> },
    { id: 'payment', label: 'Cấu hình thanh toán', icon: <CreditCard size={18} /> },
    { id: 'map', label: 'Bản đồ cửa hàng', icon: <Map size={18} /> },
    { id: 'ui', label: 'Giao diện hệ thống', icon: <Monitor size={18} /> },
    { id: 'backup', label: 'Sao lưu & Khôi phục', icon: <DatabaseBackup size={18} /> },
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case 'cart':
        return <AICartConfigTab />;
      case 'chatbot':
        return <ChatbotConfigTab />;
      case 'accounts':
        return <AccountsConfigTab />;
      case 'payment':
        return <PaymentConfigTab />;
      case 'map':
        return <MapConfigTab />;
      case 'ui':
        return <SystemUIConfigTab />;
      case 'backup':
        return <BackupConfigTab />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full min-h-[calc(100vh-140px)] bg-[#F5F5E6] rounded-3xl border border-[#E2E8F0] shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)] overflow-hidden">
      {/* Left Navigation (Vertical Tabs) */}
      <div className="w-72 bg-[#FFFFFF] border-r border-[#E2E8F0] flex flex-col z-10 shrink-0">
        <div className="p-6 border-b border-[#E2E8F0]">
          <h2 className="text-lg font-black text-[#334155] uppercase tracking-wider flex items-center gap-2">
            <Settings className="text-[#15803D]" size={20} />
            Cài đặt hệ thống
          </h2>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 [scrollbar-width:none]">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingTab)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-[#15803D] text-white shadow-[4px_4px_0px_0px_rgba(51,65,85,0.08)]'
                    : 'text-[#64748B] hover:bg-[#F5F5E6] hover:text-[#334155]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`${isActive ? 'text-white' : 'text-[#94A3B8]'}`}>
                    {tab.icon}
                  </div>
                  <span>{tab.label}</span>
                </div>
                {isActive && <ChevronRight size={16} className="text-white/70" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 overflow-y-auto bg-[#F5F5E6] p-8 [scrollbar-width:none]">
        <div className="max-w-5xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
