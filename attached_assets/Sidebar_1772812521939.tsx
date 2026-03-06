

import React from 'react';
import { Page } from '../types';
import { XIcon, FacebookIcon, HomeIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from '../constants';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  navigationItems: { name: Page; icon: React.FC<React.SVGProps<SVGSVGElement>> }[];
  madrasahName: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, isOpen, setIsOpen, isCollapsed, setIsCollapsed, navigationItems, madrasahName }) => {
  const sidebarClasses = `
    bg-primary text-white flex flex-col h-full
    transition-all duration-300 ease-in-out
    fixed lg:static z-40 w-64
    transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
    ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
  `;

  return (
    <>
      <div className={sidebarClasses}>
        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0 h-16 px-4">
          <a href="#" className={`text-white text-xl font-extrabold tracking-wider truncate ${isCollapsed ? 'lg:hidden' : ''}`} title={madrasahName}>
            {madrasahName}<span className="text-accent">ম্যানেজার</span>
          </a>
          
          <div className={`w-full ${isCollapsed ? 'lg:flex justify-center' : 'hidden'}`}>
             <a href="#" onClick={(e) => { e.preventDefault(); setActivePage('ড্যাশবোর্ড'); }}><HomeIcon className="h-8 w-8 text-accent"/></a>
          </div>
          
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-white hover:text-accent">
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <nav className="px-2 py-4">
            {navigationItems.map(item => (
              <a
                key={item.name}
                href="#"
                title={isCollapsed ? item.name : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  setActivePage(item.name);
                  setIsOpen(false); // Close mobile overlay on navigation
                }}
                className={`flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${isCollapsed ? 'lg:justify-center' : 'space-x-3'} ${activePage === item.name ? 'bg-secondary text-white' : 'text-gray-300 hover:bg-secondary hover:text-white'}`}
              >
                <item.icon className="h-6 w-6 flex-shrink-0" />
                <span className={`truncate ${isCollapsed ? 'lg:hidden' : ''}`}>{item.name}</span>
              </a>
            ))}
          </nav>
        </div>
        
        {/* Footer & Toggle */}
        <div className="flex-shrink-0 p-2 border-t border-blue-800 space-y-2">
            <a 
                href="https://www.facebook.com/share/16Kyy8Db1G/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`items-center justify-center text-xs text-blue-200 hover:text-white transition-colors ${isCollapsed ? 'hidden' : 'flex'}`}
            >
                <span className="mr-2">Developer by HM.Abdul Alim</span>
                <FacebookIcon className="h-4 w-4" />
            </a>
            {/* Desktop Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex w-full items-center justify-center p-2 rounded-lg text-blue-200 hover:bg-secondary hover:text-white transition-colors"
                title={isCollapsed ? "মেনু প্রসারিত করুন" : "মেনু লুকান"}
            >
                {isCollapsed ? <ChevronDoubleRightIcon className="h-5 w-5" /> : <ChevronDoubleLeftIcon className="h-5 w-5" />}
            </button>
        </div>
      </div>
      
      {/* Mobile Overlay */}
      {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black opacity-50 z-30 lg:hidden"></div>}
    </>
  );
};

export default Sidebar;