import { Athlete, WorkoutPlan, NutritionPlan, TrainerProfile, ExportConfig } from '../types';
import { generateWeeklyReport, calculateWorkoutAdherence, getPersonalRecords, calculateGoalProgress, calculateBodyComposition } from './helpers';

// Shared Icons
export const EXPORT_ICONS = {
    dumbbell: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 6.5h11"/><path d="M6.5 17.5h11"/><path d="M6 20v-2.5"/><path d="M9 20v-2.5"/><path d="M15 20v-2.5"/><path d="M18 20v-2.5"/><path d="M6 6.5V4"/><path d="M9 6.5V4"/><path d="M15 6.5V4"/><path d="M18 6.5V4"/></svg>`,
    coffee: `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>`,
    info: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
    insta: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>`,
    send: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
    mail: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>`,
    phone: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
    chevron: `<svg class="chevron-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
    check: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    food: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 2v4"/><path d="M21 2v4"/><path d="M21 13a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V2"/><path d="M11 2v4"/></svg>`,
    weight: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16.2 7.8 12 12"/><path d="M12 12l-4.2 4.2"/><path d="M8 8l8 8"/></svg>`,
    ruler: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0l12.6 12.6z"/><line x1="14.5" x2="16.5" y1="9.5" y2="11.5"/><line x1="6.5" x2="8.5" y1="17.5" y2="19.5"/><line x1="10.5" x2="12.5" y1="13.5" y2="15.5"/></svg>`,
    activity: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`
};

export const getExportStyles = (config: ExportConfig) => {
    // Determine Base Colors based on Theme
    let bg = '#f8fafc';
    let surface = '#ffffff';
    let textMain = '#0f172a';
    let textMuted = '#64748b';
    let border = '#e2e8f0';
    let fontFamily = "'Vazirmatn', sans-serif";

    // Theme Overrides
    if (config.theme === 'dark') {
        bg = '#0f172a';
        surface = '#1e293b';
        textMain = '#f8fafc';
        textMuted = '#94a3b8';
        border = '#334155';
    } else if (config.theme === 'minimal') {
        bg = '#ffffff';
        border = '#000000';
    } else if (config.theme === 'bold') {
        bg = '#ffffff';
        border = '#000000';
    }

    // Background Pattern Logic
    let bgPatternCSS = '';
    const encodedBorder = border.replace('#', '%23');

    if (config.backgroundPattern === 'dots') {
        bgPatternCSS = `background-image: radial-gradient(${border} 1px, transparent 1px); background-size: 20px 20px;`;
    } else if (config.backgroundPattern === 'grid') {
        bgPatternCSS = `background-image: linear-gradient(${border} 1px, transparent 1px), linear-gradient(90deg, ${border} 1px, transparent 1px); background-size: 20px 20px;`;
    } else if (config.backgroundPattern === 'waves') {
        bgPatternCSS = `background-image: url("data:image/svg+xml,%3Csvg width='40' height='12' viewBox='0 0 40 12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 6.172C9.763 6.172 9.763 0 19.526 0S29.289 6.172 29.289 6.172 29.289 12 39.052 12' stroke='${encodedBorder}' fill='none' fill-rule='evenodd'/%3E%3C/svg%3E"); background-size: 40px 12px;`;
    } else if (config.backgroundPattern === 'custom' && config.customBackgroundImage) {
        bgPatternCSS = `background-image: url('${config.customBackgroundImage}'); background-size: cover; background-position: center; background-repeat: no-repeat; background-attachment: fixed;`;
    }

    return `
    :root {
        --primary: ${config.primaryColor};
        --primary-light: ${config.theme === 'dark' ? `${config.primaryColor}33` : `${config.primaryColor}1a`};
        --primary-lighter: ${config.theme === 'dark' ? `${config.primaryColor}15` : `${config.primaryColor}08`};
        --surface: ${surface};
        --bg: ${bg};
        --border: ${border};
        --text-main: ${textMain};
        --text-muted: ${textMuted};
        --success: #10b981;
        --warning: #f59e0b;
        --danger: #ef4444;
        --info: #3b82f6;
    }
    
    * {
        box-sizing: border-box;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }
    
    body {
        font-family: ${fontFamily};
        background-color: var(--bg);
        color: var(--text-main);
        margin: 0;
        padding: 40px;
        line-height: 1.6;
        direction: rtl;
        ${bgPatternCSS}
    }

    .page-container {
        max-width: 210mm;
        margin: 0 auto;
        background: var(--surface);
        border-radius: ${config.theme === 'modern' ? '28px' : '0'};
        box-shadow: ${config.theme === 'modern' ? '0 20px 50px -15px rgba(0,0,0,0.15)' : 'none'};
        padding: 56px;
        overflow: hidden;
        position: relative;
        min-height: 297mm;
        display: flex;
        flex-direction: column;
        border: ${config.theme === 'bold' ? '4px solid var(--text-main)' : (config.theme === 'minimal' ? '2px solid var(--text-main)' : 'none')};
    }
    
    /* Header Section - HERO STYLE */
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: ${config.theme === 'dark' ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : (config.theme === 'modern' ? 'linear-gradient(135deg, var(--primary-light) 0%, rgba(255,255,255,0.5) 100%)' : 'transparent')};
        padding: 40px 36px;
        border-radius: 24px;
        margin-bottom: 32px;
        border: ${config.theme === 'minimal' || config.theme === 'bold' ? '2px solid var(--text-main)' : '1px solid var(--border)'};
        position: relative;
        overflow: hidden;
        box-shadow: ${config.theme === 'modern' ? '0 20px 40px -10px rgba(37, 99, 235, 0.12)' : (config.theme === 'dark' ? 'inset 0 1px 0 rgba(255,255,255,0.1)' : 'none')};
    }

    ${config.theme === 'modern' || config.theme === 'dark' ? `
    .header::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle at top right, var(--primary-light), transparent 50%);
        pointer-events: none;
    }
    ` : ''}

    .brand {
        display: flex;
        flex-direction: column;
        gap: 8px;
        z-index: 2;
        flex: 1;
    }
    
    .brand h1 {
        font-size: 36px;
        font-weight: 900;
        color: var(--primary);
        margin: 0;
        line-height: 1.1;
        letter-spacing: -0.5px;
    }

    .brand-slogan {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-muted);
        opacity: 0.9;
    }

    .brand-logo {
        width: 96px;
        height: 96px;
        border-radius: 20px;
        object-fit: cover;
        box-shadow: ${config.theme === 'modern' ? '0 12px 24px -6px rgba(0,0,0,0.15)' : 'none'};
        z-index: 2;
        background: white;
        border: 2px solid var(--border);
    }

    /* Info Strip - Modern Horizontal Layout */
    .info-strip {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: ${config.theme === 'dark' ? 'rgba(30, 41, 59, 0.7)' : 'linear-gradient(135deg, var(--primary-lighter) 0%, rgba(255,255,255,0.6) 100%)'};
        backdrop-filter: blur(12px);
        border: 1px solid var(--border);
        padding: 20px 28px;
        border-radius: 20px;
        margin-bottom: 40px;
        gap: 24px;
        box-shadow: ${config.theme === 'modern' ? '0 4px 12px -2px rgba(0,0,0,0.05)' : 'none'};
    }

    .info-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
    }

    .info-label {
        font-size: 10px;
        font-weight: 900;
        color: var(--primary);
        opacity: 0.85;
    }
    
    .info-value {
        font-size: 16px;
        font-weight: 900;
        color: var(--text-main);
        letter-spacing: -0.3px;
    }

    .info-divider {
        width: 1px;
        height: 48px;
        background: var(--border);
        opacity: 0.6;
    }

    /* Section Title */
    .section-title {
        font-size: 20px;
        font-weight: 900;
        color: var(--primary);
        margin-bottom: 24px;
        display: flex;
        align-items: center;
        gap: 10px;
        padding-bottom: 12px;
        border-bottom: 3px solid var(--primary);
        letter-spacing: -0.3px;
    }

    /* Days List */
    .days-list {
        display: flex;
        flex-direction: column;
        gap: 28px;
        flex-grow: 1;
    }

    .day-card {
        border: ${config.theme === 'minimal' ? 'none' : '1px solid var(--border)'};
        border-bottom: ${config.theme === 'minimal' ? '3px solid var(--text-main)' : '1px solid var(--border)'};
        border-radius: ${config.theme === 'modern' ? '20px' : '0'};
        background: var(--surface);
        break-inside: avoid;
        overflow: hidden;
        box-shadow: ${config.theme === 'modern' ? '0 4px 12px -2px rgba(0, 0, 0, 0.08)' : 'none'};
        transition: box-shadow 0.3s ease;
    }
    
    .day-card.rest {
        background: ${config.theme === 'dark' ? '#451a03' : '#fef3c7'};
        border: 2px dashed #f59e0b;
        box-shadow: 0 0 0 1px inset #f59e0b;
    }

    .day-header {
        background: ${config.theme === 'minimal' ? 'transparent' : 'linear-gradient(to left, var(--primary-lighter), transparent)'};
        padding: 18px 28px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: ${config.theme === 'modern' ? '2px solid var(--border)' : 'none'};
        cursor: pointer;
    }
    
    .day-title {
        font-weight: 900;
        font-size: 18px;
        display: flex;
        align-items: center;
        gap: 12px;
        color: var(--text-main);
        letter-spacing: -0.3px;
    }
    
    .day-subtitle {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-muted);
        margin-right: 8px;
        opacity: 0.85;
    }

    .badge-count {
        background: linear-gradient(135deg, var(--primary), var(--primary-light));
        color: white;
        font-size: 12px;
        padding: 6px 12px;
        border-radius: 10px;
        font-weight: 900;
        min-width: 32px;
        text-align: center;
        box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.2);
    }

    .rest-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px;
        color: ${config.theme === 'dark' ? '#fbbf24' : '#b45309'};
        gap: 12px;
        font-weight: 600;
        font-size: 16px;
    }
    
    .chevron-icon {
        transition: transform 0.3s ease;
        transform: rotate(180deg);
        flex-shrink: 0;
    }

    .day-body {
        transition: all 0.3s ease;
    }

    /* Exercises Table Look */
    .exercise-row {
        display: grid;
        grid-template-columns: 2.5fr 1fr 1fr 1fr;
        padding: 18px 28px;
        align-items: center;
        border-bottom: 1px solid var(--border);
        gap: 14px;
        transition: background-color 0.2s ease;
    }
    
    .exercise-row:hover {
        background: var(--primary-lighter);
    }
    
    .exercise-row:last-child {
        border-bottom: none;
    }
    
    .ex-main {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    
    .ex-name {
        font-weight: 900;
        font-size: 15px;
        color: var(--text-main);
        letter-spacing: -0.2px;
    }
    
    .ex-type-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        width: fit-content;
        font-size: 11px;
        font-weight: 700;
        padding: 4px 8px;
        border-radius: 6px;
        background: var(--primary-light);
        color: var(--primary);
        text-transform: uppercase;
        letter-spacing: 0.3px;
    }
    
    .stat-pill {
        display: flex;
        flex-direction: column;
        align-items: center;
        background: linear-gradient(135deg, var(--primary-lighter) 0%, var(--bg) 100%);
        padding: 10px 8px;
        border-radius: 14px;
        border: 1px solid var(--border);
        box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.05);
    }
    
    ${config.theme === 'bold' ? `
    .stat-pill {
        background: transparent;
        border: 2px solid var(--text-main);
        border-radius: 4px;
        padding: 8px 6px;
    }
    ` : ''}
    
    .stat-label {
        font-size: 9px;
        color: var(--text-muted);
        font-weight: 800;
        margin-bottom: 3px;
        text-transform: uppercase;
        letter-spacing: 0.3px;
    }
    
    .stat-value {
        font-weight: 900;
        font-size: 17px;
        color: var(--primary);
        letter-spacing: -0.2px;
    }
    
    .rep-range-bar {
        width: 100%;
        height: 4px;
        background: var(--border);
        border-radius: 2px;
        margin-top: 4px;
        overflow: hidden;
    }
    
    .rep-range-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--primary), var(--primary-light));
        border-radius: 2px;
    }

    .ex-note {
        grid-column: 1 / -1;
        margin-top: 12px;
        background: ${config.theme === 'dark' ? '#3f3f46' : '#fffbeb'};
        color: ${config.theme === 'dark' ? '#fcd34d' : '#92400e'};
        padding: 12px 16px;
        border-radius: 14px;
        border-right: 3px solid #f59e0b;
        font-size: 13px;
        display: flex;
        align-items: flex-start;
        gap: 10px;
        line-height: 1.6;
        font-weight: 500;
    }

    /* Diet Specific Styles */
    .meal-row {
        padding: 24px 28px;
        border-bottom: 1px solid var(--border);
        transition: background-color 0.2s ease;
    }
    
    .meal-row:hover {
        background: var(--primary-lighter);
    }
    
    .meal-row:last-child { border-bottom: none; }
    
    .meal-header {
        font-weight: 900;
        font-size: 16px;
        color: var(--primary);
        margin-bottom: 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        letter-spacing: -0.2px;
    }
    
    .meal-calorie-badge {
        background: linear-gradient(135deg, var(--primary), var(--primary-light));
        color: white;
        padding: 6px 12px;
        border-radius: 10px;
        font-size: 12px;
        font-weight: 900;
        min-width: 48px;
        text-align: center;
        box-shadow: 0 2px 8px -2px rgba(0, 0, 0, 0.2);
    }
    
    .food-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px dashed var(--border);
    }
    .food-item:last-child { border-bottom: none; }
    
    .food-name { 
        font-weight: 800; 
        font-size: 14px; 
        color: var(--text-main);
        letter-spacing: -0.1px;
    }
    
    .food-meta { 
        font-size: 12px; 
        color: var(--text-muted); 
        margin-right: 4px;
        font-weight: 500;
    }
    
    .food-macros { 
        display: flex; 
        gap: 10px; 
        font-size: 11px; 
        font-weight: 800; 
    }
    
    .macro-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        padding: 6px 10px;
        border-radius: 8px;
    }
    
    .macro-carbs {
        background: ${config.theme === 'dark' ? '#451a03' : '#fed7aa'};
        color: ${config.theme === 'dark' ? '#fb923c' : '#92400e'};
    }
    
    .macro-protein {
        background: ${config.theme === 'dark' ? '#1e3a5f' : '#dbeafe'};
        color: ${config.theme === 'dark' ? '#7dd3fc' : '#0c4a6e'};
    }
    
    .macro-fat {
        background: ${config.theme === 'dark' ? '#450a0a' : '#fecaca'};
        color: ${config.theme === 'dark' ? '#fca5a5' : '#7f1d1d'};
    }
    
    .macro-label {
        font-size: 10px;
        letter-spacing: 0.2px;
    }
    
    .macro-value {
        font-size: 12px;
        font-weight: 900;
    }

    /* Footer & Photos */
    .footer {
        margin-top: auto;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        align-items: center;
        gap: 24px;
        padding: 28px 36px;
        background: ${config.theme === 'dark' ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.5) 100%)' : 'linear-gradient(135deg, var(--primary-lighter) 0%, rgba(255,255,255,0.5) 100%)'};
        border-radius: 20px;
        border: 1px solid var(--border);
        box-shadow: ${config.theme === 'modern' ? '0 4px 12px -2px rgba(0,0,0,0.08)' : 'none'};
    }
    
    .footer-section {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .footer-center {
        align-items: center;
        text-align: center;
        border-left: 1px dashed var(--border);
        border-right: 1px dashed var(--border);
    }

    .footer-left {
        align-items: flex-end;
        text-align: left;
    }

    .contact-row {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 12px;
        color: var(--text-muted);
        font-weight: 600;
        line-height: 1.4;
    }

    .contact-row svg {
        width: 16px;
        height: 16px;
        color: var(--primary);
        flex-shrink: 0;
    }

    .signature-box {
        text-align: center;
        width: 160px;
    }
    
    .signature-img {
        max-width: 100%;
        max-height: 70px;
        object-fit: contain;
        filter: ${config.theme === 'dark' ? 'invert(1)' : 'none'};
        opacity: 0.9;
        margin-bottom: 4px;
    }
    
    .signature-line {
        border-top: 2px solid var(--text-main);
        margin-top: 6px;
        padding-top: 6px;
        font-size: 11px;
        font-weight: 900;
        color: var(--text-main);
    }

    .footer-note {
        font-size: 11px;
        color: var(--text-muted);
        line-height: 1.8;
        font-weight: 500;
    }
    
    .trainer-card {
        margin-bottom: 32px;
        padding: 24px 28px;
        background: linear-gradient(135deg, var(--primary-lighter) 0%, ${config.theme === 'dark' ? 'rgba(30,41,59,0.3)' : 'rgba(255,255,255,0.3)'} 100%);
        border: 2px solid var(--primary);
        border-radius: 16px;
        display: flex;
        align-items: center;
        gap: 20px;
        page-break-inside: avoid;
    }
    
    .trainer-card-logo {
        width: 80px;
        height: 80px;
        border-radius: 12px;
        object-fit: cover;
        background: ${config.theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'white'};
        border: 2px solid var(--border);
        flex-shrink: 0;
    }
    
    .trainer-card-content {
        flex: 1;
    }
    
    .trainer-card-name {
        font-size: 16px;
        font-weight: 900;
        color: var(--primary);
        margin: 0 0 8px 0;
        letter-spacing: -0.2px;
    }
    
    .trainer-card-contacts {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    
    .trainer-contact {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 11px;
        color: var(--text-muted);
        font-weight: 600;
    }
    
    .trainer-contact svg {
        width: 14px;
        height: 14px;
        color: var(--primary);
        flex-shrink: 0;
    }
    
    .quote-box {
        margin-top: 32px;
        padding: 24px;
        border-right: 5px solid var(--primary);
        background: linear-gradient(135deg, var(--primary-lighter) 0%, transparent 100%);
        font-style: italic;
        color: var(--text-main);
        font-size: 15px;
        font-weight: 600;
        border-radius: 12px;
        line-height: 1.8;
        text-align: center;
    }
    
    .photo-gallery {
        margin-top: 40px; 
        page-break-inside: avoid;
    }
    
    .photo-grid {
        display: grid; 
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); 
        gap: 20px;
    }
    
    .photo-card {
        background: linear-gradient(135deg, var(--primary-lighter) 0%, var(--surface) 100%); 
        padding: 14px; 
        border-radius: 16px; 
        border: 1px solid var(--border); 
        box-shadow: 0 4px 12px -2px rgba(0,0,0,0.08);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .photo-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px -2px rgba(0,0,0,0.12);
    }
    
    .photo-date {
        text-align: center; 
        font-weight: 900; 
        margin-bottom: 12px; 
        font-size: 13px; 
        color: var(--text-main); 
        background: var(--bg); 
        padding: 8px 12px; 
        border-radius: 10px;
        letter-spacing: -0.2px;
    }

    /* === PRs & Goals === */
    .pr-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .pr-table thead tr { background: var(--bg); border-bottom: 1px solid var(--border); }
    .pr-table th { padding: 12px; font-weight: 800; color: var(--text-muted); text-align: right; }
    .pr-table td { padding: 12px; border-bottom: 1px dashed var(--border); }
    .pr-badge { display: inline-flex; align-items: center; gap: 4px; background: #fbbf24; color: #78350f; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; }

    .goal-card { display: flex; align-items: center; gap: 16px; padding: 16px 20px; border: 1px solid var(--border); border-radius: 12px; margin-bottom: 12px; background: var(--surface); }
    .goal-info { flex: 1; }
    .goal-title { font-weight: 900; font-size: 14px; color: var(--text-main); }
    .goal-meta { font-size: 11px; color: var(--text-muted); margin-top: 4px; }
    .goal-progress-bar { width: 100%; height: 8px; background: var(--border); border-radius: 4px; overflow: hidden; margin-top: 8px; }
    .goal-progress-fill { height: 100%; border-radius: 4px; }
    .goal-progress-fill.complete { background: #10b981; }
    .goal-progress-fill.in-progress { background: linear-gradient(90deg, var(--primary), var(--primary-light)); }

    /* === Adherence === */
    .adherence-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; margin-bottom: 20px; }
    .adherence-stat { text-align: center; padding: 16px; border-radius: 12px; background: var(--bg); border: 1px solid var(--border); }
    .adherence-stat .value { font-size: 28px; font-weight: 900; color: var(--primary); }
    .adherence-stat .label { font-size: 11px; color: var(--text-muted); font-weight: 700; margin-top: 4px; }
    .weekly-strip { display: flex; gap: 4px; justify-content: center; margin-top: 12px; }
    .weekly-dot { width: 12px; height: 12px; border-radius: 3px; }
    .weekly-dot.completed { background: #10b981; }
    .weekly-dot.missed { background: #ef4444; opacity: 0.4; }

    /* === Full Measurements === */
    .measurement-full-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .measurement-full-table th { padding: 8px 6px; font-weight: 800; color: var(--text-muted); background: var(--bg); border-bottom: 1px solid var(--border); white-space: nowrap; font-size: 10px; }
    .measurement-full-table td { padding: 8px 6px; border-bottom: 1px dashed var(--border); text-align: center; white-space: nowrap; }
    .mood-indicator { display: inline-flex; gap: 2px; }
    .mood-dot { width: 8px; height: 8px; border-radius: 50%; }
    .mood-dot.filled { background: var(--primary); }
    .mood-dot.empty { background: var(--border); }
    .composition-bar { display: flex; height: 20px; border-radius: 6px; overflow: hidden; margin-top: 8px; }
    .composition-lean { background: #10b981; }
    .composition-fat { background: #f59e0b; }

    /* === Charts === */
    .chart-section { margin-top: 32px; margin-bottom: 24px; page-break-inside: avoid; }
    .chart-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 20px; overflow: hidden; }

    /* === Diet Targets === */
    .meal-time-badge { font-size: 11px; color: var(--text-muted); font-weight: 600; background: var(--bg); padding: 3px 8px; border-radius: 6px; }
    .target-bar-container { margin-top: 16px; padding: 16px; background: var(--bg); border-radius: 12px; border: 1px solid var(--border); }
    .target-bar-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .target-bar-label { width: 60px; font-size: 11px; font-weight: 800; color: var(--text-muted); }
    .target-bar-track { flex: 1; height: 10px; background: var(--border); border-radius: 5px; overflow: hidden; }
    .target-bar-fill { height: 100%; border-radius: 5px; }
    .target-bar-value { font-size: 12px; font-weight: 800; color: var(--text-main); min-width: 80px; text-align: left; }
    .diet-summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }

    /* === Exercise Metadata === */
    .ex-muscle-tag { font-size: 10px; font-weight: 700; color: var(--text-muted); background: var(--bg); padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 4px; }
    .ex-description { grid-column: 1 / -1; font-size: 12px; color: var(--text-muted); line-height: 1.6; padding: 8px 12px; background: var(--bg); border-radius: 8px; margin-top: 8px; }
    .ex-video-link { font-size: 11px; color: var(--primary); text-decoration: none; font-weight: 700; }

    /* === Trainer Extended === */
    .trainer-bio { font-size: 13px; color: var(--text-main); line-height: 1.7; margin-top: 8px; }
    .trainer-certs { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .trainer-cert-badge { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 6px; background: var(--primary-light); color: var(--primary); }
    .trainer-website { font-size: 12px; color: var(--primary); text-decoration: none; font-weight: 600; }

    /* === Weekly Report === */
    .weekly-report-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin: 20px 0; }
    .weekly-card { text-align: center; padding: 20px; border-radius: 16px; background: var(--bg); border: 1px solid var(--border); }
    .weekly-card .big-number { font-size: 32px; font-weight: 900; color: var(--primary); }
    .weekly-card .card-label { font-size: 11px; color: var(--text-muted); font-weight: 700; margin-top: 4px; }
    .weekly-card .card-trend { font-size: 12px; font-weight: 700; margin-top: 4px; }
    .trend-up { color: #ef4444; }
    .trend-down { color: #10b981; }

    /* === Mobile Responsive === */
    @media (max-width: 640px) {
        body { padding: 16px; }
        .page-container { padding: 24px 16px; min-height: auto; }

        .header { padding: 24px 16px; }
        .brand h1 { font-size: 22px; }
        .brand-logo { width: 56px; height: 56px; }

        .info-strip { flex-wrap: wrap; padding: 16px; gap: 12px; }
        .info-divider { display: none; }
        .info-item { min-width: 45%; }
        .info-value { font-size: 14px; }

        .section-title { font-size: 16px; margin-bottom: 16px; }

        .exercise-row { grid-template-columns: 1fr 1fr; padding: 12px 16px; gap: 8px; }
        .ex-main { grid-column: 1 / -1; }
        .ex-name { font-size: 13px; }
        .stat-pill { padding: 6px 10px; }
        .stat-label { font-size: 8px; }
        .stat-value { font-size: 14px; }

        .day-header { padding: 14px 16px; }
        .day-title { font-size: 15px; }
        .day-body { padding: 0; }

        .meal-row { padding: 14px 16px; }
        .meal-header { font-size: 14px; }
        .food-item { flex-direction: column; align-items: flex-start; gap: 6px; }
        .food-name { font-size: 13px; }
        .food-macros { flex-wrap: wrap; gap: 6px; font-size: 10px; }

        .rest-content { padding: 24px; }
        .rest-content > div:first-of-type { font-size: 16px; }

        .footer { grid-template-columns: 1fr; padding: 20px 16px; gap: 16px; }
        .footer-center { border: none; border-top: 1px dashed var(--border); padding-top: 12px; text-align: center; }
        .footer-left { align-items: center; text-align: center; }

        .trainer-card { padding: 16px; flex-direction: column; text-align: center; gap: 12px; }
        .trainer-card-logo { width: 64px; height: 64px; }
        .trainer-card-contacts { align-items: center; }

        .quote-box { padding: 16px; font-size: 14px; }

        .diet-summary-grid { grid-template-columns: 1fr 1fr; gap: 8px; }

        .target-bar-row { gap: 8px; }
        .target-bar-label { width: 45px; font-size: 10px; }
        .target-bar-value { min-width: 50px; font-size: 10px; }
        .target-bar-container { padding: 12px; }

        .adherence-grid { grid-template-columns: 1fr 1fr; gap: 8px; }
        .adherence-stat { padding: 12px; }
        .adherence-stat .value { font-size: 22px; }

        .weekly-report-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
        .weekly-card { padding: 14px; }
        .weekly-card .big-number { font-size: 24px; }

        .goal-card { padding: 12px 14px; gap: 12px; }
        .goal-title { font-size: 13px; }
        .goal-meta { font-size: 10px; }

        .pr-table { font-size: 11px; }
        .pr-table th, .pr-table td { padding: 8px 6px; }

        .measurement-full-table { font-size: 10px; }
        .measurement-full-table th, .measurement-full-table td { padding: 6px 4px; }

        .chart-card { padding: 12px; }
        .chart-card svg { max-height: 200px; }

        .brand-slogan { font-size: 11px; }

        .ex-note { padding: 10px 12px; font-size: 12px; }
        .ex-description { font-size: 11px; padding: 6px 10px; }

        .signature-box { width: 120px; }
        .signature-img { max-height: 50px; }

        .contact-row { font-size: 11px; gap: 6px; }
    }

    @media print {
        body { 
            padding: 10mm; 
            background: white;
        }
        .page-container { 
            box-shadow: none; 
            padding: 0; 
            width: 100%; 
            max-width: none; 
            min-height: 0; 
            margin: 0; 
            border: none;
            border-radius: 0;
        }
        .chevron-icon { display: none; }
        .day-body { display: block !important; }
        .day-header { pointer-events: none; }
        .exercise-row:hover,
        .meal-row:hover {
            background: transparent !important;
        }
        .photo-card {
            page-break-inside: avoid;
        }
    }
`;
};

// ... HTML Generator Helpers ...

const getRandomQuote = () => {
    const quotes = [
        "درد امروز، قدرت فرداست.",
        "هیچ تلاشی بی‌نتیجه نمی‌ماند.",
        "بدن شما تنها جایی است که باید در آن زندگی کنید.",
        "موفقیت تکرار لجوجانه کارهای ساده است.",
        "هر روز یک فرصت جدید برای بهتر شدن است."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
};

const generatePhotosHtml = (athlete: Athlete, config: ExportConfig) => {
    // Only generate if explicitly enabled for progress reports
    // For plans/diets, this function should generally not be called or config.includePhotos should be false
    if (!athlete.measurements) return '';

    const sorted = [...athlete.measurements].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const withPhotos = sorted.filter(m => m.photos && (m.photos.front || m.photos.side || m.photos.back));

    let selectedMeasurements: typeof athlete.measurements = [];
    const mode = config.photoSelectionMode || 'first_last';

    if (mode === 'first_last' && withPhotos.length >= 2) {
        selectedMeasurements = [withPhotos[0], withPhotos[withPhotos.length - 1]];
    } else if (mode === 'latest' && withPhotos.length > 0) {
        selectedMeasurements = [withPhotos[withPhotos.length - 1]];
    } else if (withPhotos.length > 0) {
        selectedMeasurements = withPhotos;
    }

    if (selectedMeasurements.length === 0) return '';

    return `
    <div class="photo-gallery">
        <div class="section-title">
            ${EXPORT_ICONS.info} روند پیشرفت فیزیکی
        </div>
        <div class="photo-grid">
            ${selectedMeasurements.map(m => `
                <div class="photo-card">
                    <div class="photo-date">${new Date(m.date).toLocaleDateString('fa-IR')} <span style="font-weight:400; opacity:0.7; font-size:11px">| وزن: ${m.weight}kg</span></div>
                    <div style="display: flex; gap: 4px; justify-content: center;">
                        ${config.photoAngles?.includes('front') && m.photos?.front ? `<div style="flex:1; aspect-ratio: 3/4;"><img src="${m.photos.front}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;" /></div>` : ''}
                        ${config.photoAngles?.includes('side') && m.photos?.side ? `<div style="flex:1; aspect-ratio: 3/4;"><img src="${m.photos.side}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;" /></div>` : ''}
                        ${config.photoAngles?.includes('back') && m.photos?.back ? `<div style="flex:1; aspect-ratio: 3/4;"><img src="${m.photos.back}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;" /></div>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
    `;
};

// ... Plan HTML Generator ...
export const getPlanHtml = (plan: WorkoutPlan, athlete: Athlete, trainer: TrainerProfile | null, config: ExportConfig) => {
    const randomQuote = getRandomQuote();
    // No photos for Plans
    const photosHtml = '';


    return `
        <div class="page-container">
            <!-- Hero Header (no trainer info) -->
            <div class="header">
                <div class="brand">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:4px;">
                        <h1 style="font-size:24px;">${plan.name || 'برنامه تمرینی'}</h1>
                    </div>
                    <div style="font-size:13px; color:var(--text-muted);">ورزشکار: ${athlete.fullName}</div>
                </div>
            </div>

            <!-- Integrated Info Strip -->
            <div class="info-strip">
                <div class="info-item">
                    <span class="info-label">ورزشکار</span>
                    <span class="info-value">${athlete.fullName}</span>
                </div>
                <div class="info-divider"></div>
                <div class="info-item">
                    <span class="info-label">عنوان برنامه</span>
                    <span class="info-value">${plan.name}</span>
                </div>
                <div class="info-divider"></div>
                <div class="info-item">
                    <span class="info-label">تاریخ تنظیم</span>
                    <span class="info-value">${new Date().toLocaleDateString('fa-IR')}</span>
                </div>
            </div>

            <div class="days-list">
                ${plan.days
            .filter(d => d.isRestDay || d.exercises.length > 0)
            .map(day => `
                    <div class="day-card ${day.isRestDay ? 'rest' : ''}">
                        ${day.isRestDay ? `
                            <div class="rest-content">
                                ${EXPORT_ICONS.coffee}
                                <div style="font-size: 18px; font-weight: 900;">${day.dayName}</div>
                                <div style="font-weight: 500;">روز استراحت و ریکاوری</div>
                            </div>
                        ` : `
                            <div class="day-header" onclick="toggleDay(this)">
                                <div class="day-title">
                                    ${EXPORT_ICONS.dumbbell}
                                    ${day.dayName}
                                </div>
                                <div style="display:flex; align-items:center; gap:8px;">
                                    <div class="badge-count">${day.exercises.length} حرکت</div>
                                    <span class="day-subtitle">${day.exercises.reduce((acc, ex) => acc + (parseInt(String(ex.sets).split('-')[0]) || 0), 0)} ست</span>
                                    ${EXPORT_ICONS.chevron}
                                </div>
                            </div>
                            <div class="day-body">
                                ${day.exercises.length > 0 ? day.exercises.map((ex, idx) => `
                                    <div class="exercise-row">
                                        <div class="ex-main">
                                            <div class="ex-name"><span style="color:var(--primary); margin-left:8px; opacity:0.6;">${idx + 1}.</span>${ex.exerciseName}</div>
                                            ${config.showExerciseMetadata !== false ? `
                                            ${(ex as any).type ? `<span class="ex-type-badge">${(ex as any).type}</span>` : ''}
                                            ${(ex as any).muscleGroup ? `<span class="ex-muscle-tag">${(ex as any).muscleGroup}</span>` : ''}
                                            ` : ''}
                                        </div>
                                        
                                        <div class="stat-pill">
                                            <span class="stat-label">ست</span>
                                            <span class="stat-value">${ex.sets}</span>
                                        </div>
                                        <div class="stat-pill">
                                            <span class="stat-label">تکرار</span>
                                            <span class="stat-value">${ex.reps}</span>
                                        </div>
                                        <div class="stat-pill">
                                            <span class="stat-label">استراحت</span>
                                            <span class="stat-value" dir="ltr">${ex.rest || '-'}</span>
                                        </div>

                                        ${ex.notes ? `
                                            <div class="ex-note">
                                                ${EXPORT_ICONS.info}
                                                ${ex.notes}
                                            </div>
                                        ` : ''}
                                        ${config.showExerciseMetadata !== false && (ex as any).description ? `
                                            <div class="ex-description">${(ex as any).description}</div>
                                        ` : ''}
                                        ${config.showExerciseMetadata !== false && (ex as any).videoUrl ? `
                                            <a href="${(ex as any).videoUrl}" class="ex-video-link" target="_blank" rel="noopener">مشاهده ویدیو</a>
                                        ` : ''}
                                    </div>
                                `).join('') : '<div style="padding:24px;text-align:center;opacity:0.5">بدون تمرین</div>'}
                            </div>
                        `}
                    </div>
                `).join('')}
            </div>

            <!-- Trainer info removed by request -->

            ${plan.notes ? `<div style="margin-bottom:24px; padding:20px; background:linear-gradient(135deg, var(--primary-lighter) 0%, rgba(255,255,255,0.3) 100%); border-right:4px solid var(--primary); border-radius:12px; font-size:13px; color:var(--text-main); line-height:1.7;"><strong style="color:var(--primary); font-weight:900; font-size:14px;">📝 توضیحات برنامه:</strong><br/><span style="margin-top:8px; display:block;">${plan.notes}</span></div>` : ''}

            ${config.showQuote ? `<div class="quote-box">«${randomQuote}»</div>` : ''}

            <div class="footer">
                <div class="footer-section">
                    <div class="footer-note">
                        <span style="opacity:0.7;">برای نتایج بهتر، برنامه را دقیق اجرا کنید.</span>
                        <div style="margin-top:4px; font-size:10px; opacity:0.5;">طراحی شده با اپلیکیشن متال پلنز</div>
                    </div>
                </div>
            </div>
        </div>
    `;
};


// ... Diet HTML Generator ...
export const getDietHtml = (plan: NutritionPlan, athlete: Athlete, trainer: TrainerProfile | null, config: ExportConfig) => {
    return `
        <div class="page-container">
            <!-- Hero Header -->
            <div class="header">
                <div class="brand">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:4px;">
                        ${trainer?.logoUrl ? `<img src="${trainer.logoUrl}" style="width:32px; height:32px; border-radius:8px; object-fit:cover;" />` : ''}
                        <h1 style="font-size:24px;">${trainer?.name || 'رژیم غذایی'}</h1>
                    </div>
                </div>
                ${trainer?.logoUrl
            ? `<img src="${trainer.logoUrl}" class="brand-logo" alt="Logo" />`
            : ''
        }
            </div>

            <!-- Integrated Info Strip -->
            <div class="info-strip">
                <div class="info-item">
                    <span class="info-label">ورزشکار</span>
                    <span class="info-value">${athlete.fullName}</span>
                </div>
                <div class="info-divider"></div>
                <div class="info-item">
                    <span class="info-label">عنوان رژیم</span>
                    <span class="info-value">${plan.name}</span>
                </div>
                <div class="info-divider"></div>
                <div class="info-item">
                    <span class="info-label">تاریخ صدور</span>
                    <span class="info-value">${new Date().toLocaleDateString('fa-IR')}</span>
                </div>
            </div>

            <div class="days-list">
                ${plan.days.map(day => {
            let cals = 0, prot = 0;
            day.meals.forEach(m => m.foods.forEach(f => { cals += f.calories; prot += f.protein; }));
            return `
                    <div class="day-card">
                        <div class="day-header" onclick="toggleDay(this)">
                            <div class="day-title">
                                ${EXPORT_ICONS.food}
                                ${day.dayName}
                            </div>
                            <div style="display:flex; align-items:center; gap:8px;">
                                <div class="badge-count">${Math.round(cals)} کالری • ${Math.round(prot)}g پروتئین</div>
                                ${EXPORT_ICONS.chevron}
                            </div>
                        </div>
                        <div class="day-body">
                            ${day.meals.map(meal => `
                                <div class="meal-row">
                                    <div class="meal-header">
                                        ${meal.name}
                                        ${config.showMealTime !== false && meal.time ? `<span class="meal-time-badge">${meal.time}</span>` : ''}
                                    </div>
                                    ${meal.foods.length === 0 ? '<div style="opacity:0.5; font-size:12px">خالی</div>' :
                    meal.foods.map(food => `
                                        <div class="food-item">
                                            <div style="flex:1">
                                                <div class="food-name">${food.name} <span class="food-meta">(${food.amount})</span></div>
                                            </div>
                                            <div class="food-macros">
                                                <span>${food.calories}cal</span>
                                                <span style="color:var(--text-muted)">|</span>
                                                <span>P:${food.protein}</span>
                                                <span>C:${food.carbs}</span>
                                                <span>F:${food.fat}</span>
                                            </div>
                                        </div>
                                      `).join('')}
                                </div>
                            `).join('')}
                            ${config.showDietTargets !== false && (day.targetCalories || day.targetProtein || day.targetCarbs || day.targetFat) ? (() => {
                                const carbs = day.meals.reduce((s, m) => s + m.foods.reduce((a, f) => a + f.carbs, 0), 0);
                                const fat = day.meals.reduce((s, m) => s + m.foods.reduce((a, f) => a + f.fat, 0), 0);
                                const bars = [
                                    { label: 'کالری', actual: cals, target: day.targetCalories || 0, color: '#3b82f6' },
                                    { label: 'پروتئین', actual: prot, target: day.targetProtein || 0, color: '#10b981' },
                                    { label: 'کربوهیدرات', actual: carbs, target: day.targetCarbs || 0, color: '#f59e0b' },
                                    { label: 'چربی', actual: fat, target: day.targetFat || 0, color: '#ef4444' },
                                ].filter(b => b.target > 0);
                                if (bars.length === 0) return '';
                                return `
                                <div class="target-bar-container">
                                    <div style="font-weight:800; font-size:12px; color:var(--text-main); margin-bottom:12px;">مقایسه اهداف واقعی</div>
                                    ${bars.map(b => {
                                        const pct = Math.min(100, (b.actual / b.target) * 100);
                                        const over = b.actual > b.target;
                                        return `
                                        <div class="target-bar-row">
                                            <div class="target-bar-label">${b.label}</div>
                                            <div class="target-bar-track">
                                                <div class="target-bar-fill" style="width:${pct}%; background:${over ? '#ef4444' : b.color}"></div>
                                            </div>
                                            <div class="target-bar-value" style="color:${over ? '#ef4444' : 'var(--text-main)'}">${Math.round(b.actual)} / ${b.target}</div>
                                        </div>`;
                                    }).join('')}
                                </div>`;
                            })() : ''}
                        </div>
                    </div>
                `}).join('')}
            </div>

            ${trainer && config.showTrainerInfo ? `
            <div class="trainer-card">
                ${trainer.logoUrl ? `<img src="${trainer.logoUrl}" class="trainer-card-logo" alt="${trainer.name}" />` : ''}
                <div class="trainer-card-content">
                    <h3 class="trainer-card-name">${trainer.name || 'مربی'}</h3>
                    ${config.showTrainerBio !== false && trainer.clubName ? `<div style="font-size:12px; color:var(--text-muted); margin-bottom:4px;">${trainer.clubName}</div>` : ''}
                    ${config.showTrainerBio !== false && trainer.bio ? `<div class="trainer-bio">${trainer.bio}</div>` : ''}
                    ${config.showTrainerBio !== false && trainer.certifications && trainer.certifications.length > 0 ? `
                    <div class="trainer-certs">
                        ${trainer.certifications.map(c => `<span class="trainer-cert-badge">${c}</span>`).join('')}
                    </div>` : ''}
                    <div class="trainer-card-contacts">
                        ${trainer.phone ? `<div class="trainer-contact">${EXPORT_ICONS.phone}<span dir="ltr">${trainer.phone}</span></div>` : ''}
                        ${trainer.instagram ? `<div class="trainer-contact">${EXPORT_ICONS.insta}<span dir="ltr">@${trainer.instagram}</span></div>` : ''}
                        ${trainer.telegram ? `<div class="trainer-contact">${EXPORT_ICONS.send}<span dir="ltr">${trainer.telegram}</span></div>` : ''}
                        ${trainer.email ? `<div class="trainer-contact">${EXPORT_ICONS.mail}<span dir="ltr">${trainer.email}</span></div>` : ''}
                        ${config.showTrainerBio !== false && trainer.website ? `<div class="trainer-contact"><a href="${trainer.website}" class="trainer-website" target="_blank" rel="noopener">${trainer.website}</a></div>` : ''}
                    </div>
                </div>
            </div>
            ` : ''}

            ${plan.notes ? `<div style="margin-bottom:24px; padding:20px; background:linear-gradient(135deg, var(--primary-lighter) 0%, rgba(255,255,255,0.3) 100%); border-right:4px solid var(--primary); border-radius:12px; font-size:13px; color:var(--text-main); line-height:1.7;"><strong style="color:var(--primary); font-weight:900; font-size:14px;">📝 توضیحات رژیم:</strong><br/><span style="margin-top:8px; display:block; white-space: pre-wrap;">${plan.notes}</span></div>` : ''}

            <div class="footer">
                <div class="footer-section">
                    <div class="footer-note">
                        ${(config.showSlogan && trainer?.slogan) ? `<strong>${trainer.slogan}</strong><br/>` : ''}
                        <span style="opacity:0.7;">رژیم را دقیق رعایت کنید.</span>
                        <div style="margin-top:4px; font-size:10px; opacity:0.5;">طراحی شده با اپلیکیشن متال پلنز</div>
                    </div>
                </div>

                <div class="footer-section footer-center">
                    ${config.showTrainerInfo ? `
                        ${trainer?.phone ? `<div class="contact-row">${EXPORT_ICONS.phone} <span dir="ltr">${trainer.phone}</span></div>` : ''}
                        ${trainer?.instagram ? `<div class="contact-row">${EXPORT_ICONS.insta} <span dir="ltr">${trainer.instagram}</span></div>` : ''}
                        ${trainer?.telegram ? `<div class="contact-row">${EXPORT_ICONS.send} <span dir="ltr">${trainer.telegram}</span></div>` : ''}
                    ` : '<div style="opacity:0.3; font-size:12px;">-</div>'}
                </div>

                <div class="footer-section footer-left">
                     ${(config.showSignature && trainer?.signatureUrl) ? `
                        <div class="signature-box">
                            <img src="${trainer.signatureUrl}" class="signature-img" alt="امضا" />
                            <div class="signature-line">امضای مربی</div>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
};


// ... Progress HTML Generator ...
export const getProgressHtml = (athlete: Athlete, trainer: TrainerProfile | null, config: ExportConfig) => {
    // Stats Calculation
    const measurements = [...(athlete.measurements || [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latest = measurements[measurements.length - 1];
    const first = measurements[0];
    const weightChange = (latest?.weight || 0) - (first?.weight || 0);

    const photosHtml = config.includePhotos !== false ? generatePhotosHtml(athlete, config) : '';

    // Chart Generation (Weight)
    let chartHtml = '';
    if (measurements.length >= 2) {
        const sorted = [...measurements].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const data = sorted.map(m => ({ date: new Date(m.date), val: m.weight }));

        // Settings
        const width = 800;
        const height = 300;
        const padding = 40;

        const minVal = Math.min(...data.map(d => d.val)) - 2;
        const maxVal = Math.max(...data.map(d => d.val)) + 2;
        const minTime = data[0].date.getTime();
        const maxTime = data[data.length - 1].date.getTime();

        const getX = (date: Date) => padding + ((date.getTime() - minTime) / (maxTime - minTime)) * (width - 2 * padding);
        const getY = (val: number) => height - padding - ((val - minVal) / (maxVal - minVal)) * (height - 2 * padding);

        // Generate Path
        const pathData = data.map((d, i) =>
            `${i === 0 ? 'M' : 'L'} ${getX(d.date)} ${getY(d.val)}`
        ).join(' ');

        // Generate Area (Gradient)
        const areaPathData = `${pathData} L ${getX(data[data.length - 1].date)} ${height - padding} L ${padding} ${height - padding} Z`;

        chartHtml = `
            <div class="chart-container" style="margin-top: 40px; margin-bottom: 20px; page-break-inside: avoid;">
                <div class="section-title">
                     ${EXPORT_ICONS.activity} نمودار تغییرات وزن
                </div>
                <div style="background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 20px; overflow: hidden;">
                    <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" style="overflow: visible;">
                        <!-- Gradients -->
                        <defs>
                            <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stop-color="${config.primaryColor}" stop-opacity="0.2"/>
                                <stop offset="100%" stop-color="${config.primaryColor}" stop-opacity="0"/>
                            </linearGradient>
                        </defs>

                        <!-- Area -->
                        <path d="${areaPathData}" fill="url(#chartGradient)" stroke="none" />

                        <!-- Grid Lines (Horizontal) -->
                        ${[0, 0.25, 0.5, 0.75, 1].map(p => {
            const y = height - padding - (p * (height - 2 * padding));
            return `<line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="var(--border)" stroke-dasharray="4,4" stroke-width="1" opacity="0.5" />`;
        }).join('')}

                        <!-- Line -->
                        <path d="${pathData}" fill="none" stroke="var(--primary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

                        <!-- Points -->
                        ${data.map(d => `
                            <circle cx="${getX(d.date)}" cy="${getY(d.val)}" r="4" fill="var(--bg)" stroke="var(--primary)" stroke-width="2" />
                            <text x="${getX(d.date)}" y="${getY(d.val) - 10}" 
                                  text-anchor="middle" font-size="12" font-weight="bold" fill="var(--text-main)">
                                ${d.val}
                            </text>
                        `).join('')}

                        <!-- X Axis Labels (First & Last) -->
                         <text x="${padding}" y="${height - 15}" text-anchor="start" font-size="12" fill="var(--text-muted)">
                            ${data[0].date.toLocaleDateString('fa-IR')}
                        </text>
                         <text x="${width - padding}" y="${height - 15}" text-anchor="end" font-size="12" fill="var(--text-muted)">
                            ${data[data.length - 1].date.toLocaleDateString('fa-IR')}
                        </text>
                    </svg>
                </div>
            </div>
        `;
    }

    return `
        <div class="page-container">
            <!-- Hero Header (no trainer info) -->
            <div class="header">
                <div class="brand">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:4px;">
                        <h1 style="font-size:24px;">گزارش پیشرفت</h1>
                    </div>
                    <div style="font-size:13px; color:var(--text-muted);">ورزشکار: ${athlete.fullName}</div>
                </div>
            </div>

            <!-- Integrated Info Strip -->
            <div class="info-strip">
                <div class="info-item">
                    <span class="info-label">ورزشکار</span>
                    <span class="info-value">${athlete.fullName}</span>
                </div>
                <div class="info-divider"></div>
                <div class="info-item">
                    <span class="info-label">وزن فعلی</span>
                    <span class="info-value">${latest?.weight || '-'} kg</span>
                </div>
                <div class="info-divider"></div>
                <div class="info-item">
                    <span class="info-label">تغییر کل</span>
                    <span class="info-value" dir="ltr" style="color:${weightChange <= 0 ? '#10b981' : '#ef4444'}">${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)} kg</span>
                </div>
                <div class="info-divider"></div>
                <div class="info-item">
                    <span class="info-label">سن</span>
                    <span class="info-value">${athlete.age}</span>
                </div>
            </div>

            ${config.showAdherence !== false ? (() => {
                const records = getPersonalRecords(athlete);
                const adherence = calculateWorkoutAdherence(athlete.workoutLog, { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() });
                const recentLogs = (athlete.workoutLog || []).slice(-7);
                return `
            <div class="section-title">
                ${EXPORT_ICONS.activity} آمار پایبندی (۳۰ روز اخیر)
            </div>
            <div class="adherence-grid">
                <div class="adherence-stat">
                    <div class="value">${adherence}%</div>
                    <div class="label">نرخ پایبندی</div>
                </div>
                <div class="adherence-stat">
                    <div class="value">${recentLogs.filter(l => l.completed).length}/${recentLogs.length}</div>
                    <div class="label">تمرینات هفته اخیر</div>
                </div>
                <div class="adherence-stat">
                    <div class="value">${records.length}</div>
                    <div class="label">رکوردهای شخصی</div>
                </div>
                <div class="adherence-stat">
                    <div class="value" dir="ltr" style="color:${weightChange <= 0 ? '#10b981' : '#ef4444'}">${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}</div>
                    <div class="label">تغییر وزن (کیلو)</div>
                </div>
            </div>
            <div class="weekly-strip">
                ${recentLogs.map(l => `<div class="weekly-dot ${l.completed ? 'completed' : 'missed'}" title="${new Date(l.date).toLocaleDateString('fa-IR')}"></div>`).join('')}
            </div>
            `; })() : ''}

            <!-- Stats/Measurements Table -->
           <div class="days-list" style="gap: 12px; margin-bottom: 30px;">
                <div class="section-title">
                     ${EXPORT_ICONS.ruler} ${config.showFullMeasurements ? 'اندازه‌گیری‌های کامل' : 'آخرین اندازه‌گیری‌ها'}
                </div>
                ${config.showFullMeasurements && latest ? (() => {
                    const comp = calculateBodyComposition(latest.weight, latest.bodyFat);
                    const leanPct = comp.totalWeight > 0 ? (comp.leanMass / comp.totalWeight * 100) : 0;
                    const fatPct = comp.totalWeight > 0 ? (comp.fatMass / comp.totalWeight * 100) : 0;
                    return `
                <div style="padding:16px; background:var(--bg); border-radius:12px; border:1px solid var(--border); margin-bottom:16px;">
                    <div style="font-weight:800; font-size:13px; color:var(--text-main); margin-bottom:8px;">ترکیب بدنی</div>
                    <div style="display:flex; gap:16px; font-size:12px; color:var(--text-muted); margin-bottom:8px;">
                        <span>LEAN: ${comp.leanMass.toFixed(1)}kg (${leanPct.toFixed(0)}%)</span>
                        <span>FAT: ${comp.fatMass.toFixed(1)}kg (${fatPct.toFixed(0)}%)</span>
                    </div>
                    <div class="composition-bar">
                        <div class="composition-lean" style="width:${leanPct}%"></div>
                        <div class="composition-fat" style="width:${fatPct}%"></div>
                    </div>
                </div>
                `;
                })() : ''}
                <div class="day-card" style="border: 1px solid var(--border); border-radius: 12px; overflow-x: auto;">
                     <table class="${config.showFullMeasurements ? 'measurement-full-table' : ''}" style="${config.showFullMeasurements ? '' : 'width: 100%; text-align: right; border-collapse: collapse; font-size: 13px;'}">
                        <thead>
                            <tr style="background: var(--bg); border-bottom: 1px solid var(--border);">
                                <th style="padding: 12px; font-weight: 800; color: var(--text-muted);">تاریخ</th>
                                <th style="padding: 12px; font-weight: 800; color: var(--text-muted);">وزن</th>
                                <th style="padding: 12px; font-weight: 800; color: var(--text-muted);">چربی</th>
                                ${config.showFullMeasurements ? `
                                <th style="padding: 12px; font-weight: 800; color: var(--text-muted);">گردن</th>
                                <th style="padding: 12px; font-weight: 800; color: var(--text-muted);">شانه</th>
                                <th style="padding: 12px; font-weight: 800; color: var(--text-muted);">سینه</th>
                                <th style="padding: 12px; font-weight: 800; color: var(--text-muted);">بازو</th>
                                <th style="padding: 12px; font-weight: 800; color: var(--text-muted);">ساعد</th>
                                ` : ''}
                                <th style="padding: 12px; font-weight: 800; color: var(--text-muted);">کمر</th>
                                ${config.showFullMeasurements ? `
                                <th style="padding: 12px; font-weight: 800; color: var(--text-muted);">باسن</th>
                                <th style="padding: 12px; font-weight: 800; color: var(--text-muted);">ران</th>
                                <th style="padding: 12px; font-weight: 800; color: var(--text-muted);">ساق</th>
                                <th style="padding: 12px; font-weight: 800; color: var(--text-muted);">حال</th>
                                ` : ''}
                                <th style="padding: 12px; font-weight: 800; color: var(--text-muted);">یادداشت</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(config.showFullMeasurements ? measurements : [...measurements].reverse().slice(0, 5)).map(m => `
                                <tr style="border-bottom: 1px dashed var(--border);">
                                    <td style="padding: 12px;">${new Date(m.date).toLocaleDateString('fa-IR')}</td>
                                    <td style="padding: 12px; font-weight: bold;">${m.weight}</td>
                                    <td style="padding: 12px;">${m.bodyFat || '-'}</td>
                                    ${config.showFullMeasurements ? `
                                    <td style="padding: 12px;">${m.neck || '-'}</td>
                                    <td style="padding: 12px;">${m.shoulder || '-'}</td>
                                    <td style="padding: 12px;">${m.chest || '-'}</td>
                                    <td style="padding: 12px;">${m.arms || '-'}</td>
                                    <td style="padding: 12px;">${m.forearms || '-'}</td>
                                    ` : ''}
                                    <td style="padding: 12px;">${m.waist || '-'}</td>
                                    ${config.showFullMeasurements ? `
                                    <td style="padding: 12px;">${m.hips || '-'}</td>
                                    <td style="padding: 12px;">${m.thighs || '-'}</td>
                                    <td style="padding: 12px;">${m.calves || '-'}</td>
                                    <td style="padding: 12px;">
                                        ${m.mood ? `<div class="mood-indicator">${Array.from({length:5}, (_,i) => `<div class="mood-dot ${(m.mood || 0) > i ? 'filled' : 'empty'}"></div>`).join('')}</div>` : '-'}
                                    </td>
                                    ` : ''}
                                    <td style="padding: 12px; font-size: 12px; color: var(--text-muted);">${m.notes || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                     </table>
                </div>
           </div>

            ${chartHtml}

            ${config.showCharts !== false && measurements.length >= 2 ? (() => {
                const colors = {
                    primary: config.primaryColor,
                    success: '#10b981',
                    warning: '#f59e0b',
                    danger: '#ef4444',
                    textMain: config.theme === 'dark' ? '#f8fafc' : '#0f172a',
                    textMuted: config.theme === 'dark' ? '#94a3b8' : '#64748b',
                    border: config.theme === 'dark' ? '#334155' : '#e2e8f0',
                    surface: config.theme === 'dark' ? '#1e293b' : '#ffffff',
                };
                const sorted = [...measurements].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                const latestM = sorted[sorted.length - 1];
                const firstM = sorted[0];

                // Radar chart for body circumferences
                const radarMetrics = [
                    { label: 'شانه', val: latestM.shoulder || 0, max: 150 },
                    { label: 'سینه', val: latestM.chest || 0, max: 130 },
                    { label: 'بازو', val: latestM.arms || 0, max: 50 },
                    { label: 'کمر', val: latestM.waist || 0, max: 120 },
                    { label: 'باسن', val: latestM.hips || 0, max: 130 },
                    { label: 'ران', val: latestM.thighs || 0, max: 70 },
                    { label: 'ساق', val: latestM.calves || 0, max: 50 },
                    { label: 'گردن', val: latestM.neck || 0, max: 50 },
                ].filter(m => m.val > 0);

                let radarSvg = '';
                if (radarMetrics.length >= 3) {
                    const cx = 150, cy = 150, r = 110;
                    const angleStep = (2 * Math.PI) / radarMetrics.length;
                    const polygonPoints = radarMetrics.map((m, i) => {
                        const angle = i * angleStep - Math.PI / 2;
                        const dist = (m.val / m.max) * r;
                        return `${cx + dist * Math.cos(angle)},${cy + dist * Math.sin(angle)}`;
                    }).join(' ');
                    const gridLevels = [0.25, 0.5, 0.75, 1];
                    radarSvg = `
                    <div class="chart-section">
                        <div class="section-title">${EXPORT_ICONS.ruler} نمودار محیط بدن</div>
                        <div class="chart-card">
                            <svg width="100%" viewBox="0 0 300 300" style="max-width:300px; margin:0 auto; display:block;">
                                ${gridLevels.map(level => {
                                    const pts = radarMetrics.map((_, i) => {
                                        const angle = i * angleStep - Math.PI / 2;
                                        return `${cx + level * r * Math.cos(angle)},${cy + level * r * Math.sin(angle)}`;
                                    }).join(' ');
                                    return `<polygon points="${pts}" fill="none" stroke="${colors.border}" stroke-width="1" />`;
                                }).join('')}
                                ${radarMetrics.map((_, i) => {
                                    const angle = i * angleStep - Math.PI / 2;
                                    return `<line x1="${cx}" y1="${cy}" x2="${cx + r * Math.cos(angle)}" y2="${cy + r * Math.sin(angle)}" stroke="${colors.border}" stroke-width="0.5" />`;
                                }).join('')}
                                <polygon points="${polygonPoints}" fill="${colors.primary}" fill-opacity="0.2" stroke="${colors.primary}" stroke-width="2" />
                                ${radarMetrics.map((m, i) => {
                                    const angle = i * angleStep - Math.PI / 2;
                                    const lx = cx + (r + 20) * Math.cos(angle);
                                    const ly = cy + (r + 20) * Math.sin(angle);
                                    return `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" font-size="10" fill="${colors.textMuted}">${m.label}: ${m.val}</text>`;
                                }).join('')}
                            </svg>
                        </div>
                    </div>`;
                }

                // Pie chart for body composition
                let pieSvg = '';
                if (latestM.bodyFat && latestM.weight) {
                    const comp = calculateBodyComposition(latestM.weight, latestM.bodyFat);
                    const leanPct = comp.totalWeight > 0 ? (comp.leanMass / comp.totalWeight * 100) : 0;
                    const fatPct = 100 - leanPct;
                    const r2 = 60, cx2 = 80, cy2 = 80;
                    const fatAngle = (fatPct / 100) * 2 * Math.PI;
                    const fatX = cx2 + r2 * Math.sin(fatAngle);
                    const fatY = cy2 - r2 * Math.cos(fatAngle);
                    const largeArc = fatPct > 50 ? 1 : 0;
                    pieSvg = `
                    <div class="chart-section">
                        <div class="section-title">ترکیب بدنی</div>
                        <div class="chart-card" style="display:flex; align-items:center; gap:24px;">
                            <svg width="160" height="160" viewBox="0 0 160 160">
                                <circle cx="${cx2}" cy="${cy2}" r="${r2}" fill="none" stroke="${colors.success}" stroke-width="24" stroke-dasharray="${leanPct * 2 * Math.PI * r2 / 100} ${(100 - leanPct) * 2 * Math.PI * r2 / 100}" stroke-dashoffset="${25 * 2 * Math.PI * r2 / 100}" />
                                <circle cx="${cx2}" cy="${cy2}" r="${r2}" fill="none" stroke="${colors.warning}" stroke-width="24" stroke-dasharray="${fatPct * 2 * Math.PI * r2 / 100} ${(100 - fatPct) * 2 * Math.PI * r2 / 100}" stroke-dashoffset="${(25 - leanPct) * 2 * Math.PI * r2 / 100}" />
                                <text x="${cx2}" y="${cy2}" text-anchor="middle" dominant-baseline="middle" font-size="14" font-weight="900" fill="${colors.textMain}">${comp.leanMass.toFixed(0)}kg</text>
                            </svg>
                            <div>
                                <div style="font-size:13px; font-weight:800; color:${colors.success};">● عضله خالص: ${comp.leanMass.toFixed(1)}kg (${leanPct.toFixed(0)}%)</div>
                                <div style="font-size:13px; font-weight:800; color:${colors.warning}; margin-top:4px;">● چربی: ${comp.fatMass.toFixed(1)}kg (${fatPct.toFixed(0)}%)</div>
                                <div style="font-size:12px; color:${colors.textMuted}; margin-top:8px;">وزن کل: ${comp.totalWeight}kg</div>
                            </div>
                        </div>
                    </div>`;
                }

                // Multi-line chart (weight + bodyFat + waist)
                let multiChartSvg = '';
                if (sorted.length >= 2 && sorted.some(m => m.bodyFat) && sorted.some(m => m.waist)) {
                    const w = 800, h = 300, pad = 40;
                    const dataW = sorted.map(m => ({ date: new Date(m.date).getTime(), val: m.weight }));
                    const dataF = sorted.filter(m => m.bodyFat).map(m => ({ date: new Date(m.date).getTime(), val: m.bodyFat! }));
                    const dataZ = sorted.filter(m => m.waist).map(m => ({ date: new Date(m.date).getTime(), val: m.waist! }));
                    const allVals = [...dataW.map(d => d.val), ...dataF.map(d => d.val), ...dataZ.map(d => d.val)];
                    const minV = Math.min(...allVals) - 2, maxV = Math.max(...allVals) + 2;
                    const minT = dataW[0].date, maxT = dataW[dataW.length - 1].date;
                    const gX = (t: number) => pad + ((t - minT) / (maxT - minT)) * (w - 2 * pad);
                    const gY = (v: number) => h - pad - ((v - minV) / (maxV - minV)) * (h - 2 * pad);
                    const makePath = (data: {date:number;val:number}[]) => data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${gX(d.date)} ${gY(d.val)}`).join(' ');
                    multiChartSvg = `
                    <div class="chart-section">
                        <div class="section-title">مقایسه چند شاخص</div>
                        <div class="chart-card">
                            <svg width="100%" viewBox="0 0 ${w} ${h}" style="overflow:visible;">
                                ${[0, 0.25, 0.5, 0.75, 1].map(p => {
                                    const y = h - pad - (p * (h - 2 * pad));
                                    return `<line x1="${pad}" y1="${y}" x2="${w - pad}" y2="${y}" stroke="${colors.border}" stroke-dasharray="4,4" stroke-width="1" opacity="0.5" />`;
                                }).join('')}
                                <path d="${makePath(dataW)}" fill="none" stroke="${colors.primary}" stroke-width="2.5" stroke-linecap="round" />
                                <path d="${makePath(dataF)}" fill="none" stroke="${colors.warning}" stroke-width="2" stroke-dasharray="6,3" stroke-linecap="round" />
                                <path d="${makePath(dataZ)}" fill="none" stroke="${colors.danger}" stroke-width="2" stroke-dasharray="3,3" stroke-linecap="round" />
                                ${dataW.map(d => `<circle cx="${gX(d.date)}" cy="${gY(d.val)}" r="3" fill="${colors.surface}" stroke="${colors.primary}" stroke-width="2" />`).join('')}
                                <text x="${pad}" y="${h - 10}" font-size="10" fill="${colors.primary}">● وزن</text>
                                <text x="${pad + 60}" y="${h - 10}" font-size="10" fill="${colors.warning}">● چربی%</text>
                                <text x="${pad + 130}" y="${h - 10}" font-size="10" fill="${colors.danger}">● کمر</text>
                                <text x="${pad}" y="${h - 10}" font-size="10" fill="${colors.textMuted}">${new Date(dataW[0].date).toLocaleDateString('fa-IR')}</text>
                                <text x="${w - pad}" y="${h - 10}" text-anchor="end" font-size="10" fill="${colors.textMuted}">${new Date(dataW[dataW.length - 1].date).toLocaleDateString('fa-IR')}</text>
                            </svg>
                        </div>
                    </div>`;
                }

                return radarSvg + pieSvg + multiChartSvg;
            })() : ''}

            ${photosHtml}

            ${(config.showPersonalRecords !== false && (athlete.personalRecords || []).length > 0) ? `
            <div class="section-title" style="margin-top:32px;">
                ${EXPORT_ICONS.dumbbell} رکوردهای شخصی
            </div>
            <div style="overflow-x: auto;">
            <table class="pr-table">
                <thead>
                    <tr>
                        <th>حرکت</th>
                        <th>وزنه</th>
                        <th>تکرار</th>
                        <th>تاریخ</th>
                        <th>یادداشت</th>
                    </tr>
                </thead>
                <tbody>
                    ${getPersonalRecords(athlete).slice(0, 15).map(pr => `
                        <tr>
                            <td style="font-weight:800;">${pr.exerciseName}</td>
                            <td dir="ltr">${pr.weight} kg</td>
                            <td>${pr.reps}</td>
                            <td>${new Date(pr.date).toLocaleDateString('fa-IR')}</td>
                            <td style="font-size:12px; color:var(--text-muted);">${pr.notes || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            </div>
            ` : ''}

            ${(config.showGoals !== false && (athlete.goals || []).length > 0) ? `
            <div class="section-title" style="margin-top:32px;">
                🎯 اهداف
            </div>
            ${(athlete.goals || []).map(goal => {
                const progress = calculateGoalProgress(goal);
                return `
                <div class="goal-card">
                    <div class="goal-info">
                        <div class="goal-title">${goal.title}</div>
                        <div class="goal-meta">${goal.current} / ${goal.target} ${goal.unit}${goal.deadline ? ` — مهلت: ${new Date(goal.deadline).toLocaleDateString('fa-IR')}` : ''}</div>
                        <div class="goal-progress-bar">
                            <div class="goal-progress-fill ${goal.achieved ? 'complete' : 'in-progress'}" style="width: ${progress}%"></div>
                        </div>
                    </div>
                    <div style="font-size:14px; font-weight:900; color:${goal.achieved ? '#10b981' : 'var(--primary)'};">${progress}%</div>
                </div>
                `;
            }).join('')}
            ` : ''}

            <div class="footer">
                <div class="footer-section">
                    <div class="footer-note">
                        <span style="opacity:0.7;">تداوم در تمرین و تغذیه سالم، کلید موفقیت شماست.</span>
                    </div>
                </div>
            </div>
        </div>
    `;
};


// ... Weekly Report HTML Generator ...
export const getWeeklyReportHtml = (athlete: Athlete, trainer: TrainerProfile | null, config: ExportConfig, dateRange: { start: Date; end: Date }) => {
    const report = generateWeeklyReport(athlete, dateRange);
    const adherence = calculateWorkoutAdherence(athlete.workoutLog, dateRange);
    const records = getPersonalRecords(athlete);

    return `
        <div class="page-container">
            <div class="header">
                <div class="brand">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:4px;">
                        <h1 style="font-size:24px;">گزارش هفتگی</h1>
                    </div>
                    <div style="font-size:13px; color:var(--text-muted);">ورزشکار: ${athlete.fullName}</div>
                </div>
            </div>

            <div class="info-strip">
                <div class="info-item">
                    <span class="info-label">ورزشکار</span>
                    <span class="info-value">${athlete.fullName}</span>
                </div>
                <div class="info-divider"></div>
                <div class="info-item">
                    <span class="info-label">از تاریخ</span>
                    <span class="info-value">${dateRange.start.toLocaleDateString('fa-IR')}</span>
                </div>
                <div class="info-divider"></div>
                <div class="info-item">
                    <span class="info-label">تا تاریخ</span>
                    <span class="info-value">${dateRange.end.toLocaleDateString('fa-IR')}</span>
                </div>
            </div>

            <div class="weekly-report-grid">
                <div class="weekly-card">
                    <div class="big-number" dir="ltr" style="color:${report.weightChange <= 0 ? '#10b981' : '#ef4444'}">${report.weightChange > 0 ? '+' : ''}${report.weightChange.toFixed(1)}</div>
                    <div class="card-label">تغییر وزن (کیلو)</div>
                    <div class="card-trend ${report.weightChange <= 0 ? 'trend-down' : 'trend-up'}">${report.weightChange <= 0 ? '↓ کاهش' : '↑ افزایش'}</div>
                </div>
                <div class="weekly-card">
                    <div class="big-number" dir="ltr" style="color:${report.bodyFatChange <= 0 ? '#10b981' : '#ef4444'}">${report.bodyFatChange > 0 ? '+' : ''}${report.bodyFatChange.toFixed(1)}</div>
                    <div class="card-label">تغییر چربی (%)</div>
                    <div class="card-trend ${report.bodyFatChange <= 0 ? 'trend-down' : 'trend-up'}">${report.bodyFatChange <= 0 ? '↓ کاهش' : '↑ افزایش'}</div>
                </div>
                <div class="weekly-card">
                    <div class="big-number">${report.workoutsCompleted}</div>
                    <div class="card-label">تمرینات انجام شده</div>
                </div>
                <div class="weekly-card">
                    <div class="big-number">${report.adherenceRate}%</div>
                    <div class="card-label">نرخ پایبندی</div>
                </div>
                <div class="weekly-card">
                    <div class="big-number">${report.newPRs}</div>
                    <div class="card-label">رکوردهای جدید</div>
                </div>
            </div>

            ${records.length > 0 ? `
            <div class="section-title" style="margin-top:32px;">
                ${EXPORT_ICONS.dumbbell} رکوردهای شخصی اخیر
            </div>
            <div style="overflow-x: auto;">
            <table class="pr-table">
                <thead>
                    <tr>
                        <th>حرکت</th>
                        <th>وزنه</th>
                        <th>تکرار</th>
                        <th>تاریخ</th>
                    </tr>
                </thead>
                <tbody>
                    ${records.slice(0, 10).map(pr => `
                        <tr>
                            <td style="font-weight:800;">${pr.exerciseName}</td>
                            <td dir="ltr">${pr.weight} kg</td>
                            <td>${pr.reps}</td>
                            <td>${new Date(pr.date).toLocaleDateString('fa-IR')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            </div>
            ` : ''}

            ${trainer && config.showTrainerInfo ? `
            <div class="trainer-card" style="margin-top:32px;">
                ${trainer.logoUrl ? `<img src="${trainer.logoUrl}" class="trainer-card-logo" alt="${trainer.name}" />` : ''}
                <div class="trainer-card-content">
                    <h3 class="trainer-card-name">${trainer.name || 'مربی'}</h3>
                    ${config.showTrainerBio !== false && trainer.clubName ? `<div style="font-size:12px; color:var(--text-muted); margin-bottom:4px;">${trainer.clubName}</div>` : ''}
                    ${config.showTrainerBio !== false && trainer.bio ? `<div class="trainer-bio">${trainer.bio}</div>` : ''}
                    ${config.showTrainerBio !== false && trainer.certifications && trainer.certifications.length > 0 ? `
                    <div class="trainer-certs">
                        ${trainer.certifications.map(c => `<span class="trainer-cert-badge">${c}</span>`).join('')}
                    </div>` : ''}
                    <div class="trainer-card-contacts">
                        ${trainer.phone ? `<div class="contact-row">${EXPORT_ICONS.phone}<span dir="ltr">${trainer.phone}</span></div>` : ''}
                        ${trainer.instagram ? `<div class="contact-row">${EXPORT_ICONS.insta}<span dir="ltr">@${trainer.instagram}</span></div>` : ''}
                        ${config.showTrainerBio !== false && trainer.website ? `<div class="contact-row"><a href="${trainer.website}" class="trainer-website" target="_blank" rel="noopener">${trainer.website}</a></div>` : ''}
                    </div>
                </div>
            </div>
            ` : ''}

            <div class="footer">
                <div class="footer-section">
                    <div class="footer-note">
                        <span style="opacity:0.7;">گزارش هفتگی — متال پلنز</span>
                    </div>
                </div>
            </div>
        </div>
    `;
};
