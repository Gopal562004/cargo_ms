import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Plane,
  Ship,
  Zap,
  Receipt,
  ShieldCheck,
  ArrowRight,
  Sun,
  Moon,
  CheckCircle2,
  TrendingUp,
  FileText,
  Terminal,
  Printer,
  Users,
  Check,
  ShoppingBag,
  Bookmark,
  Calculator,
  ArrowUpRight,
  ChevronRight,
  Layers,
  Sparkles,
  HelpCircle,
  Trash2,
  Edit3,
  Copy,
  Download,
  Eye,
  FileSpreadsheet,
  Clock,
  Search,
  Filter,
  BarChart3,
  QrCode,
  Monitor,
  Apple,
  HardDrive,
  WifiOff,
  FolderOpen,
  MessageSquare,
} from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { getApiBaseUrl } from '../services/api';
import DownloadModal from '../components/ui/DownloadModal';

const APP_VERSION = '1.0.8';

const BUILT_FEATURES = [
  {
    id: 'AWB',
    title: 'Air Waybill Management',
    desc: 'Standard IATA layout, automated volumetric calculation (1:6000 ratio), live preview, and multi-copy PDF print.',
    icon: Plane,
    badge: 'Operational',
  },
  {
    id: 'TAX_INVOICE',
    title: 'GST Freight Tax Invoicing',
    desc: 'Multi-item billing, split CGST/SGST/IGST tax calculation, reverse charge, bank details, and instant print.',
    icon: Receipt,
    badge: 'Operational',
  },
  {
    id: 'DG_PACKAGING',
    title: 'IATA Dangerous Goods Packaging',
    desc: 'Pre-configured UN packaging presets (UN Box X3 to X55, UN Drums Y75/Y30), DGD charges, and packing fees.',
    icon: ShieldCheck,
    badge: 'Operational',
  },
  {
    id: 'PURCHASE_BILLS',
    title: 'Purchase Bills & Vendor Ledger',
    desc: 'Log carrier expenses, terminal/TSP charges, track payables, and manage vendor invoice records.',
    icon: ShoppingBag,
    badge: 'Operational',
  },
  {
    id: 'PROFILES',
    title: 'Custom Billing Profiles & Directory',
    desc: 'Save buyer and consignee addresses, GSTIN numbers, bank details, and terms for 1-click invoice generation.',
    icon: Bookmark,
    badge: 'Operational',
  },
  {
    id: 'DESKTOP',
    title: 'Offline-First Desktop Vault',
    desc: 'Standalone Windows & macOS applications with local storage engine, 30-day offline lease, and direct printing.',
    icon: Monitor,
    badge: 'Operational',
  },
];

const FLIGHTS = [
  { awb: '098-4820-1920', route: 'DEL → LHR', flight: 'AI-161', status: 'IN FLIGHT', eta: '18:45 UTC', wt: '540 kg' },
  { awb: '125-9921-0041', route: 'BOM → FRA', flight: 'LH-757', status: 'CLEARED', eta: '21:10 UTC', wt: '1,280 kg' },
  { awb: '176-3391-4902', route: 'BLR → DXB', flight: 'EK-565', status: 'EDI ACK', eta: '14:20 UTC', wt: '2,450 kg' },
];

const DOC_TEMPLATES = [
  {
    id: 'MAWB',
    title: 'Master Air Waybill (MAWB)',
    code: 'STANDARD AIR WAYBILL',
    badge: 'AIR FREIGHT',
    color: 'border-indigo-500 text-indigo-400 bg-indigo-500/10',
    icon: Plane,
    desc: 'Standardized layout with automated Air Waybill validation, volumetric weight calculation (1:6000 ratio), and multi-copy printing.',
    fields: [
      { label: 'AWB Prefix & Number', val: '098 - 4820 1920' },
      { label: 'Airport of Departure', val: 'DEL (Indira Gandhi Intl, New Delhi)' },
      { label: 'Airport of Destination', val: 'LHR (London Heathrow, UK)' },
      { label: 'Carrier Flight / Date', val: 'AI 161 / 24-AUG-2026' },
      { label: 'Gross / Chargeable Wt', val: '540.0 KG / 580.0 KG (Vol: 3.48 CBM)' },
      { label: 'Rate / Class', val: 'USD 4.85 / kg (Min Charge Applied)' },
    ],
    status: 'ISSUED & READY',
  },
  {
    id: 'TAX_INVOICE',
    title: 'GST Freight Tax Invoice',
    code: 'SAC 996511',
    badge: 'BILLING & SETTLEMENT',
    color: 'border-emerald-500 text-emerald-400 bg-emerald-500/10',
    icon: Receipt,
    desc: 'Automated place-of-supply GST invoice with split CGST/SGST/IGST, freight charges, FSC surcharge, and UPI instant payment QR.',
    fields: [
      { label: 'Invoice No & Date', val: 'INV-2026-0881 / 21-AUG-2026' },
      { label: 'Billed To Client', val: 'Global Pharma Logistics Pvt Ltd' },
      { label: 'Client GSTIN', val: '07AAAAA0000A1Z5 (Delhi)' },
      { label: 'Linked Waybill', val: 'AWB 098-4820 1920 (DEL → LHR)' },
      { label: 'Freight + Surcharges', val: '₹1,40,500.00 (Freight + FSC + X-Ray)' },
      { label: 'GST Applied', val: '₹25,290.00 (18% IGST Inter-state)' },
    ],
    status: 'PAID IN FULL',
  },
  {
    id: 'DGD',
    title: 'Dangerous Goods Declaration',
    code: 'HAZMAT DECLARATION SPEC',
    badge: 'HAZMAT DOCUMENTATION',
    color: 'border-rose-500 text-rose-400 bg-rose-500/10',
    icon: ShieldCheck,
    desc: 'UN 3,500+ hazardous cargo classification with mandatory red-striped hazard borders, emergency response contact, and packaging details.',
    fields: [
      { label: 'UN Number & PSN', val: 'UN 1845 / CARBON DIOXIDE, SOLID (DRY ICE)' },
      { label: 'Hazard Class / Div', val: 'Class 9 (Miscellaneous Dangerous Goods)' },
      { label: 'Packing Group & Inst.', val: 'III / Packing Instruction 954' },
      { label: 'Quantity & Overpack', val: '12 Packages x 10.0 KG Dry Ice (Net: 120 KG)' },
      { label: 'Aircraft Limitation', val: 'PASSENGER AND CARGO AIRCRAFT' },
      { label: '24hr Emergency Desk', val: '+91-11-2849-0000 (EMERGENCY CONTACT)' },
    ],
    status: 'READY FOR DISPATCH',
  },
];

export default function LandingPage() {
  const { theme, toggleTheme } = useThemeStore();
  const { isAuthenticated } = useAuthStore();
  const [liveUtc, setLiveUtc] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [flightIdx, setFlightIdx] = useState(0);
  const [activeTemplate, setActiveTemplate] = useState(DOC_TEMPLATES[0]);

  const [showDownloadModal, setShowDownloadModal] = useState(false);

  useEffect(() => {
    const updateTime = () => setLiveUtc(new Date().toUTCString().replace('GMT', 'UTC'));
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setFlightIdx((prev) => (prev + 1) % FLIGHTS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleMouseMove = (e) => {
    setMousePos({
      x: (e.clientX / window.innerWidth - 0.5) * 12,
      y: (e.clientY / window.innerHeight - 0.5) * 12,
    });
  };

  const currentFlight = FLIGHTS[flightIdx];

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`min-h-screen relative font-sans antialiased selection:bg-indigo-600 selection:text-white transition-colors duration-150 ${
        theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-[#060a12] text-slate-100'
      }`}
    >
      {/* Global Atmospheric Air Cargo Background with Parallax Depth */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/images/cargo_freighter.jpg"
          alt="Cargo Freighter Background"
          className="w-full h-full object-cover object-center scale-105 filter blur-[3px] opacity-40 transition-transform duration-1000"
        />
        {/* Theme-Adaptive Contrast Overlay */}
        <div
          className={`absolute inset-0 transition-colors ${
            theme === 'light'
              ? 'bg-gradient-to-b from-slate-100/95 via-slate-100/90 to-slate-200/98'
              : 'bg-gradient-to-b from-[#060a12]/95 via-[#060a12]/90 to-[#090d16]/98'
          }`}
        />
        {/* Subtle Aviation Radar Grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Top Status Bar (Z-10) */}
      <div
        className={`border-b text-[11px] font-mono py-2 px-6 flex items-center justify-between z-50 relative backdrop-blur-md transition-colors ${
          theme === 'light' ? 'bg-white/80 border-slate-200 text-slate-600' : 'bg-[#070b13]/85 border-slate-800 text-slate-400'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-emerald-500 tracking-wider">FREIGHT & BILLING PLATFORM ONLINE</span>
          <span className="hidden sm:inline text-slate-400">·</span>
          <span className="hidden sm:inline font-mono">{liveUtc || 'UTC TIME'}</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className={`px-2.5 py-1 rounded border text-[10px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors backdrop-blur-md ${
              theme === 'light'
                ? 'bg-white/90 border-slate-200 text-slate-800 hover:bg-slate-100'
                : 'bg-slate-900/90 border-slate-800 text-slate-200 hover:bg-slate-800'
            }`}
          >
            {theme === 'dark' ? <Sun size={12} className="text-amber-400" /> : <Moon size={12} className="text-indigo-600" />}
            <span>{theme === 'dark' ? 'LIGHT' : 'DARK'}</span>
          </button>
        </div>
      </div>

      {/* Main Nav Header (Z-40) */}
      <header
        className={`border-b sticky top-0 z-40 backdrop-blur-xl transition-colors ${
          theme === 'light' ? 'bg-white/85 border-slate-200 shadow-xs' : 'bg-[#090d16]/85 border-slate-800'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Package size={18} />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-wider uppercase leading-tight">
                Cargo<span className="text-indigo-600">Hub</span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                Logistics OS
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-mono">
            <a href="#overview" className="hover:text-indigo-500 transition-colors">OPERATIONS</a>
            <a href="#templates" className="hover:text-indigo-500 transition-colors">DOCUMENTS</a>
            <a href="#features" className="hover:text-indigo-500 transition-colors">FEATURES</a>
            <a href="#download" className="hover:text-indigo-500 transition-colors flex items-center gap-1">
              <Download size={12} className="text-indigo-500" />
              <span>DESKTOP APP</span>
            </a>
            <Link to="/product-tour" className="hover:text-indigo-500 transition-colors">HOW IT WORKS</Link>
            <Link to="/about" className="hover:text-indigo-500 transition-colors font-bold text-indigo-400">ABOUT</Link>
          </nav>

          <div className="flex items-center gap-3 font-mono text-xs">
            {/* Download Desktop App Button */}
            <button
              type="button"
              onClick={() => setShowDownloadModal(true)}
              className={`px-3 py-1.5 rounded border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-indigo-50/80 border-indigo-200 text-indigo-700 hover:bg-indigo-100 shadow-xs'
                  : 'bg-indigo-950/40 border-indigo-800/80 text-indigo-300 hover:bg-indigo-900/60 shadow-xs'
              }`}
              title="Download CargoMS Desktop App for Windows & Mac"
            >
              <Download size={13} className="text-indigo-500 animate-pulse" />
              <span>DOWNLOAD APP</span>
            </button>

            {isAuthenticated ? (
              <Link
                to="/"
                className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors shadow-md shadow-indigo-600/20"
              >
                OPEN APP →
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`px-3.5 py-2 rounded border backdrop-blur-md transition-colors ${
                    theme === 'light'
                      ? 'bg-white/80 border-slate-200 hover:bg-white'
                      : 'bg-slate-900/80 border-slate-800 hover:bg-slate-900'
                  }`}
                >
                  SIGN IN
                </Link>
                <a
                  href="https://wa.me/918237742040?text=Hello%20Gopal%2C%20I%20am%20interested%20in%20CargoMS%20and%20would%20like%20to%20request%20operator%20access."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors shadow-md shadow-indigo-600/20 inline-flex items-center gap-1.5"
                >
                  REQUEST ACCESS
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Spacious Asymmetric Hero Section (Z-10) */}
      <section id="overview" className="relative z-10 border-b border-slate-800/60 py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Concise, High-Impact Text (6 cols) */}
          <div className="lg:col-span-6 space-y-7">
            <div className="space-y-4">
              <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-500 font-bold">
                AVIATION FREIGHT PLATFORM
              </span>

              <h1
                className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}
              >
                Create, manage & track all freight docs.
              </h1>

              <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed max-w-lg">
                Effortlessly create, edit, duplicate, print, and track Air Waybills, GST Invoices, and Dangerous Goods declarations on a single console.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowDownloadModal(true)}
                className="px-6 py-3 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold flex items-center gap-2.5 transition-all shadow-lg shadow-indigo-600/25 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download size={15} />
                <span>DOWNLOAD SOFTWARE (WIN / MAC)</span>
              </button>
              <a
                href="https://wa.me/918237742040?text=Hello%20Gopal%2C%20I%20am%20interested%20in%20CargoMS%20and%20would%20like%20to%20request%20dispatch%20access."
                target="_blank"
                rel="noopener noreferrer"
                className={`px-5 py-3 rounded border font-mono text-xs font-bold backdrop-blur-md transition-colors flex items-center gap-2 ${
                  theme === 'light'
                    ? 'bg-white/90 border-slate-300 hover:bg-white text-slate-800'
                    : 'bg-slate-900/80 border-slate-800 hover:bg-slate-900 text-slate-200'
                }`}
              >
                REQUEST DISPATCH ACCESS <ArrowRight size={14} />
              </a>
              <a
                href="#download"
                className={`px-4 py-3 rounded border font-mono text-xs font-bold backdrop-blur-md transition-colors flex items-center gap-1.5 ${
                  theme === 'light'
                    ? 'bg-white/70 border-slate-200 hover:bg-white text-slate-700'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 text-slate-300'
                }`}
              >
                DESKTOP SPECS ↓
              </a>
            </div>

            {/* Micro spec list */}
            <div className="pt-2 flex items-center gap-6 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500" /> Instant Create</span>
              <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500" /> Live Edit & PDF</span>
              <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-500" /> Track & Delete</span>
            </div>
          </div>

          {/* Right: Promotional Freighter Image & Live Radar Card (6 cols) */}
          <div
            style={{
              transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)`,
            }}
            className="lg:col-span-6 space-y-4"
          >
            {/* Visual Freighter Image Container */}
            <div className="relative rounded overflow-hidden border border-slate-800 shadow-2xl group">
              <img
                src="/images/cargo_freighter.jpg"
                alt="Air Cargo Freighter on Tarmac"
                className="w-full h-56 sm:h-64 object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-[#090d16]/30 to-transparent" />

              {/* Floating Overlay Badge on Image */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-mono">
                <div className="px-2.5 py-1 rounded bg-black/75 backdrop-blur-md border border-white/10 text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>DOCUMENT LIFECYCLE ENGINE: ACTIVE</span>
                </div>
                <span className="px-2 py-1 rounded bg-black/75 backdrop-blur-md border border-white/10 text-indigo-400 font-bold hidden sm:inline">
                  {currentFlight.flight}
                </span>
              </div>
            </div>

            {/* Live Corridor Widget */}
            <div
              className={`p-4 rounded border backdrop-blur-xl space-y-3 font-mono text-xs ${
                theme === 'light' ? 'bg-white/90 border-slate-200 shadow-xs' : 'bg-[#0c1220]/90 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span>ACTIVE FLIGHT CORRIDOR</span>
                <span className="text-indigo-400 font-bold">{currentFlight.awb}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span>{currentFlight.route.split('→')[0]}</span>
                <div className="flex-1 mx-3 flex items-center justify-center relative">
                  <div className="h-px w-full bg-slate-800" />
                  <Plane size={14} className="text-indigo-400 absolute" />
                </div>
                <span>{currentFlight.route.split('→')[1]}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🌟 Visual Photo Spotlight: Dispatch Control Center & Pallet Barcode Scanning */}
      <section id="dispatch-deck" className="relative z-10 py-16 border-b border-slate-800/60">
        <div className="max-w-6xl mx-auto px-6 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-indigo-500">
                ENTERPRISE OPERATIONS
              </span>
              <h2
                className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}
              >
                Built for High-Velocity Freight Teams
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-mono text-slate-400">
              Freight Document Management · Fast Waybill Generation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Card 1: Dispatch Operations Control Center */}
            <div className="relative rounded overflow-hidden border border-slate-800 shadow-xl group">
              <img
                src="/images/cargo_operations_room.jpg"
                alt="Air Cargo Dispatch Operations Center"
                className="w-full h-64 sm:h-72 object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-[#090d16]/40 to-transparent flex flex-col justify-end p-6">
                <span className="px-2.5 py-0.5 rounded bg-indigo-600 text-white font-mono text-[10px] font-bold w-fit uppercase mb-2">
                  DISPATCH ROOM
                </span>
                <h3 className="text-lg font-bold text-white leading-tight">
                  Multi-Operator Operations Coordination
                </h3>
                <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                  Streamlined status coordination between booking agents, accounts, and freight operations teams.
                </p>
              </div>
            </div>

            {/* Image Card 2: Ground Pallet & ULD Barcode Inspection */}
            <div className="relative rounded overflow-hidden border border-slate-800 shadow-xl group">
              <img
                src="/images/cargo_pallet_scanner.jpg"
                alt="Cargo Pallet & Container Management"
                className="w-full h-64 sm:h-72 object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-[#090d16]/40 to-transparent flex flex-col justify-end p-6">
                <span className="px-2.5 py-0.5 rounded bg-emerald-600 text-white font-mono text-[10px] font-bold w-fit uppercase mb-2">
                  CARGO MANAGEMENT
                </span>
                <h3 className="text-lg font-bold text-white leading-tight">
                  Pallet & Container Tracking
                </h3>
                <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                  Organize container IDs, piece counts, and weights connected directly to digital waybill records.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🌟 Interactive Document Lifecycle & Templates Showcase Section (Z-10) */}
      <section id="templates" className="relative z-10 py-20 border-b border-slate-800/60">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-indigo-500">
                DOCUMENT TEMPLATES & LIFECYCLE
              </span>
              <h2
                className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}
              >
                Everything you create, edit, & track.
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
                Choose a document template below to inspect authentic layouts, auto-calculated fields, multi-copy PDF printing, and full management controls.
              </p>
            </div>

            {/* 4 Lifecycle Action Badges */}
            <div className="flex flex-wrap gap-2 text-[11px] font-mono">
              <span className="px-3 py-1 rounded border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 flex items-center gap-1.5">
                <Sparkles size={12} /> 1-Click Create
              </span>
              <span className="px-3 py-1 rounded border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 flex items-center gap-1.5">
                <Edit3 size={12} /> Live Edit
              </span>
              <span className="px-3 py-1 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center gap-1.5">
                <Printer size={12} /> Laser / Thermal PDF
              </span>
              <span className="px-3 py-1 rounded border border-rose-500/30 bg-rose-500/10 text-rose-400 flex items-center gap-1.5">
                <Trash2 size={12} /> Delete & Audit
              </span>
            </div>
          </div>

          {/* Template Tabs Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            {DOC_TEMPLATES.map((tmpl) => {
              const active = activeTemplate.id === tmpl.id;
              const Icon = tmpl.icon;

              return (
                <button
                  key={tmpl.id}
                  onClick={() => setActiveTemplate(tmpl)}
                  className={`p-4 rounded border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 select-none ${
                    active
                      ? theme === 'light'
                        ? 'bg-white border-indigo-600 text-indigo-600 shadow-md ring-1 ring-indigo-500/30'
                        : 'bg-[#0f172a] border-indigo-500 text-indigo-400 shadow-xl ring-1 ring-indigo-500/30'
                      : theme === 'light'
                      ? 'bg-white/70 border-slate-200 text-slate-600 hover:bg-white'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <Icon size={20} className={active ? 'text-indigo-400' : 'text-slate-400'} />
                    <span className="text-[10px] uppercase font-bold text-slate-400">{tmpl.code}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-xs leading-tight text-slate-200">{tmpl.title}</h3>
                    <span className="text-[10px] text-slate-400 mt-1 block">{tmpl.badge}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Live Template Visual Preview Card */}
          <div
            className={`p-6 sm:p-8 rounded border backdrop-blur-xl transition-all space-y-6 ${
              theme === 'light'
                ? 'bg-white/95 border-slate-300 shadow-xl'
                : 'bg-[#0a0f1d]/95 border-slate-800 shadow-2xl'
            }`}
          >
            {/* Template Header & Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/40">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${activeTemplate.color}`}>
                    {activeTemplate.badge}
                  </span>
                  <span className="text-xs font-mono text-slate-400">SPECIFICATION: {activeTemplate.code}</span>
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-slate-100 mt-1">{activeTemplate.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xl">{activeTemplate.desc}</p>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
                <Link
                  to="/register"
                  className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <Sparkles size={13} /> CREATE THIS DOC →
                </Link>
              </div>
            </div>

            {/* Document Layout Sheet Preview */}
            <div className="p-5 sm:p-6 rounded bg-slate-950/90 border border-slate-800 space-y-5 font-mono">
              <div className="flex items-center justify-between text-xs border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <FileText size={15} className="text-indigo-400" />
                  <span className="font-bold text-slate-200">AUTHENTIC DOCUMENT METRICS & COORDINATES</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  ● {activeTemplate.status}
                </span>
              </div>

              {/* Data Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                {activeTemplate.fields.map((f, i) => (
                  <div key={i} className="p-3 rounded bg-slate-900/70 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] text-slate-400 block uppercase">{f.label}</span>
                    <strong className="text-slate-200 text-xs leading-tight block">{f.val}</strong>
                  </div>
                ))}
              </div>

              {/* Management Control Ribbon */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-emerald-400"><Check size={13} /> Auto-Saved Revision</span>
                  <span className="flex items-center gap-1 text-indigo-400"><Copy size={13} /> 1-Click Duplicate</span>
                  <span className="flex items-center gap-1 text-amber-400"><Clock size={13} /> Real-Time Audit Log</span>
                </div>
                <span className="text-slate-400 font-mono">STANDARD AIR WAYBILL & GST INVOICE LAYOUT</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Panoramic Distribution Hub Image Section (Z-10) */}
      <section id="hub-view" className="relative z-10 py-16 border-b border-slate-800/60">
        <div className="max-w-6xl mx-auto px-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-indigo-500">
                GLOBAL LOGISTICS NETWORK
              </span>
              <h2
                className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}
              >
                Engineered for High-Throughput Cargo Terminals
              </h2>
            </div>
            <Link
              to="/product-tour"
              className="text-xs sm:text-sm font-mono text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
            >
              EXPLORE ALL WORKFLOWS →
            </Link>
          </div>

          {/* Panoramic Image Showcase */}
          <div className="relative rounded overflow-hidden border border-slate-800 shadow-2xl">
            <img
              src="/images/cargo_hub.jpg"
              alt="Automated Air Cargo Distribution Hub"
              className="w-full h-64 sm:h-80 lg:h-96 object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent flex items-center p-8 sm:p-12">
              <div className="max-w-md space-y-3 text-white">
                <span className="px-2.5 py-1 rounded bg-indigo-600 text-[10px] font-mono font-bold uppercase">
                  Automated Warehouse Sync
                </span>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Seamless pallet manifests & customs clearance.
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed">
                  Real-time synchronization between forwarders, ground handlers, and airline freight desks.
                </p>
                <div className="pt-2">
                  <Link
                    to="/product-tour"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded bg-white text-slate-900 font-mono text-xs font-bold hover:bg-slate-100 transition-colors"
                  >
                    SEE STEP-BY-STEP TOUR <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Native Desktop Software Suite (Windows, macOS & Linux) (Z-10) */}
      <section id="download" className="relative z-10 py-20 lg:py-24 border-b border-slate-800/60">
        <div className="max-w-6xl mx-auto px-6 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 font-mono text-[10px] font-bold tracking-widest uppercase">
                  ENTERPRISE DESKTOP SUITE
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/20">
                  OFFLINE-FIRST
                </span>
              </div>
              <h2
                className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}
              >
                Zero-Latency Desktop Engine.
              </h2>
              <p className="text-sm sm:text-base text-slate-400 max-w-xl">
                Installed natively on Windows, Mac, or Linux. Features an offline-first high-speed local engine with a 30-day offline lease and high-speed direct thermal barcode printer integration.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowDownloadModal(true)}
              className="px-5 py-2.5 rounded-sm bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-md transition-all shrink-0 cursor-pointer self-start md:self-auto"
            >
              <Download size={15} />
              <span>VIEW ALL PLATFORMS & BUILDS</span>
            </button>
          </div>

          {/* 3 Platform Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Windows */}
            <div
              className={`p-6 rounded-sm border transition-all flex flex-col justify-between group hover:border-indigo-500/50 ${
                theme === 'light'
                  ? 'bg-white border-slate-200 shadow-md hover:shadow-lg'
                  : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900/70 shadow-lg'
              }`}
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-sm bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center">
                  <Monitor size={22} />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base tracking-tight">Windows</h3>
                    <span className="text-[10px] font-mono text-blue-400 font-semibold uppercase">64-Bit / x64</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Windows 10 & 11 compatible. Includes standard NSIS one-click installer and self-contained portable executable.
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/40 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <Check size={12} className="text-emerald-500" />
                    <span>Auto-update background channel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={12} className="text-emerald-500" />
                    <span>Direct High-Speed Thermal & Laser Printing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={12} className="text-emerald-500" />
                    <span>Offline-First Secure Local Storage Engine</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 space-y-2">
                <button
                  type="button"
                  onClick={() => setShowDownloadModal(true)}
                  className="w-full py-2.5 rounded-sm bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download for Windows (.exe)</span>
                </button>
                <p className="text-[10px] text-center text-slate-400 font-mono">
                  v{APP_VERSION} · ~174 MB · Win 10/11
                </p>
              </div>
            </div>

            {/* macOS */}
            <div
              className={`p-6 rounded-sm border transition-all flex flex-col justify-between group hover:border-indigo-500/50 ${
                theme === 'light'
                  ? 'bg-white border-slate-200 shadow-md hover:shadow-lg'
                  : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900/70 shadow-lg'
              }`}
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-sm bg-slate-500/10 border border-slate-500/20 text-slate-300 flex items-center justify-center">
                  <Apple size={22} />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base tracking-tight">macOS</h3>
                    <span className="text-[10px] font-mono text-indigo-400 font-semibold uppercase">Universal DMG</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Optimized for Apple Silicon (M1, M2, M3, M4) with native ARM64 performance and Intel x64 backward compatibility.
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/40 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <Check size={12} className="text-emerald-500" />
                    <span>Apple Silicon Native ARM64 & Intel</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={12} className="text-emerald-500" />
                    <span>macOS Ventura, Sonoma & Sequoia</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={12} className="text-emerald-500" />
                    <span>Retina Display Crisp Vector Graphics</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 space-y-2">
                <button
                  type="button"
                  onClick={() => setShowDownloadModal(true)}
                  className="w-full py-2.5 rounded-sm bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download for Mac (.dmg)</span>
                </button>
                <p className="text-[10px] text-center text-slate-400 font-mono">
                  Universal · macOS 12+
                </p>
              </div>
            </div>

            {/* Linux */}
            <div
              className={`p-6 rounded-sm border transition-all flex flex-col justify-between group hover:border-indigo-500/50 ${
                theme === 'light'
                  ? 'bg-white border-slate-200 shadow-md hover:shadow-lg'
                  : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900/70 shadow-lg'
              }`}
            >
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-sm bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Terminal size={22} />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base tracking-tight">Linux</h3>
                    <span className="text-[10px] font-mono text-amber-400 font-semibold uppercase">AppImage / DEB</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Zero-dependency portable AppImage and native Debian/Ubuntu packages for logistics kiosk workstations.
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/40 text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <Check size={12} className="text-emerald-500" />
                    <span>Universal standalone .AppImage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={12} className="text-emerald-500" />
                    <span>Debian / Ubuntu / Mint .deb package</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={12} className="text-emerald-500" />
                    <span>CUPS Industrial Printing integration</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 space-y-2">
                <button
                  type="button"
                  onClick={() => setShowDownloadModal(true)}
                  className={`w-full py-2.5 rounded-sm border font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700'
                  }`}
                >
                  <Download size={14} />
                  <span>Choose Linux Package</span>
                </button>
                <p className="text-[10px] text-center text-slate-400 font-mono">
                  AppImage / DEB · x86_64
                </p>
              </div>
            </div>
          </div>

          {/* Offline Resiliency Banner */}
          <div
            className={`p-4 rounded-sm border flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs ${
              theme === 'light'
                ? 'bg-indigo-50/70 border-indigo-200 text-slate-700'
                : 'bg-indigo-950/20 border-indigo-900/60 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <WifiOff size={16} />
              </div>
              <div>
                <span className="font-bold text-indigo-400">Airport & Warehouse Internet Down?</span>
                <p className="text-[11px] text-slate-400">
                  No problem. CargoMS Desktop caches your login credentials and plan lease locally for 30 days. Issue waybills offline and auto-sync when connection restores.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowDownloadModal(true)}
              className="underline text-indigo-400 hover:text-indigo-300 font-bold shrink-0 cursor-pointer"
            >
              System Requirements →
            </button>
          </div>
        </div>
      </section>

      {/* Active Features Section (Z-10) — Minimal & Clean, No Pricing */}
      <section id="features" className="relative z-10 py-16 lg:py-20 border-b border-slate-800/60">
        <div className="max-w-6xl mx-auto px-6 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-indigo-500">
                ACTIVE CAPABILITIES
              </span>
              <h2
                className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}
              >
                Features Built in CargoMS
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-mono text-slate-400">
              Operational modules built and ready in this release.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BUILT_FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.id}
                  className={`p-5 rounded-sm border flex flex-col justify-between space-y-4 transition-all ${
                    theme === 'light'
                      ? 'bg-white border-slate-200 shadow-xs'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-sm bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                        <Icon size={18} />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 px-2 py-0.5 rounded-xs bg-emerald-500/10 border border-emerald-500/20">
                        {feat.badge}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm tracking-tight">{feat.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Minimal Operator Access Card */}
          <div
            className={`p-5 rounded-sm border flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs ${
              theme === 'light'
                ? 'bg-slate-50 border-slate-200 text-slate-700'
                : 'bg-slate-900/80 border-slate-800 text-slate-300'
            }`}
          >
            <div>
              <span className="font-bold text-slate-200 block text-sm">Need Operator Access or Custom Features?</span>
              <span className="text-xs text-slate-400">Direct provisioning via WhatsApp (+91 8237742040) with developer Gopal Gawas.</span>
            </div>
            <a
              href="https://wa.me/918237742040?text=Hello%20Gopal%2C%20I%20am%20interested%20in%20CargoMS%20operator%20access."
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shrink-0"
            >
              <MessageSquare size={14} />
              <span>Request Access via WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* Clean Minimalist Footer (Z-10) */}
      <footer
        className={`relative z-10 py-12 px-6 max-w-6xl mx-auto font-mono text-xs ${
          theme === 'light' ? 'text-slate-500' : 'text-slate-400'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
              <Package size={12} />
            </div>
            <span className="font-bold tracking-wider uppercase">CargoHub OS</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#overview" className="hover:text-indigo-400">OPERATIONS</a>
            <a href="#templates" className="hover:text-indigo-400">DOCUMENTS</a>
            <a href="#features" className="hover:text-indigo-400">FEATURES</a>
            <button
              type="button"
              onClick={() => setShowDownloadModal(true)}
              className="hover:text-indigo-400 text-indigo-400 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Download size={12} />
              <span>DOWNLOAD APP</span>
            </button>
            <Link to="/product-tour" className="hover:text-indigo-400">HOW IT WORKS</Link>
            <Link to="/about" className="hover:text-indigo-400 font-bold text-indigo-400">ABOUT</Link>
            <Link to="/login" className="hover:text-indigo-400">LOGIN</Link>
            <a
              href="https://wa.me/918237742040?text=Hello%20Gopal%2C%20I%20am%20interested%20in%20CargoMS%20and%20would%20like%20to%20request%20operator%20access."
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-400"
            >
              REQUEST ACCESS
            </a>
          </div>

          <p className="text-[11px] text-slate-400">© {new Date().getFullYear()} CARGOHUB OS</p>
        </div>
      </footer>

      {/* Cross-Platform Download Modal */}
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />
    </div>
  );
}
