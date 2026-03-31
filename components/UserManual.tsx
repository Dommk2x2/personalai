
import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTheme } from '../contexts/ThemeContext';
import { 
    BookOpenIcon, DownloadIcon, BanknotesIcon, UserGroupIcon, 
    CalculatorIcon, ListChecksIcon, DocumentChartBarIcon, 
    ShieldCheckIcon, CogIcon, SparklesIcon, XIcon, ArrowPathIcon,
    FormIcon, UpiIcon, DocumentArrowUpIcon, PhotoIcon, ClockIcon,
    HistoryIcon, PassbookIcon, CalendarIcon, TargetIcon, 
    ListBulletIcon, CreditCardIcon, DevicePhoneMobileIcon, DatabaseIcon, 
    RecycleBinIcon, UserPlusIcon, SlidersHorizontalIcon, ChartIcon,
    ChevronRightIcon, ShareIcon
} from './Icons';
import { hexToRgba, lightenHexColor } from '../utils/colorUtils';

interface DiagramStep {
    label: string;
    description: string;
}

interface FeatureSpec {
    feature: string;
    detail: string;
}

interface FeatureDetail {
    title: string;
    category: 'Finance' | 'Analysis' | 'Attendance' | 'Planner' | 'Loans' | 'System';
    icon: React.FC<any>;
    color: string;
    overview: string;
    specs: FeatureSpec[];
    diagramSteps: DiagramStep[];
}

export const UserManual: React.FC<{ appTitle: string }> = ({ appTitle }) => {
    const { currentThemeColors, theme } = useTheme();
    const [selectedDetail, setSelectedDetail] = useState<FeatureDetail | null>(null);
    const [activeTab, setActiveTab] = useState<FeatureDetail['category']>('Finance');

    const detailedFeatures: FeatureDetail[] = [
        {
            title: "Transaction Engine",
            category: "Finance",
            icon: FormIcon,
            color: "text-blue-500",
            overview: "Advanced ledger system using double-entry principles for accurate balance tracking.",
            specs: [
                { feature: "Account Mapping", detail: "Links transactions to specific virtual bank accounts." },
                { feature: "Deduction Logic", detail: "Real-time balance subtraction for expense types." }
            ],
            diagramSteps: [
                { label: "Data Input", description: "User enters amount and category" },
                { label: "Validation", description: "System checks for valid numbers/dates" },
                { label: "Ledger Update", description: "Values pushed to LocalStorage array" },
                { label: "UI Sync", description: "All charts and balances refresh globally" }
            ]
        },
        {
            title: "UPI Simulation",
            category: "Finance",
            icon: UpiIcon,
            color: "text-cyan-500",
            overview: "Secure sandbox for practicing digital payments without affecting real bank balances.",
            specs: [
                { feature: "PIN Guard", detail: "Hardware-simulated 1234 PIN authentication." },
                { feature: "Keypad Security", detail: "UI-level numeric input to prevent keystroke logging." }
            ],
            diagramSteps: [
                { label: "Receiver Scan", description: "Mock Payee UPI ID validation" },
                { label: "Auth Layer", description: "In-app PIN verification screen" },
                { label: "Cash Debit", description: "Deduction from 'Cash in Hand' account" },
                { label: "Receipt", description: "Generation of digital success voucher" }
            ]
        },
        {
            title: "AI Bank Import",
            category: "Finance",
            icon: DocumentArrowUpIcon,
            color: "text-purple-500",
            overview: "Gemini 3.0 OCR engine for converting unstructured PDFs into structured ledger data.",
            specs: [
                { feature: "OCR Processing", detail: "High-precision text extraction using pdf.js." },
                { feature: "LLM Reasoning", detail: "AI categorizes 'Amazon' as 'Food/Shopping' automatically." }
            ],
            diagramSteps: [
                { label: "PDF Load", description: "Browser reads local file blob" },
                { label: "AI Scan", description: "Gemini 3.0 parses raw text strings" },
                { label: "Mapping", description: "Structured JSON mapped to app categories" },
                { label: "Review", description: "User audits AI results before final save" }
            ]
        },
        {
            title: "Attendance Grid",
            category: "Attendance",
            icon: CalendarIcon,
            color: "text-emerald-500",
            overview: "Comprehensive HR logging system with automated salary and leave calculation.",
            specs: [
                { feature: "Status Tracking", detail: "Supports Present, Absent, WFH, and SL/CL." },
                { feature: "Holiday Logic", detail: "Auto-detects Sundays as rest days based on config." }
            ],
            diagramSteps: [
                { label: "Selection", description: "User picks target date on calendar" },
                { label: "Status Toggle", description: "Attendance state marked in DB" },
                { label: "Payable Logic", description: "WFH/Present added to pay calculation" },
                { label: "Payslip", description: "Final PDF payslip generated at month end" }
            ]
        },
        {
            title: "EMI Amortization",
            category: "Loans",
            icon: CalculatorIcon,
            color: "text-indigo-500",
            overview: "Standard banking calculator for loan repayment schedules and milestone tracking.",
            specs: [
                { feature: "Interest Calculation", detail: "Reducing balance method for precise figures." },
                { feature: "Certificate", detail: "Celebratory background for fully paid loans." }
            ],
            diagramSteps: [
                { label: "Loan Specs", description: "Principal, Rate, and Tenure input" },
                { label: "Scheduling", description: "Full month-by-month table generated" },
                { label: "Payment Log", description: "Marking monthly EMIs as 'Paid'" },
                { label: "Completion", description: "Full Debt-Free animation and certificate" }
            ]
        },
        {
            title: "Document Vault",
            category: "Finance",
            icon: PhotoIcon,
            color: "text-orange-500",
            overview: "Private, encrypted storage for sensitive bills, ID cards, and screenshots.",
            specs: [
                { feature: "Base64 Blobs", detail: "Files stored directly in local browser DB." },
                { feature: "PIN Access", detail: "Secondary lock for files marked 'Private'." }
            ],
            diagramSteps: [
                { label: "File Pick", description: "User selects Image or PDF" },
                { label: "Optimization", description: "Canvas API resizes high-res images" },
                { label: "Privacy Tag", description: "File marked as 'Global' or 'Hidden'" },
                { label: "Storage", description: "Encrypted string saved to Vault ledger" }
            ]
        }
    ];

    const categories: FeatureDetail['category'][] = ["Finance", "Analysis", "Attendance", "Planner", "Loans", "System"];

    const handleDownloadManual = async () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;

        const drawSectionHeader = (d: jsPDF, title: string, y: number) => {
            d.setFillColor(currentThemeColors.bgAccent);
            d.rect(0, y - 8, pageWidth, 12, 'F');
            d.setFontSize(14); d.setFont(undefined, 'bold');
            d.setTextColor(currentThemeColors.brandPrimary);
            d.text(title.toUpperCase(), 14, y);
        };

        const drawWorkflowDiagram = (d: jsPDF, steps: DiagramStep[], y: number) => {
            const boxWidth = 35;
            const boxHeight = 15;
            const gap = 12;
            let currentX = 14;

            steps.forEach((step, i) => {
                // Box
                d.setDrawColor(currentThemeColors.brandPrimary);
                d.setLineWidth(0.5);
                d.roundedRect(currentX, y, boxWidth, boxHeight, 2, 2, 'S');
                
                // Number Circle
                d.setFillColor(currentThemeColors.brandPrimary);
                d.circle(currentX + 5, y + 5, 3, 'F');
                d.setTextColor(255);
                d.setFontSize(8);
                d.text(String(i+1), currentX + 4, y + 6);

                // Label
                d.setTextColor(30);
                d.setFontSize(8); d.setFont(undefined, 'bold');
                d.text(step.label, currentX + boxWidth/2, y + 10, { align: 'center' });

                // Arrow (except last)
                if (i < steps.length - 1) {
                    d.setDrawColor(200);
                    d.line(currentX + boxWidth, y + boxHeight/2, currentX + boxWidth + gap, y + boxHeight/2);
                    d.line(currentX + boxWidth + gap, y + boxHeight/2, currentX + boxWidth + gap - 2, y + boxHeight/2 - 2);
                    d.line(currentX + boxWidth + gap, y + boxHeight/2, currentX + boxWidth + gap - 2, y + boxHeight/2 + 2);
                }
                currentX += boxWidth + gap;
            });
            return y + boxHeight + 10;
        };

        // --- COVER PAGE ---
        doc.setFillColor(15, 23, 42); doc.rect(0, 0, pageWidth, pageHeight, 'F');
        doc.setFillColor(currentThemeColors.brandPrimary); doc.roundedRect(pageWidth/2-25, 60, 50, 50, 8, 8, 'F');
        doc.setTextColor(255); doc.setFontSize(30); doc.text("AI", pageWidth/2, 92, { align: 'center' });
        doc.setFontSize(40); doc.setFont(undefined, 'bold'); doc.text("SYSTEM MANUAL", pageWidth/2, 140, { align: 'center' });
        doc.setFontSize(14); doc.setTextColor(148, 163, 184); doc.text(`PRO EDITION | v2.5.0 | ${appTitle.toUpperCase()}`, pageWidth/2, 152, { align: 'center' });
        doc.saveGraphicsState();
        doc.setGState(new (doc as any).GState({ opacity: 0.1 }));
        for(let i=0; i<10; i++) doc.circle(Math.random()*pageWidth, Math.random()*pageHeight, 20+Math.random()*40, 'F');
        doc.restoreGraphicsState();

        // --- ARCHITECTURE PAGE ---
        doc.addPage();
        drawSectionHeader(doc, "System Architecture & Logic Flow", 20);
        doc.setFontSize(10); doc.setTextColor(80); doc.setFont(undefined, 'normal');
        doc.text("The application follows a 'Privacy-First' edge computing architecture.", 14, 30);
        
        // Draw Architecture Diagram
        let archY = 45;
        doc.setDrawColor(100);
        doc.roundedRect(15, archY, 40, 30, 2, 2, 'S'); doc.text("USER UI", 25, archY+15);
        doc.line(55, archY+15, 80, archY+15); // Arrow
        doc.roundedRect(80, archY, 50, 30, 2, 2, 'S'); doc.text("GEMINI AI ENGINE", 85, archY+15);
        doc.line(130, archY+15, 155, archY+15); // Arrow
        doc.roundedRect(155, archY, 40, 30, 2, 2, 'S'); doc.text("LOCAL DB", 165, archY+15);
        
        doc.setFontSize(8); doc.setTextColor(150);
        doc.text("1. Interaction Layer", 20, archY+35);
        doc.text("2. Intelligent Analysis", 85, archY+35);
        doc.text("3. Encrypted Storage", 160, archY+35);

        // --- FEATURE PAGES ---
        detailedFeatures.forEach((feat) => {
            doc.addPage();
            drawSectionHeader(doc, feat.title, 20);
            
            doc.setFontSize(11); doc.setTextColor(100);
            doc.text(doc.splitTextToSize(feat.overview, pageWidth - 28), 14, 35);

            doc.setFontSize(12); doc.setTextColor(currentThemeColors.brandPrimary);
            doc.text("Workflow Visualization:", 14, 55);
            drawWorkflowDiagram(doc, feat.diagramSteps, 62);

            autoTable(doc, {
                startY: 95, head: [['Component Spec', 'Technical Description']],
                body: feat.specs.map(s => [s.feature, s.detail]),
                theme: 'striped', headStyles: { fillColor: currentThemeColors.brandPrimary },
                styles: { fontSize: 9 }
            });
        });

        // Add Footer Numbers
        const total = doc.getNumberOfPages();
        for(let i=2; i<=total; i++) {
            doc.setPage(i);
            doc.setFontSize(8); doc.setTextColor(180);
            doc.text(`${appTitle} Confidential - Page ${i} of ${total}`, pageWidth/2, pageHeight - 10, { align: 'center' });
        }

        doc.save(`${appTitle}_Visual_Guide_v2.pdf`);
    };

    return (
        <div className="p-4 sm:p-8 rounded-3xl shadow-2xl bg-bg-secondary-themed border border-border-primary animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-brand-primary/10 rounded-2xl shadow-inner">
                        <BookOpenIcon className="w-10 h-10 text-brand-primary" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-text-base-themed uppercase tracking-tighter">Knowledge Base</h2>
                        <p className="text-sm text-text-muted-themed font-bold uppercase tracking-widest">Visual Workflows & Technical Specs</p>
                    </div>
                </div>
                <button 
                    onClick={handleDownloadManual}
                    className="flex items-center gap-3 px-10 py-5 bg-text-base-themed text-bg-primary-themed font-black uppercase tracking-widest rounded-2xl shadow-2xl transition-all active:scale-95 group"
                >
                    <DownloadIcon className="w-6 h-6 group-hover:translate-y-1 transition-transform" />
                    Export Detailed System PDF
                </button>
            </div>

            {/* In-App Category Navigation */}
            <div className="flex flex-wrap gap-2 mb-10 border-b border-border-secondary pb-6">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeTab === cat 
                            ? 'bg-brand-primary text-white shadow-xl scale-105' 
                            : 'bg-bg-accent-themed text-text-muted-themed hover:bg-border-secondary'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {detailedFeatures.filter(f => f.category === activeTab || activeTab === 'System').map((f, i) => (
                    <div 
                        key={i} 
                        onClick={() => setSelectedDetail(f)}
                        className="p-8 rounded-[2rem] bg-bg-primary-themed border border-border-secondary transition-all hover:shadow-2xl hover:-translate-y-2 group cursor-pointer relative overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity`}>
                            <f.icon className="w-24 h-24" />
                        </div>
                        <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center bg-bg-secondary-themed shadow-lg border border-border-primary`}>
                            <f.icon className={`w-8 h-8 ${f.color}`} />
                        </div>
                        <h3 className="text-xl font-black text-text-base-themed uppercase tracking-tight mb-3">{f.title}</h3>
                        <p className="text-sm text-text-muted-themed leading-relaxed font-bold mb-6 line-clamp-2">{f.overview}</p>
                        
                        <div className="flex justify-between items-center mt-auto">
                            <span className="text-[10px] font-black uppercase text-brand-primary tracking-widest flex items-center gap-1">
                                View Blueprint <ChevronRightIcon className="w-3 h-3" />
                            </span>
                            <div className="flex gap-1">
                                {f.diagramSteps.map((_, idx) => (
                                    <div key={idx} className="w-1.5 h-1.5 rounded-full bg-border-secondary group-hover:bg-brand-primary transition-colors" style={{ transitionDelay: `${idx * 100}ms` }}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Blueprint Modal (Workflows) */}
            {selectedDetail && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedDetail(null)}>
                    <div 
                        className="bg-bg-secondary-themed w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden animate-modal-enter border-8 border-white/10 flex flex-col md:flex-row"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Blueprint Sidebar */}
                        <div className="md:w-1/3 p-10 bg-bg-primary-themed border-r border-border-secondary">
                            <div className={`w-20 h-20 rounded-3xl mb-8 flex items-center justify-center bg-bg-secondary-themed shadow-2xl border border-border-primary`}>
                                <selectedDetail.icon className={`w-12 h-12 ${selectedDetail.color}`} />
                            </div>
                            <h3 className="text-3xl font-black text-text-base-themed uppercase tracking-tighter mb-4">{selectedDetail.title}</h3>
                            <p className="text-sm text-text-muted-themed font-bold leading-relaxed mb-8 italic">"{selectedDetail.overview}"</p>
                            
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase text-text-muted-themed tracking-[0.2em]">Specifications</h4>
                                {selectedDetail.specs.map((s, idx) => (
                                    <div key={idx} className="p-4 rounded-2xl bg-bg-secondary-themed border border-border-primary">
                                        <p className="text-[9px] font-black text-brand-primary uppercase mb-1">{s.feature}</p>
                                        <p className="text-xs text-text-muted-themed font-bold">{s.detail}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Workflow Canvas */}
                        <div className="md:w-2/3 p-10 flex flex-col">
                            <div className="flex justify-between items-center mb-12">
                                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-text-muted-themed">Operational Logic Flow</h4>
                                <button onClick={() => setSelectedDetail(null)} className="p-2 hover:bg-bg-accent-themed rounded-2xl transition-colors"><XIcon className="w-8 h-8 text-text-muted-themed" /></button>
                            </div>

                            <div className="flex-grow flex flex-col justify-center space-y-8 relative">
                                {selectedDetail.diagramSteps.map((step, idx) => (
                                    <div key={idx} className="flex items-center gap-8 relative z-10">
                                        <div className="w-14 h-14 rounded-full bg-brand-primary text-white flex items-center justify-center font-black text-xl shadow-xl ring-8 ring-brand-primary/10">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-grow p-6 rounded-[1.5rem] bg-bg-primary-themed border border-border-primary shadow-sm transition-all hover:scale-[1.02] hover:shadow-lg">
                                            <h5 className="font-black text-text-base-themed uppercase tracking-tight mb-1">{step.label}</h5>
                                            <p className="text-sm text-text-muted-themed font-bold">{step.description}</p>
                                        </div>
                                        {idx < selectedDetail.diagramSteps.length - 1 && (
                                            <div className="absolute left-7 top-14 w-0.5 h-10 bg-gradient-to-b from-brand-primary to-transparent opacity-20"></div>
                                        )}
                                    </div>
                                ))}
                                
                                {/* Background Watermark */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                                    <selectedDetail.icon className="w-[400px] h-[400px]" />
                                </div>
                            </div>

                            <div className="mt-12 flex justify-end">
                                <button 
                                    onClick={() => setSelectedDetail(null)}
                                    className="px-12 py-4 bg-text-base-themed text-bg-primary-themed font-black uppercase tracking-widest rounded-2xl shadow-2xl active:scale-95"
                                >
                                    Dismiss Blueprint
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Footer */}
            <div className="mt-16 p-12 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden text-center border-4 border-white/5">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-brand-primary/20 blur-[100px] rounded-full"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-secondary/20 blur-[100px] rounded-full"></div>
                
                <div className="relative z-10 max-w-3xl mx-auto">
                    <ShareIcon className="w-12 h-12 mx-auto mb-6 text-brand-secondary animate-bounce" />
                    <h3 className="text-3xl font-black uppercase mb-4 tracking-tighter italic">"Empowering Privacy through Local Intelligence"</h3>
                    <p className="text-slate-400 text-lg font-bold leading-relaxed mb-10">
                        This system is designed to run entirely within your local browser sandbox. No financial data ever touches a remote server. The manual reflects our commitement to architectural transparency.
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                        {['AES-256 Mock Sync', 'Gemini Extraction', 'Amortization Engine', 'Digital Sandbox'].map(tag => (
                            <span key={tag} className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em]">{tag}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
