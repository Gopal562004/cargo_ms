// // // // import React, { useState } from 'react';
// // // // import { NavLink, useNavigate, useLocation } from 'react-router-dom';
// // // // import { useAuthStore } from '../../store/authStore';
// // // // import {
// // // //   LayoutDashboard,
// // // //   Plus,
// // // //   FileText,
// // // //   Plane,
// // // //   FileEdit,
// // // //   ClipboardList,
// // // //   Zap,
// // // //   Radio,
// // // //   Anchor,
// // // //   Ship,
// // // //   Folder,
// // // //   Users,
// // // //   LayoutTemplate,
// // // //   Settings,
// // // //   LogOut,
// // // //   ChevronLeft,
// // // //   ChevronRight,
// // // //   User,
// // // //   Sun,
// // // //   Moon,
// // // // } from 'lucide-react';

// // // // const NAV_SECTIONS = [
// // // //   {
// // // //     title: 'Main',
// // // //     items: [
// // // //       { path: '/', label: 'Dashboard', icon: LayoutDashboard },
// // // //       { path: '/new', label: 'New Document', icon: Plus },
// // // //       { path: '/documents', label: 'All Documents', icon: FileText },
// // // //     ],
// // // //   },
// // // //   {
// // // //     title: 'Air Freight',
// // // //     items: [
// // // //       { path: '/documents?category=AIR_FREIGHT', label: 'Air Waybills', icon: Plane },
// // // //       { path: '/documents/new/MAWB', label: 'New AWB', icon: FileEdit },
// // // //       { path: '/documents/new/HAWB', label: 'New HAWB', icon: ClipboardList },
// // // //     ],
// // // //   },
// // // //   {
// // // //     title: 'eAWB / Cargo-IMP',
// // // //     items: [
// // // //       { path: '/documents?category=EDI', label: 'EDI Documents', icon: Zap },
// // // //       { path: '/documents/new/FWB', label: 'New FWB', icon: Radio },
// // // //     ],
// // // //   },
// // // //   {
// // // //     title: 'Sea Freight',
// // // //     items: [
// // // //       { path: '/documents?category=SEA_FREIGHT', label: 'Sea Documents', icon: Anchor },
// // // //       { path: '/documents/new/BILL_OF_LADING', label: 'New B/L', icon: Ship },
// // // //     ],
// // // //   },
// // // //   {
// // // //     title: 'Other',
// // // //     items: [
// // // //       { path: '/documents?category=OTHER', label: 'Other Documents', icon: Folder },
// // // //       { path: '/contacts', label: 'Contacts', icon: Users },
// // // //       { path: '/templates', label: 'Templates', icon: LayoutTemplate },
// // // //     ],
// // // //   },
// // // // ];

// // // // const ThemeToggle = ({ theme, toggleTheme }) => (
// // // //   <button
// // // //     onClick={toggleTheme}
// // // //     className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
// // // //     aria-label="Toggle theme"
// // // //   >
// // // //     {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
// // // //   </button>
// // // // );

// // // // export default function Sidebar() {
// // // //   const [collapsed, setCollapsed] = useState(false);
// // // //   const { user, logout } = useAuthStore();
// // // //   const navigate = useNavigate();
// // // //   const location = useLocation();

// // // //   const [theme, setTheme] = useState(() => {
// // // //     const stored = localStorage.getItem('theme');
// // // //     if (stored === 'light' || stored === 'dark') return stored;
// // // //     return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
// // // //   });

// // // //   const toggleTheme = () => {
// // // //     const newTheme = theme === 'dark' ? 'light' : 'dark';
// // // //     setTheme(newTheme);
// // // //     localStorage.setItem('theme', newTheme);
// // // //     document.documentElement.classList.toggle('dark', newTheme === 'dark');
// // // //   };

// // // //   const handleLogout = () => {
// // // //     logout();
// // // //     navigate('/login');
// // // //   };

// // // //   const isLinkActive = (itemPath) => {
// // // //     const currentPathWithQuery = location.pathname + location.search;
// // // //     if (itemPath.includes('?')) {
// // // //       return currentPathWithQuery === itemPath;
// // // //     }
// // // //     if (itemPath === '/') {
// // // //       return location.pathname === '/';
// // // //     }
// // // //     return location.pathname === itemPath && !location.search;
// // // //   };

// // // //   return (
// // // //     <aside
// // // //       className={`
// // // //         h-screen sticky top-0 flex flex-col 
// // // //         transition-all duration-300 ease-in-out z-40 select-none
// // // //         border-r
// // // //         ${collapsed ? 'w-16' : 'w-64'}
// // // //         bg-neutral-50/80 backdrop-blur-sm border-neutral-200/70 shadow-sm
// // // //         dark:bg-slate-900/80 dark:backdrop-blur-xl dark:border-slate-800/80 dark:shadow-xl
// // // //       `}
// // // //     >
// // // //       <div className="h-14 flex items-center justify-between px-4 border-b border-neutral-200/70 dark:border-slate-800/80">
// // // //         <div className="flex items-center gap-3 overflow-hidden">
// // // //           <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 dark:shadow-indigo-500/30 shrink-0">
// // // //             ✈
// // // //           </div>
// // // //           {!collapsed && (
// // // //             <span className="font-bold text-base text-slate-800 dark:text-slate-100 whitespace-nowrap">
// // // //               AWB Editor
// // // //             </span>
// // // //           )}
// // // //         </div>
// // // //         <button
// // // //           className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800/60 transition-colors"
// // // //           onClick={() => setCollapsed(!collapsed)}
// // // //           aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
// // // //         >
// // // //           {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
// // // //         </button>
// // // //       </div>

// // // //       <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
// // // //         {NAV_SECTIONS.map((section) => (
// // // //           <div key={section.title} className="space-y-1">
// // // //             {!collapsed && (
// // // //               <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
// // // //                 {section.title}
// // // //               </p>
// // // //             )}
// // // //             {section.items.map((item) => {
// // // //               const active = isLinkActive(item.path);
// // // //               const Icon = item.icon;
// // // //               return (
// // // //                 <NavLink
// // // //                   key={item.path}
// // // //                   to={item.path}
// // // //                   className={`
// // // //                     flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
// // // //                     ${collapsed ? 'justify-center px-0' : ''}
// // // //                     ${
// // // //                       active
// // // //                         ? `
// // // //                           bg-indigo-50 text-indigo-700 border border-indigo-200
// // // //                           dark:bg-indigo-600/15 dark:text-indigo-400 dark:border-indigo-500/30
// // // //                           shadow-sm dark:shadow-indigo-500/10
// // // //                         `
// // // //                         : `
// // // //                           text-slate-600 hover:text-slate-800 hover:bg-slate-100/70 border border-transparent
// // // //                           dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60
// // // //                         `
// // // //                     }
// // // //                   `}
// // // //                   title={collapsed ? item.label : undefined}
// // // //                 >
// // // //                   <Icon size={18} className="shrink-0" />
// // // //                   {!collapsed && <span className="truncate">{item.label}</span>}
// // // //                 </NavLink>
// // // //               );
// // // //             })}
// // // //           </div>
// // // //         ))}
// // // //       </nav>

// // // //       <div className="p-3 border-t border-neutral-200/70 dark:border-slate-800/80 bg-neutral-50/50 dark:bg-slate-900/40 space-y-2">
// // // //         <div
// // // //           className={`
// // // //             flex items-center gap-3 p-2 rounded-lg
// // // //             ${collapsed ? 'justify-center' : ''}
// // // //           `}
// // // //         >
// // // //           <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-semibold flex items-center justify-center text-xs shadow-md shadow-indigo-500/20 dark:shadow-indigo-500/30 shrink-0">
// // // //             {user?.name?.charAt(0)?.toUpperCase() || <User size={14} />}
// // // //           </div>
// // // //           {!collapsed && (
// // // //             <div className="min-w-0 flex-1">
// // // //               <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
// // // //                 {user?.name || 'User'}
// // // //               </p>
// // // //               <p className="text-[10px] text-slate-500 dark:text-slate-500 truncate">
// // // //                 {user?.role || 'Operator'}
// // // //               </p>
// // // //             </div>
// // // //           )}
// // // //         </div>

// // // //         {!collapsed ? (
// // // //           <div className="grid grid-cols-2 gap-1 pt-1">
// // // //             <NavLink
// // // //               to="/settings"
// // // //               className="flex items-center justify-center gap-1.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100/70 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60 rounded-md transition-colors"
// // // //             >
// // // //               <Settings size={14} />
// // // //               <span>Settings</span>
// // // //             </NavLink>
// // // //             <button
// // // //               className="flex items-center justify-center gap-1.5 py-1.5 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50/70 dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-rose-500/10 rounded-md transition-colors"
// // // //               onClick={handleLogout}
// // // //             >
// // // //               <LogOut size={14} />
// // // //               <span>Logout</span>
// // // //             </button>
// // // //           </div>
// // // //         ) : (
// // // //           <div className="flex justify-center pt-1">
// // // //             <button
// // // //               className="p-2 text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50/70 dark:hover:bg-rose-500/10 rounded-md transition-colors"
// // // //               onClick={handleLogout}
// // // //               aria-label="Logout"
// // // //             >
// // // //               <LogOut size={18} />
// // // //             </button>
// // // //           </div>
// // // //         )}

// // // //         <div className={`flex ${collapsed ? 'justify-center' : 'justify-end'} pt-1`}>
// // // //           <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
// // // //         </div>
// // // //       </div>
// // // //     </aside>
// // // //   );
// // // // }

// // // import React, { useState } from 'react';
// // // import { NavLink, useNavigate, useLocation } from 'react-router-dom';
// // // import { useAuthStore } from '../../store/authStore';
// // // import {
// // //   LayoutDashboard,
// // //   Plus,
// // //   FileText,
// // //   Plane,
// // //   FileEdit,
// // //   ClipboardList,
// // //   Zap,
// // //   Radio,
// // //   Anchor,
// // //   Ship,
// // //   Folder,
// // //   Users,
// // //   LayoutTemplate,
// // //   Settings,
// // //   LogOut,
// // //   ChevronLeft,
// // //   ChevronRight,
// // //   User,
// // //   Sun,
// // //   Moon,
// // // } from 'lucide-react';

// // // const NAV_SECTIONS = [
// // //   {
// // //     title: 'Main',
// // //     items: [
// // //       { path: '/', label: 'Dashboard', icon: LayoutDashboard },
// // //       { path: '/new', label: 'New Document', icon: Plus },
// // //       { path: '/documents', label: 'All Documents', icon: FileText },
// // //     ],
// // //   },
// // //   {
// // //     title: 'Air Freight',
// // //     items: [
// // //       { path: '/documents?category=AIR_FREIGHT', label: 'Air Waybills', icon: Plane },
// // //       { path: '/documents/new/MAWB', label: 'New AWB', icon: FileEdit },
// // //       { path: '/documents/new/HAWB', label: 'New HAWB', icon: ClipboardList },
// // //     ],
// // //   },
// // //   {
// // //     title: 'eAWB / Cargo-IMP',
// // //     items: [
// // //       { path: '/documents?category=EDI', label: 'EDI Documents', icon: Zap },
// // //       { path: '/documents/new/FWB', label: 'New FWB', icon: Radio },
// // //     ],
// // //   },
// // //   {
// // //     title: 'Sea Freight',
// // //     items: [
// // //       { path: '/documents?category=SEA_FREIGHT', label: 'Sea Documents', icon: Anchor },
// // //       { path: '/documents/new/BILL_OF_LADING', label: 'New B/L', icon: Ship },
// // //     ],
// // //   },
// // //   {
// // //     title: 'Other',
// // //     items: [
// // //       { path: '/documents?category=OTHER', label: 'Other Documents', icon: Folder },
// // //       { path: '/contacts', label: 'Contacts', icon: Users },
// // //       { path: '/templates', label: 'Templates', icon: LayoutTemplate },
// // //     ],
// // //   },
// // // ];

// // // const ThemeToggle = ({ theme, toggleTheme }) => (
// // //   <button
// // //     onClick={toggleTheme}
// // //     className="p-2 rounded-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
// // //     aria-label="Toggle theme"
// // //   >
// // //     {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
// // //   </button>
// // // );

// // // export default function Sidebar() {
// // //   const [collapsed, setCollapsed] = useState(false);
// // //   const { user, logout } = useAuthStore();
// // //   const navigate = useNavigate();
// // //   const location = useLocation();

// // //   const [theme, setTheme] = useState(() => {
// // //     const stored = localStorage.getItem('theme');
// // //     if (stored === 'light' || stored === 'dark') return stored;
// // //     return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
// // //   });

// // //   const toggleTheme = () => {
// // //     const newTheme = theme === 'dark' ? 'light' : 'dark';
// // //     setTheme(newTheme);
// // //     localStorage.setItem('theme', newTheme);
// // //     document.documentElement.classList.toggle('dark', newTheme === 'dark');
// // //   };

// // //   const handleLogout = () => {
// // //     logout();
// // //     navigate('/login');
// // //   };

// // //   const isLinkActive = (itemPath) => {
// // //     const currentPathWithQuery = location.pathname + location.search;
// // //     if (itemPath.includes('?')) {
// // //       return currentPathWithQuery === itemPath;
// // //     }
// // //     if (itemPath === '/') {
// // //       return location.pathname === '/';
// // //     }
// // //     return location.pathname === itemPath && !location.search;
// // //   };

// // //   return (
// // //     <aside
// // //       className={`
// // //         h-screen sticky top-0 flex flex-col 
// // //         transition-all duration-300 ease-in-out z-40 select-none
// // //         border-r
// // //         ${collapsed ? 'w-16' : 'w-64'}
// // //         /* Light mode – clean */
// // //         bg-white/90 backdrop-blur-sm 
// // //         border-gray-200/80
// // //         shadow-[0_2px_12px_rgba(0,0,0,0.04)]
// // //         /* Dark mode – glass */
// // //         dark:bg-slate-900/80 dark:backdrop-blur-xl 
// // //         dark:border-slate-800/80 dark:shadow-xl
// // //         rounded-none
// // //       `}
// // //     >
// // //       {/* Logo */}
// // //       <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200/80 dark:border-slate-800/80">
// // //         <div className="flex items-center gap-3 overflow-hidden">
// // //           <div className="w-8 h-8 rounded-sm bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-500/20 dark:shadow-indigo-500/30 shrink-0">
// // //             ✈
// // //           </div>
// // //           {!collapsed && (
// // //             <span className="font-bold text-base text-gray-800 dark:text-slate-100 whitespace-nowrap">
// // //               AWB Editor
// // //             </span>
// // //           )}
// // //         </div>
// // //         <button
// // //           className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-sm hover:bg-gray-200/70 dark:hover:bg-slate-800/60 transition-colors"
// // //           onClick={() => setCollapsed(!collapsed)}
// // //           aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
// // //         >
// // //           {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
// // //         </button>
// // //       </div>

// // //       {/* Navigation */}
// // //       <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-700">
// // //         {NAV_SECTIONS.map((section) => (
// // //           <div key={section.title} className="space-y-1">
// // //             {!collapsed && (
// // //               <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-2">
// // //                 {section.title}
// // //               </p>
// // //             )}
// // //             {section.items.map((item) => {
// // //               const active = isLinkActive(item.path);
// // //               const Icon = item.icon;
// // //               return (
// // //                 <NavLink
// // //                   key={item.path}
// // //                   to={item.path}
// // //                   className={`
// // //                     flex items-center gap-3 px-3 py-2 text-xs font-medium transition-all duration-200
// // //                     ${collapsed ? 'justify-center px-0' : ''}
// // //                     rounded-sm
// // //                     border border-transparent
// // //                     ${
// // //                       active
// // //                         ? `
// // //                           /* Active – soft background + left accent */
// // //                           bg-indigo-50/80 text-indigo-700
// // //                           border-l-2 border-indigo-500
// // //                           dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-l-indigo-400
// // //                         `
// // //                         : `
// // //                           /* Inactive – clean */
// // //                           text-gray-600 hover:text-gray-800 
// // //                           hover:bg-gray-100/80 
// // //                           dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60
// // //                         `
// // //                     }
// // //                   `}
// // //                   title={collapsed ? item.label : undefined}
// // //                 >
// // //                   <Icon size={18} className="shrink-0" />
// // //                   {!collapsed && <span className="truncate">{item.label}</span>}
// // //                 </NavLink>
// // //               );
// // //             })}
// // //           </div>
// // //         ))}
// // //       </nav>

// // //       {/* User footer */}
// // //       <div className="p-3 border-t border-gray-200/80 dark:border-slate-800/80 bg-gray-50/50 dark:bg-slate-900/40 space-y-2">
// // //         <div
// // //           className={`
// // //             flex items-center gap-3 p-2 rounded-sm
// // //             ${collapsed ? 'justify-center' : ''}
// // //           `}
// // //         >
// // //           <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-semibold flex items-center justify-center text-xs shadow-sm shadow-indigo-500/20 dark:shadow-indigo-500/30 shrink-0">
// // //             {user?.name?.charAt(0)?.toUpperCase() || <User size={14} />}
// // //           </div>
// // //           {!collapsed && (
// // //             <div className="min-w-0 flex-1">
// // //               <p className="text-xs font-medium text-gray-800 dark:text-slate-200 truncate">
// // //                 {user?.name || 'User'}
// // //               </p>
// // //               <p className="text-[10px] text-gray-500 dark:text-slate-500 truncate">
// // //                 {user?.role || 'Operator'}
// // //               </p>
// // //             </div>
// // //           )}
// // //         </div>

// // //         {!collapsed ? (
// // //           <div className="grid grid-cols-2 gap-1 pt-1">
// // //             <NavLink
// // //               to="/settings"
// // //               className="flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60 rounded-sm transition-colors"
// // //             >
// // //               <Settings size={14} />
// // //               <span>Settings</span>
// // //             </NavLink>
// // //             <button
// // //               className="flex items-center justify-center gap-1.5 py-1.5 text-xs text-rose-500 hover:text-rose-700 hover:bg-rose-50/80 dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-rose-500/10 rounded-sm transition-colors"
// // //               onClick={handleLogout}
// // //             >
// // //               <LogOut size={14} />
// // //               <span>Logout</span>
// // //             </button>
// // //           </div>
// // //         ) : (
// // //           <div className="flex justify-center pt-1">
// // //             <button
// // //               className="p-2 text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50/80 dark:hover:bg-rose-500/10 rounded-sm transition-colors"
// // //               onClick={handleLogout}
// // //               aria-label="Logout"
// // //             >
// // //               <LogOut size={18} />
// // //             </button>
// // //           </div>
// // //         )}

// // //         <div className={`flex ${collapsed ? 'justify-center' : 'justify-end'} pt-1`}>
// // //           <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
// // //         </div>
// // //       </div>
// // //     </aside>
// // //   );
// // // }

// // import React, { useState } from 'react';
// // import { NavLink, useNavigate, useLocation } from 'react-router-dom';
// // import { useAuthStore } from '../../store/authStore';
// // import {
// //   LayoutDashboard,
// //   Plus,
// //   FileText,
// //   Plane,
// //   FileEdit,
// //   ClipboardList,
// //   Zap,
// //   Radio,
// //   Anchor,
// //   Ship,
// //   Folder,
// //   Users,
// //   LayoutTemplate,
// //   Settings,
// //   LogOut,
// //   ChevronLeft,
// //   ChevronRight,
// //   User,
// //   Sun,
// //   Moon,
// //   Box,
// // } from 'lucide-react';

// // const NAV_SECTIONS = [
// //   {
// //     title: 'Core Operations',
// //     items: [
// //       { path: '/', label: 'Dashboard', icon: LayoutDashboard },
// //       { path: '/new', label: 'New Document', icon: Plus },
// //       { path: '/documents', label: 'All Manifests', icon: FileText },
// //     ],
// //   },
// //   {
// //     title: 'Air Freight',
// //     items: [
// //       { path: '/documents?category=AIR_FREIGHT', label: 'Air Waybills', icon: Plane },
// //       { path: '/documents/new/MAWB', label: 'New MAWB', icon: FileEdit },
// //       { path: '/documents/new/HAWB', label: 'New HAWB', icon: ClipboardList },
// //     ],
// //   },
// //   {
// //     title: 'eAWB / EDI',
// //     items: [
// //       { path: '/documents?category=EDI', label: 'EDI Documents', icon: Zap },
// //       { path: '/documents/new/FWB', label: 'New FWB Message', icon: Radio },
// //     ],
// //   },
// //   {
// //     title: 'Ocean Freight',
// //     items: [
// //       { path: '/documents?category=SEA_FREIGHT', label: 'Sea Documents', icon: Anchor },
// //       { path: '/documents/new/BILL_OF_LADING', label: 'Bill of Lading', icon: Ship },
// //     ],
// //   },
// //   {
// //     title: 'Management',
// //     items: [
// //       { path: '/documents?category=OTHER', label: 'Archives', icon: Folder },
// //       { path: '/contacts', label: 'Directory', icon: Users },
// //       { path: '/templates', label: 'Templates', icon: LayoutTemplate },
// //     ],
// //   },
// // ];

// // export default function Sidebar() {
// //   const [collapsed, setCollapsed] = useState(false);
// //   const { user, logout } = useAuthStore();
// //   const navigate = useNavigate();
// //   const location = useLocation();

// //   const [theme, setTheme] = useState(() => {
// //     const stored = localStorage.getItem('theme');
// //     if (stored === 'light' || stored === 'dark') return stored;
// //     return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
// //   });

// //   const toggleTheme = () => {
// //     const newTheme = theme === 'dark' ? 'light' : 'dark';
// //     setTheme(newTheme);
// //     localStorage.setItem('theme', newTheme);
// //     document.documentElement.classList.toggle('dark', newTheme === 'dark');
// //   };

// //   const handleLogout = () => {
// //     logout();
// //     navigate('/login');
// //   };

// //   const isLinkActive = (itemPath) => {
// //     const currentPathWithQuery = location.pathname + location.search;
// //     if (itemPath.includes('?')) return currentPathWithQuery === itemPath;
// //     if (itemPath === '/') return location.pathname === '/';
// //     return location.pathname === itemPath && !location.search;
// //   };

// //   return (
// //     <aside
// //       className={`
// //         h-screen sticky top-0 flex flex-col justify-between
// //         transition-all duration-200 ease-linear z-40 select-none
// //         border-r rounded-none
// //         ${collapsed ? 'w-16' : 'w-60'}
        
// //         /* Light Mode: Sharp off-white slate with clean boundaries */
// //         bg-slate-100/90 border-slate-300/80
        
// //         /* Dark Mode: Matte zinc dark with sharp edge */
// //         dark:bg-zinc-950 dark:border-zinc-800
// //       `}
// //     >
// //       {/* Upper Navigation Container */}
// //       <div className="flex flex-col flex-1 min-h-0">
        
// //         {/* Brand Header */}
// //         <div className="h-14 flex items-center justify-between px-3.5 border-b border-slate-300/70 dark:border-zinc-800/80">
// //           <div className="flex items-center gap-2.5 overflow-hidden">
// //             <div className="w-7 h-7 rounded-none bg-slate-900 dark:bg-zinc-100 text-slate-100 dark:text-zinc-900 flex items-center justify-center shrink-0">
// //               <Box size={16} className="stroke-[2.2]" />
// //             </div>
// //             {!collapsed && (
// //               <span className="font-mono text-xs font-bold tracking-wider text-slate-900 dark:text-zinc-100 uppercase truncate">
// //                 CARGO // OS
// //               </span>
// //             )}
// //           </div>

// //           <button
// //             onClick={() => setCollapsed(!collapsed)}
// //             aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
// //             className="p-1 rounded-none text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-200 dark:hover:bg-zinc-900 transition-colors"
// //           >
// //             {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
// //           </button>
// //         </div>

// //         {/* Scrollable Navigation */}
// //         <nav className="flex-1 overflow-y-auto py-3 space-y-4 scrollbar-none">
// //           {NAV_SECTIONS.map((section) => (
// //             <div key={section.title} className="space-y-0.5">
// //               {!collapsed ? (
// //                 <p className="px-3.5 text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-1.5">
// //                   {section.title}
// //                 </p>
// //               ) : (
// //                 <div className="h-px bg-slate-300/60 dark:bg-zinc-800/80 mx-2 my-2" />
// //               )}

// //               {section.items.map((item) => {
// //                 const active = isLinkActive(item.path);
// //                 const Icon = item.icon;

// //                 return (
// //                   <NavLink
// //                     key={item.path}
// //                     to={item.path}
// //                     className={`
// //                       group relative flex items-center gap-3 px-3.5 py-2 text-xs font-medium transition-all duration-100 rounded-none
// //                       ${collapsed ? 'justify-center px-0 py-2.5' : ''}
// //                       ${
// //                         active
// //                           ? `
// //                             /* Minimal Left Accent Strip */
// //                             border-l-2 border-slate-900 dark:border-zinc-100
// //                             bg-slate-200/80 dark:bg-zinc-900
// //                             text-slate-900 dark:text-zinc-100 font-semibold
// //                           `
// //                           : `
// //                             border-l-2 border-transparent
// //                             text-slate-600 dark:text-zinc-400
// //                             hover:text-slate-900 dark:hover:text-zinc-100
// //                             hover:bg-slate-200/50 dark:hover:bg-zinc-900/60
// //                           `
// //                       }
// //                     `}
// //                   >
// //                     <Icon size={16} className="shrink-0" />

// //                     {!collapsed ? (
// //                       <span className="truncate">{item.label}</span>
// //                     ) : (
// //                       <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 dark:bg-zinc-100 text-slate-100 dark:text-zinc-900 text-[10px] font-mono rounded-none opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-100 whitespace-nowrap z-50 shadow-md">
// //                         {item.label}
// //                       </div>
// //                     )}
// //                   </NavLink>
// //                 );
// //               })}
// //             </div>
// //           ))}
// //         </nav>
// //       </div>

// //       {/* Footer Profile & Actions */}
// //       <div className="border-t border-slate-300/70 dark:border-zinc-800/80 bg-slate-200/40 dark:bg-zinc-950 p-2.5 space-y-2">
// //         {/* User Status Bar */}
// //         <div
// //           className={`
// //             flex items-center gap-2.5 p-1.5 border border-slate-300/60 dark:border-zinc-800/80 bg-slate-100 dark:bg-zinc-900/80 rounded-none
// //             ${collapsed ? 'justify-center p-1' : ''}
// //           `}
// //         >
// //           <div className="w-6 h-6 rounded-none bg-slate-900 dark:bg-zinc-100 text-slate-100 dark:text-zinc-900 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
// //             {user?.name?.charAt(0)?.toUpperCase() || <User size={12} />}
// //           </div>

// //           {!collapsed && (
// //             <div className="min-w-0 flex-1">
// //               <p className="text-[11px] font-semibold text-slate-900 dark:text-zinc-100 truncate leading-none">
// //                 {user?.name || 'Operator'}
// //               </p>
// //               <p className="text-[9px] font-mono text-slate-500 dark:text-zinc-400 truncate mt-0.5">
// //                 {user?.role || 'SYS_ADMIN'}
// //               </p>
// //             </div>
// //           )}
// //         </div>

// //         {/* Toolbar Controls */}
// //         <div className={`flex items-center ${collapsed ? 'flex-col gap-1' : 'justify-between'} pt-0.5`}>
// //           {!collapsed && (
// //             <NavLink
// //               to="/settings"
// //               className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-mono text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-200 dark:hover:bg-zinc-900 rounded-none transition-colors"
// //             >
// //               <Settings size={13} />
// //               <span>SETTINGS</span>
// //             </NavLink>
// //           )}

// //           <div className={`flex items-center ${collapsed ? 'flex-col gap-1' : 'gap-0.5'}`}>
// //             <button
// //               onClick={toggleTheme}
// //               className="p-1 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-200 dark:hover:bg-zinc-900 rounded-none transition-colors"
// //               aria-label="Toggle theme"
// //             >
// //               {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
// //             </button>

// //             <button
// //               onClick={handleLogout}
// //               className="p-1 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/50 rounded-none transition-colors"
// //               aria-label="Logout"
// //             >
// //               <LogOut size={14} />
// //             </button>
// //           </div>
// //         </div>
// //       </div>
// //     </aside>
// //   );
// // }

// import React, { useState, useEffect } from 'react';
// import { NavLink, useNavigate, useLocation } from 'react-router-dom';
// import { useAuthStore } from '../../store/authStore';
// import {
//   LayoutDashboard,
//   Plus,
//   FileText,
//   Plane,
//   FileEdit,
//   ClipboardList,
//   Zap,
//   Radio,
//   Anchor,
//   Ship,
//   Folder,
//   Users,
//   LayoutTemplate,
//   Settings,
//   LogOut,
//   ChevronLeft,
//   ChevronRight,
//   User,
//   Sun,
//   Moon,
//   Package,
// } from 'lucide-react';

// const NAV_SECTIONS = [
//   {
//     title: 'Core Operations',
//     items: [
//       { path: '/', label: 'Dashboard', icon: LayoutDashboard },
//       { path: '/new', label: 'New Document', icon: Plus },
//       { path: '/documents', label: 'All Documents', icon: FileText },
//     ],
//   },
//   {
//     title: 'Air Freight',
//     items: [
//       { path: '/documents?category=AIR_FREIGHT', label: 'Air Waybills', icon: Plane },
//       { path: '/documents/new/MAWB', label: 'New MAWB', icon: FileEdit },
//       { path: '/documents/new/HAWB', label: 'New HAWB', icon: ClipboardList },
//     ],
//   },
//   {
//     title: 'eAWB / EDI',
//     items: [
//       { path: '/documents?category=EDI', label: 'EDI Documents', icon: Zap },
//       { path: '/documents/new/FWB', label: 'New FWB Transmission', icon: Radio },
//     ],
//   },
//   {
//     title: 'Ocean Freight',
//     items: [
//       { path: '/documents?category=SEA_FREIGHT', label: 'Sea Documents', icon: Anchor },
//       { path: '/documents/new/BILL_OF_LADING', label: 'Bill of Lading', icon: Ship },
//     ],
//   },
//   {
//     title: 'Management',
//     items: [
//       { path: '/documents?category=OTHER', label: 'Archives', icon: Folder },
//       { path: '/contacts', label: 'Directory', icon: Users },
//       { path: '/templates', label: 'Templates', icon: LayoutTemplate },
//     ],
//   },
// ];

// export default function Sidebar() {
//   const [collapsed, setCollapsed] = useState(false);
//   const { user, logout } = useAuthStore();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [theme, setTheme] = useState(() => {
//     const stored = localStorage.getItem('theme');
//     if (stored === 'light' || stored === 'dark') return stored;
//     return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
//   });

//   useEffect(() => {
//     document.documentElement.classList.toggle('dark', theme === 'dark');
//   }, [theme]);

//   const toggleTheme = () => {
//     const newTheme = theme === 'dark' ? 'light' : 'dark';
//     setTheme(newTheme);
//     localStorage.setItem('theme', newTheme);
//   };

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   const isLinkActive = (itemPath) => {
//     const currentPathWithQuery = location.pathname + location.search;
//     if (itemPath.includes('?')) return currentPathWithQuery === itemPath;
//     if (itemPath === '/') return location.pathname === '/';
//     return location.pathname === itemPath && !location.search;
//   };

//   return (
//     <aside
//       className={`
//         h-screen sticky top-0 flex flex-col justify-between
//         transition-all duration-200 ease-in-out z-40 select-none border-r
//         ${collapsed ? 'w-16' : 'w-60'}
        
//         /* Light Mode: Soft slate-50 canvas */
//         bg-slate-50 border-slate-200/90 text-slate-800
        
//         /* Dark Mode: Deep slate-900 (NO pure black) */
//         dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200
//       `}
//     >
//       {/* Top Header & Vertical-Spanning Navigation */}
//       <div className="flex flex-col flex-1 min-h-0">
        
//         {/* Brand Header */}
//         <div className="h-14 flex items-center justify-between px-3.5 border-b border-slate-200/80 dark:border-slate-800/80 shrink-0">
//           <div className="flex items-center gap-2.5 overflow-hidden">
//             <div className="w-7 h-7 rounded-sm bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
//               <Package size={16} className="stroke-[2.2]" />
//             </div>
//             {!collapsed && (
//               <div className="flex flex-col truncate">
//                 <span className="font-semibold text-xs tracking-wider uppercase text-slate-900 dark:text-slate-100">
//                   Cargo<span className="text-indigo-600 dark:text-indigo-400">Hub</span>
//                 </span>
//                 <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">
//                   Logistics OS
//                 </span>
//               </div>
//             )}
//           </div>

//           <button
//             onClick={() => setCollapsed(!collapsed)}
//             aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
//             className="p-1 rounded-sm text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/70 transition-colors"
//           >
//             {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
//           </button>
//         </div>

//         {/* Dynamic Spaced Navigation - Spreads across 100% of available height */}
//         <nav className="flex-1 flex flex-col justify-between py-4 px-2 min-h-0 overflow-y-auto scrollbar-none">
//           {NAV_SECTIONS.map((section) => (
//             <div key={section.title} className="space-y-1">
//               {!collapsed ? (
//                 <p className="px-2 text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
//                   {section.title}
//                 </p>
//               ) : (
//                 <div className="h-px bg-slate-200 dark:bg-slate-800 mx-1 my-1" />
//               )}

//               <div className="space-y-0.5">
//                 {section.items.map((item) => {
//                   const active = isLinkActive(item.path);
//                   const Icon = item.icon;

//                   return (
//                     <NavLink
//                       key={item.path}
//                       to={item.path}
//                       className={`
//                         group relative flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-xs transition-all duration-150
//                         ${collapsed ? 'justify-center px-0 py-2.5' : ''}
//                         ${
//                           active
//                             ? `
//                               bg-indigo-50/80 text-indigo-700 font-medium border-l-2 border-indigo-600
//                               dark:bg-slate-800/90 dark:text-indigo-400 dark:border-indigo-400
//                             `
//                             : `
//                               border-l-2 border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50
//                               dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/50
//                             `
//                         }
//                       `}
//                     >
//                       <Icon
//                         size={16}
//                         className={`shrink-0 ${
//                           active
//                             ? 'text-indigo-600 dark:text-indigo-400'
//                             : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
//                         }`}
//                       />

//                       {!collapsed ? (
//                         <span className="truncate">{item.label}</span>
//                       ) : (
//                         <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-slate-100 dark:bg-slate-200 dark:text-slate-900 text-[10px] font-mono rounded-sm opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-50 shadow-md">
//                           {item.label}
//                         </div>
//                       )}
//                     </NavLink>
//                   );
//                 })}
//               </div>
//             </div>
//           ))}
//         </nav>
//       </div>

//       {/* Bottom Footer Section */}
//       <div className="p-2 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-100/50 dark:bg-slate-900/60 space-y-1.5 shrink-0">
//         {/* User Card */}
//         <div
//           className={`
//             flex items-center gap-2.5 p-1.5 rounded-sm bg-white dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800/80
//             ${collapsed ? 'justify-center p-1 border-0 bg-transparent dark:bg-transparent' : ''}
//           `}
//         >
//           <div className="w-6 h-6 rounded-sm bg-indigo-100 text-indigo-700 dark:bg-slate-700 dark:text-indigo-300 font-semibold flex items-center justify-center text-[10px] shrink-0">
//             {user?.name?.charAt(0)?.toUpperCase() || <User size={12} />}
//           </div>

//           {!collapsed && (
//             <div className="min-w-0 flex-1">
//               <p className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate leading-tight">
//                 {user?.name || 'Operator'}
//               </p>
//               <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate">
//                 {user?.role || 'Dispatcher'}
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Settings & Controls */}
//         <div className={`flex items-center ${collapsed ? 'flex-col gap-1' : 'justify-between'} pt-0.5`}>
//           {!collapsed && (
//             <NavLink
//               to="/settings"
//               className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 rounded-sm transition-colors"
//             >
//               <Settings size={13} />
//               <span>Settings</span>
//             </NavLink>
//           )}

//           <div className={`flex items-center ${collapsed ? 'flex-col gap-1' : 'gap-1'}`}>
//             <button
//               onClick={toggleTheme}
//               className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 rounded-sm transition-colors"
//               aria-label="Toggle theme"
//               title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
//             >
//               {theme === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} />}
//             </button>

//             <button
//               onClick={handleLogout}
//               className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 rounded-sm transition-colors"
//               aria-label="Logout"
//               title="Logout"
//             >
//               <LogOut size={14} />
//             </button>
//           </div>
//         </div>
//       </div>
//     </aside>
//   );
// }

import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard,
  Plus,
  FileText,
  Plane,
  FileEdit,
  ClipboardList,
  Zap,
  Radio,
  Anchor,
  Ship,
  Folder,
  Users,
  LayoutTemplate,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Sun,
  Moon,
  Package,
  Receipt,
  Printer,
  Bookmark,
} from 'lucide-react';

const NAV_SECTIONS = [
  {
    title: 'Core Operations',
    items: [
      { path: '/', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/new', label: 'New Document', icon: Plus },
      { path: '/documents', label: 'All Documents', icon: FileText },
    ],
  },
  {
    title: 'Billing & Invoices',
    items: [
      { path: '/billing', label: 'Bills Register & Hub', icon: Receipt },
      { path: '/billing/sheet', label: '📄 Live Sheet Editor (WYSIWYG)', icon: FileEdit },
      { path: '/billing/new', label: '➕ Create New Bill', icon: Printer },
      { path: '/billing/templates', label: 'Saved Templates & Parties', icon: Bookmark },
    ],
  },
  {
    title: 'Air Freight',
    items: [
      { path: '/documents?category=AIR_FREIGHT', label: 'Air Waybills', icon: Plane },
      { path: '/documents/new/MAWB', label: 'New MAWB', icon: FileEdit },
      { path: '/documents/new/HAWB', label: 'New HAWB', icon: ClipboardList },
    ],
  },
  {
    title: 'eAWB / EDI',
    items: [
      { path: '/documents?category=EDI', label: 'EDI Documents', icon: Zap },
      { path: '/documents/new/FWB', label: 'New FWB Message', icon: Radio },
    ],
  },
  {
    title: 'Ocean Freight',
    items: [
      { path: '/documents?category=SEA_FREIGHT', label: 'Sea Documents', icon: Anchor },
      { path: '/documents/new/BILL_OF_LADING', label: 'Bill of Lading', icon: Ship },
    ],
  },
  {
    title: 'Management',
    items: [
      { path: '/documents?category=OTHER', label: 'Other Documents', icon: Folder },
      { path: '/contacts', label: 'Directory', icon: Users },
      { path: '/templates', label: 'Templates', icon: LayoutTemplate },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isLinkActive = (itemPath) => {
    const currentPathWithQuery = location.pathname + location.search;
    if (itemPath.includes('?')) return currentPathWithQuery === itemPath;
    if (itemPath === '/') return location.pathname === '/';
    return location.pathname === itemPath && !location.search;
  };

  return (
    <aside
      className={`
        h-screen sticky top-0 flex flex-col justify-between
        transition-all duration-200 ease-in-out z-40 select-none border-r
        ${collapsed ? 'w-18' : 'w-64'}
        
        /* Light Mode: Anti-glare soft slate canvas */
        bg-slate-50 border-slate-200/90 text-slate-800
        
        /* Dark Mode: Deep Midnight Blue-Slate (NO pure black) */
        dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200
      `}
    >
      {/* Upper Brand & Navigation Container */}
      <div className="flex flex-col flex-1 min-h-0">
        
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/80 dark:border-slate-800/80 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-sm bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Package size={18} className="stroke-[2.2]" />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-semibold text-sm tracking-wider uppercase text-slate-900 dark:text-slate-100 leading-tight">
                  Cargo<span className="text-indigo-600 dark:text-indigo-400">Hub</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Logistics OS
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 rounded-sm text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/70 transition-colors"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Scrollable Navigation Items with Generous Spacing */}
        <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-6 scrollbar-none">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1.5">
              {!collapsed ? (
                <p className="px-3 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                  {section.title}
                </p>
              ) : (
                <div className="h-px bg-slate-200 dark:bg-slate-800 mx-1.5 my-3" />
              )}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const active = isLinkActive(item.path);
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={`
                        group relative flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-all duration-150
                        ${collapsed ? 'justify-center px-0 py-3' : ''}
                        ${
                          active
                            ? `
                              /* Active State with Left Indicator Strip */
                              bg-indigo-50/90 text-indigo-700 border-l-2 border-indigo-600
                              dark:bg-slate-800 dark:text-indigo-400 dark:border-indigo-400
                            `
                            : `
                              border-l-2 border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60
                              dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60
                            `
                        }
                      `}
                    >
                      <Icon
                        size={19}
                        className={`shrink-0 ${
                          active
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'
                        }`}
                      />

                      {!collapsed ? (
                        <span className="truncate">{item.label}</span>
                      ) : (
                        /* Collapsed Hover Tooltip */
                        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-800 text-slate-100 dark:bg-slate-200 dark:text-slate-900 text-xs font-mono rounded-sm opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap z-50 shadow-md">
                          {item.label}
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Footer / Profile & Settings */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-100/60 dark:bg-slate-900/80 space-y-2 shrink-0">
        {/* User Status Card */}
        <div
          className={`
            flex items-center gap-3 p-2 rounded-sm bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800
            ${collapsed ? 'justify-center p-1.5 border-0 bg-transparent dark:bg-transparent' : ''}
          `}
        >
          <div className="w-8 h-8 rounded-sm bg-indigo-100 text-indigo-700 dark:bg-slate-700 dark:text-indigo-300 font-semibold flex items-center justify-center text-xs shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || <User size={14} />}
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate leading-tight">
                {user?.name || 'Operator'}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                {user?.role || 'Dispatcher'}
              </p>
            </div>
          )}
        </div>

        {/* Settings & Theme Action Controls */}
        <div className={`flex items-center ${collapsed ? 'flex-col gap-1.5' : 'justify-between'} pt-1`}>
          {!collapsed && (
            <NavLink
              to="/settings"
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 rounded-sm transition-colors"
            >
              <Settings size={15} />
              <span>Settings</span>
            </NavLink>
          )}

          <div className={`flex items-center ${collapsed ? 'flex-col gap-1.5' : 'gap-1'}`}>
            <button
              onClick={toggleTheme}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 rounded-sm transition-colors"
              aria-label="Toggle theme"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            </button>

            <button
              onClick={handleLogout}
              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 rounded-sm transition-colors"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
} 