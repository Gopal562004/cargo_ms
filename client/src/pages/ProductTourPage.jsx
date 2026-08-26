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
  FileText,
  Terminal,
  Printer,
  Users,
  Check,
  ShoppingBag,
  Bookmark,
  ArrowLeft,
  Eye,
  Sliders,
  ChevronRight,
  Database,
  Layers,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';

const TOUR_MODULES = [
  {
    id: 'mawb',
    name: '1. Air Waybills (MAWB & HAWB)',
    badge: 'AIR FREIGHT ENGINE',
    icon: Plane,
    tagline: 'Standardized air waybill document generation with automated rate calculation.',
    steps: [
      { step: '01', title: 'Input AWB Number & Port Pairs', desc: 'Enter 3-digit airline prefix (e.g. 098 Air India, 125 Lufthansa) with automated 7-digit modulus-7 check digit verification.' },
      { step: '02', title: 'Weight & Dimension Auto-Calc', desc: 'Calculates volume weight (1:6000 volumetric ratio) and sets the higher chargeable weight against gross weight instantly.' },
      { step: '03', title: 'Multi-Copy PDF & Thermal Print', desc: 'Instant print-ready multi-copy layout or standard A4 laser PDF with pre-aligned field coordinates.' },
    ],
    sampleData: {
      type: 'STANDARD AIR WAYBILL',
      code: '098-48201920',
      origin: 'DEL (Indira Gandhi Intl, India)',
      dest: 'LHR (London Heathrow, UK)',
      carrier: 'AI-161 / Air India Cargo',
      rate: 'USD 4.85 / kg',
      weight: '540.0 kg Gross / 580.0 kg Chargeable',
      status: 'ISSUED & READY FOR FLIGHT',
    },
  },
  {
    id: 'edi',
    name: '2. eAWB / Cargo-IMP EDI Gateway',
    badge: 'DIGITAL EDI FORMATS',
    icon: Zap,
    tagline: 'Digital freight messaging syntax generator for standard airline exchange formats.',
    steps: [
      { step: '01', title: 'One-Click EDI Packet Generation', desc: 'Translates completed AWB documents into standard Cargo-IMP FWB (Freight Waybill) or FHL (House List) syntax.' },
      { step: '02', title: 'Syntax & Error Validation', desc: 'Pre-flight parser checks for missing postal codes, airline routing errors, and mandatory customs fields.' },
      { step: '03', title: 'Digital Telegram Export', desc: 'Generates and copies standard FWB and FHL message strings ready for transmission.' },
    ],
    sampleData: {
      type: 'CARGO-IMP MESSAGE (FWB/16)',
      code: 'FWB/16/098-48201920DELLHR/T18K540.0MC4.85',
      origin: 'DEL → LHR',
      carrier: 'MESSAGE HEADER: FWB',
      rate: 'STANDARD EDI FORMAT',
      weight: '18 PIECES / 540 KG',
      status: 'MESSAGE GENERATED & READY',
    },
  },
  {
    id: 'invoicing',
    name: '3. GST Freight Invoicing & Settlement',
    badge: 'FINANCIAL SETTLEMENT',
    icon: Receipt,
    tagline: 'Automated multi-currency tax invoices, SAC 9965 split GST, and carrier reconciliation.',
    steps: [
      { step: '01', title: 'Automatic Charge Aggregation', desc: 'Pulls freight rate, fuel surcharge (FSC), screen fee, and DGD handling fees directly from the linked waybill.' },
      { step: '02', title: 'Place of Supply GST Calculation', desc: 'Automatically applies CGST/SGST (9%+9%) for intra-state or IGST (18%) for inter-state clients under SAC Code 9965.' },
      { step: '03', title: 'One-Click PDF Invoice with QR Wire', desc: 'Generates branded tax invoice PDF with bank transfer details, UPI payment QR, and ledger reconciliation.' },
    ],
    sampleData: {
      type: 'TAX INVOICE (SAC 996511)',
      code: 'INV-2026-0881',
      origin: 'Billed to: Global Pharma Logistics Ltd',
      dest: 'GSTIN: 07AAAAA0000A1Z5',
      carrier: 'Linked AWB: 098-48201920',
      rate: 'Subtotal: ₹1,40,500.00 + 18% GST',
      weight: 'Net Total: ₹1,65,790.00',
      status: 'PAID & SETTLED IN LEDGER',
    },
  },
  {
    id: 'dgd',
    name: '4. Dangerous Goods (DGD) Declarations',
    badge: 'HAZMAT DOCUMENTATION',
    icon: ShieldCheck,
    tagline: 'Automated UN hazard classification, emergency response codes, and declaration format.',
    steps: [
      { step: '01', title: 'UN Number & Proper Shipping Name Lookup', desc: 'Instant searchable database of 3,500+ hazardous cargo UN numbers, packing groups, and hazard classes.' },
      { step: '02', title: 'Passenger & Cargo-Only Limitation Checks', desc: 'Automatic quantity limit checks for Cargo Aircraft Only (CAO) vs. Passenger Aircraft.' },
      { step: '03', title: 'Red-Hatch Compliant Declaration PDF', desc: 'Generates standard Shippers Declaration for Dangerous Goods with mandatory red-striped borders.' },
    ],
    sampleData: {
      type: 'DANGEROUS GOODS DECLARATION',
      code: 'UN 1845 / CARBON DIOXIDE, SOLID (DRY ICE)',
      origin: 'Class 9 / Miscellaneous Dangerous Goods',
      dest: 'Packing Instruction: 954',
      carrier: 'Aircraft Limitation: PASSENGER AND CARGO',
      rate: 'Emergency Contact: +91-11-2849-0000',
      weight: '12 PKGS x 10.0 KG DRY ICE',
      status: 'VERIFIED & COMPLIANT',
    },
  },
  {
    id: 'ocean',
    name: '5. Ocean Multimodal Bill of Lading',
    badge: 'SEA FREIGHT',
    icon: Ship,
    tagline: 'FCL and LCL container logistics, seaport routing, and marine shipping orders.',
    steps: [
      { step: '01', title: 'Container & Seal Number Tracking', desc: 'Tracks 20ft/40ft/40HC container numbers, ISO size codes, and customs high-security bottle seal numbers.' },
      { step: '02', title: 'Port of Loading & Discharge Pairings', desc: 'Complete seaport master directory with automatic transshipment hub logging.' },
      { step: '03', title: 'Negotiable / Non-Negotiable B/L', desc: 'Print standard multimodal Bill of Lading with freight prepaid/collect instructions.' },
    ],
    sampleData: {
      type: 'OCEAN BILL OF LADING',
      code: 'BL-SEA-2026-4401',
      origin: 'Port of Loading: JNPT (Mumbai, India)',
      dest: 'Port of Discharge: Jebel Ali (Dubai, UAE)',
      carrier: 'Vessel: CMA CGM TITAN / Voy 082W',
      rate: 'Freight Prepaid in USD',
      weight: '1 x 40HC Container / 18,400.0 KG',
      status: 'ON BOARD VESSEL',
    },
  },
];

export default function ProductTourPage() {
  const { theme, toggleTheme } = useThemeStore();
  const [selectedModule, setSelectedModule] = useState(TOUR_MODULES[0]);

  return (
    <div
      className={`min-h-screen relative font-sans antialiased selection:bg-indigo-600 selection:text-white transition-colors duration-150 ${
        theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-[#060a12] text-slate-100'
      }`}
    >
      {/* Background Air Cargo Image with Contrast Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/images/cargo_freighter.jpg"
          alt="Cargo Runway Background"
          className="w-full h-full object-cover object-center filter blur-[3px] opacity-35"
        />
        <div
          className={`absolute inset-0 transition-colors ${
            theme === 'light'
              ? 'bg-gradient-to-b from-slate-100/95 via-slate-100/90 to-slate-200/98'
              : 'bg-gradient-to-b from-[#060a12]/95 via-[#060a12]/90 to-[#090d16]/98'
          }`}
        />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)`,
            backgroundSize: '36px 36px',
          }}
        />
      </div>

      {/* Top Header */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-xl transition-colors ${
          theme === 'light' ? 'bg-white/90 border-slate-200 shadow-xs' : 'bg-[#090d16]/90 border-slate-800'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/landing"
              className={`p-2 rounded border transition-colors flex items-center gap-1.5 text-xs font-mono ${
                theme === 'light'
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <ArrowLeft size={13} /> BACK TO LANDING
            </Link>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                <Package size={15} />
              </div>
              <span className="font-bold text-sm tracking-wider uppercase hidden sm:inline">
                CargoHub <span className="text-indigo-500">Tour</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded border transition-colors cursor-pointer ${
                theme === 'light'
                  ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                  : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
              }`}
              title={`Switch to ${theme === 'dark' ? 'Light Mode' : 'Dark Mode'}`}
            >
              {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-indigo-600" />}
            </button>

            <Link
              to="/register"
              className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors shadow-md shadow-indigo-600/20"
            >
              REQUEST ACCESS →
            </Link>
          </div>
        </div>
      </header>

      {/* Tour Hero */}
      <section className="relative z-10 py-12 lg:py-16 max-w-6xl mx-auto px-6 space-y-4">
        <div className="space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-500 font-bold">
            PRODUCT WALKTHROUGH & WORKFLOWS
          </span>
          <h1
            className={`text-3xl sm:text-5xl font-extrabold tracking-tight ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}
          >
            How CargoHub OS Works
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl font-normal leading-relaxed">
            Explore step-by-step how each freight operational module generates compliant air waybills, transmits eAWB messages, and settles invoices.
          </p>
        </div>
      </section>

      {/* Interactive Module Explorer Tabs */}
      <section className="relative z-10 pb-20 max-w-6xl mx-auto px-6 space-y-8">
        {/* Horizontal Module Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 font-mono text-xs">
          {TOUR_MODULES.map((mod) => {
            const isSelected = selectedModule.id === mod.id;
            const Icon = mod.icon;

            return (
              <button
                key={mod.id}
                onClick={() => setSelectedModule(mod)}
                className={`p-3 rounded border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 select-none ${
                  isSelected
                    ? theme === 'light'
                      ? 'bg-white border-indigo-600 text-indigo-600 shadow-sm'
                      : 'bg-slate-900/95 border-indigo-500 text-indigo-400 shadow-md'
                    : theme === 'light'
                    ? 'bg-white/70 border-slate-200 text-slate-600 hover:bg-white'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <Icon size={18} className={isSelected ? 'text-indigo-500' : 'text-slate-400'} />
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                </div>
                <span className="font-bold leading-tight text-[11px]">{mod.name.split('. ')[1]}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Module Detail Canvas */}
        <div
          className={`p-6 sm:p-8 rounded border backdrop-blur-xl transition-all space-y-8 ${
            theme === 'light'
              ? 'bg-white/95 border-slate-300 shadow-xl'
              : 'bg-[#0a0f1d]/95 border-slate-800 shadow-2xl'
          }`}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/40">
            <div className="space-y-1">
              <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {selectedModule.badge}
              </span>
              <h2 className="text-2xl font-bold tracking-tight mt-2">{selectedModule.name}</h2>
              <p className="text-xs sm:text-sm text-slate-400">{selectedModule.tagline}</p>
            </div>

            <Link
              to="/register"
              className="px-5 py-2.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold shrink-0 transition-colors shadow-md shadow-indigo-600/20 flex items-center gap-1.5 self-start sm:self-auto"
            >
              REQUEST ACCESS FOR THIS MODULE <ArrowRight size={14} />
            </Link>
          </div>

          {/* 3-Step Walkthrough Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
            {selectedModule.steps.map((s) => (
              <div
                key={s.step}
                className={`p-5 rounded border space-y-2 ${
                  theme === 'light'
                    ? 'bg-slate-50/80 border-slate-200'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <span className="text-xl font-bold text-indigo-400">{s.step}</span>
                <h3 className="text-xs font-bold text-slate-200">{s.title}</h3>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Live Mock Data Inspector */}
          <div className="space-y-3 font-mono">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold flex items-center gap-2">
                <Terminal size={14} className="text-indigo-400" />
                LIVE WORKSPACE TELEMETRY INSPECTOR
              </span>
              <span className="text-emerald-400 text-[10px]">● SIMULATION ACTIVE</span>
            </div>

            <div className="p-5 rounded bg-slate-950 border border-slate-800 text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-slate-400">
                <span>DOCUMENT TYPE: <strong className="text-slate-200">{selectedModule.sampleData.type}</strong></span>
                <span className="text-indigo-400 font-bold">{selectedModule.sampleData.code}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-[11px]">
                <div>
                  <span className="text-slate-500 block">ORIGIN / SHIPPER</span>
                  <strong className="text-slate-200">{selectedModule.sampleData.origin}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">DESTINATION / CONSIGNEE</span>
                  <strong className="text-slate-200">{selectedModule.sampleData.dest}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">CARRIER / SPEC</span>
                  <strong className="text-slate-200">{selectedModule.sampleData.carrier}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">RATE & WEIGHT</span>
                  <strong className="text-slate-200">{selectedModule.sampleData.rate}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">MANIFEST: <strong className="text-slate-200">{selectedModule.sampleData.weight}</strong></span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 size={13} /> {selectedModule.sampleData.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`relative z-10 py-10 px-6 max-w-6xl mx-auto font-mono text-xs ${
          theme === 'light' ? 'text-slate-500 border-t border-slate-200' : 'text-slate-400 border-t border-slate-800'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
              <Package size={12} />
            </div>
            <span className="font-bold uppercase tracking-wider">CargoHub OS</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/landing" className="hover:text-indigo-400">LANDING PAGE</Link>
            <Link to="/landing#calculator" className="hover:text-indigo-400">PRICING</Link>
            <Link to="/login" className="hover:text-indigo-400">OPERATOR SIGN IN</Link>
            <Link to="/register" className="hover:text-indigo-400">REQUEST ACCESS</Link>
          </div>

          <p className="text-[11px] text-slate-400">© {new Date().getFullYear()} CARGOHUB OS</p>
        </div>
      </footer>
    </div>
  );
}
