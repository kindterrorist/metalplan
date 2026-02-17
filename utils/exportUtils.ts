import { Athlete, WorkoutPlan, NutritionPlan, TrainerProfile, ExportConfig } from '../types';

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
        bgPatternCSS = `background-image: radial-gradient(${encodedBorder} 1px, transparent 1px); background-size: 20px 20px;`;
    } else if (config.backgroundPattern === 'grid') {
        bgPatternCSS = `background-image: linear-gradient(${encodedBorder} 1px, transparent 1px), linear-gradient(90deg, ${encodedBorder} 1px, transparent 1px); background-size: 20px 20px;`;
    } else if (config.backgroundPattern === 'waves') {
        bgPatternCSS = `background-image: url("data:image/svg+xml,%3Csvg width='40' height='12' viewBox='0 0 40 12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 6.172C9.763 6.172 9.763 0 19.526 0S29.289 6.172 29.289 6.172 29.289 12 39.052 12' stroke='${encodedBorder}' fill='none' fill-rule='evenodd'/%3E%3C/svg%3E"); background-size: 40px 12px;`;
    } else if (config.backgroundPattern === 'custom' && config.customBackgroundImage) {
        bgPatternCSS = `background-image: url('${config.customBackgroundImage}'); background-size: cover; background-position: center; background-repeat: no-repeat; background-attachment: fixed;`;
    }

    return `
    :root {
        --primary: ${config.primaryColor};
        --primary-light: ${config.theme === 'dark' ? `${config.primaryColor}33` : `${config.primaryColor}1a`};
        --surface: ${surface};
        --bg: ${bg};
        --border: ${border};
        --text-main: ${textMain};
        --text-muted: ${textMuted};
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
        line-height: 1.5;
        direction: rtl;
        ${bgPatternCSS}
    }

    .page-container {
        max-width: 210mm;
        margin: 0 auto;
        background: var(--surface);
        border-radius: ${config.theme === 'modern' ? '24px' : '0'};
        box-shadow: ${config.theme === 'modern' ? '0 10px 40px -10px rgba(0,0,0,0.1)' : 'none'};
        padding: 48px;
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
        background: ${config.theme === 'dark' ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : (config.theme === 'modern' ? 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)' : 'transparent')};
        padding: 32px;
        border-radius: 24px;
        margin-bottom: 24px;
        border: ${config.theme === 'minimal' || config.theme === 'bold' ? '2px solid var(--text-main)' : '1px solid var(--border)'};
        position: relative;
        overflow: hidden;
        box-shadow: ${config.theme === 'modern' ? '0 20px 40px -10px rgba(37, 99, 235, 0.1)' : 'none'};
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
        gap: 6px;
        z-index: 2;
    }
    
    .brand h1 {
        font-size: 32px;
        font-weight: 900;
        color: var(--primary);
        margin: 0;
        line-height: 1.2;
    }

    .brand-slogan {
        font-size: 13px;
        font-weight: 500;
        color: var(--text-muted);
    }

    .brand-logo {
        width: 80px;
        height: 80px;
        border-radius: 20px;
        object-fit: cover;
        box-shadow: ${config.theme === 'modern' ? '0 8px 20px -5px rgba(0,0,0,0.1)' : 'none'};
        z-index: 2;
        background: white;
    }

    /* Info Strip - Modern Horizontal Layout */
    .info-strip {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: ${config.theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(255,255,255, 0.8)'};
        backdrop-filter: blur(10px);
        border: 1px solid var(--border);
        padding: 16px 24px;
        border-radius: 18px;
        margin-bottom: 40px;
        gap: 24px;
    }

    .info-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
    }

    .info-label {
        font-size: 10px;
        font-weight: 800;
        color: var(--primary);
        text-transform: uppercase;
        opacity: 0.8;
    }
    
    .info-value {
        font-size: 15px;
        font-weight: 800;
        color: var(--text-main);
    }

    .info-divider {
        width: 1px;
        height: 40px;
        background: var(--border);
    }

    /* Section Title */
    .section-title {
        font-size: 18px;
        font-weight: 800;
        color: var(--primary);
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding-bottom: 10px;
        border-bottom: 2px solid var(--border);
    }

    /* Days List */
    .days-list {
        display: flex;
        flex-direction: column;
        gap: 24px;
        flex-grow: 1;
    }

    .day-card {
        border: ${config.theme === 'minimal' ? 'none' : '1px solid var(--border)'};
        border-bottom: ${config.theme === 'minimal' ? '2px solid var(--text-main)' : '1px solid var(--border)'};
        border-radius: ${config.theme === 'modern' ? '20px' : '0'};
        background: var(--surface);
        break-inside: avoid;
        overflow: hidden;
        box-shadow: ${config.theme === 'modern' ? '0 4px 6px -2px rgba(0, 0, 0, 0.05)' : 'none'};
    }
    
    .day-card.rest {
        background: ${config.theme === 'dark' ? '#451a03' : '#fffbeb'};
        border: 2px dashed #f59e0b;
    }

    .day-header {
        background: ${config.theme === 'minimal' ? 'transparent' : 'var(--bg)'};
        padding: 16px 24px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: ${config.theme === 'modern' ? '1px solid var(--border)' : 'none'};
        cursor: pointer;
    }
    
    .day-title {
        font-weight: 900;
        font-size: 18px;
        display: flex;
        align-items: center;
        gap: 12px;
        color: var(--text-main);
    }
    
    .day-subtitle {
        font-size: 12px;
        font-weight: normal;
        color: var(--text-muted);
        margin-right: 8px;
    }



    .badge-count {
        background: var(--text-main);
        color: var(--bg);
        font-size: 12px;
        padding: 4px 10px;
        border-radius: 8px;
        font-weight: bold;
    }

    .rest-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 30px;
        color: #b45309;
        gap: 12px;
    }
    
    .chevron-icon {
        transition: transform 0.3s ease;
        transform: rotate(180deg);
    }

    .day-body {
        transition: all 0.3s ease;
    }

    /* Exercises Table Look */
    .exercise-row {
        display: grid;
        grid-template-columns: 2.5fr 1fr 1fr 1fr;
        padding: 16px 24px;
        align-items: center;
        border-bottom: 1px solid var(--border);
        gap: 12px;
    }
    
    .exercise-row:last-child {
        border-bottom: none;
    }
    
    .ex-main {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    
    .ex-name {
        font-weight: 800;
        font-size: 15px;
        color: var(--text-main);
    }
    
    .stat-pill {
        display: flex;
        flex-direction: column;
        align-items: center;
        background: var(--bg);
        padding: 8px 6px;
        border-radius: 12px;
        border: 1px solid transparent;
    }
    
    ${config.theme === 'bold' ? `
    .stat-pill {
        background: transparent;
        border: 1px solid var(--text-main);
        border-radius: 4px;
    }
    ` : ''}
    
    .stat-label {
        font-size: 10px;
        color: var(--text-muted);
        font-weight: 700;
        margin-bottom: 2px;
        text-transform: uppercase;
    }
    
    .stat-value {
        font-weight: 900;
        font-size: 16px;
        color: var(--text-main);
    }

    .ex-note {
        grid-column: 1 / -1;
        margin-top: 12px;
        background: ${config.theme === 'dark' ? '#3f3f46' : '#fffbeb'};
        color: ${config.theme === 'dark' ? '#fcd34d' : '#92400e'};
        padding: 10px 16px;
        border-radius: 12px;
        font-size: 13px;
        display: flex;
        align-items: flex-start;
        gap: 8px;
        line-height: 1.6;
    }

    /* Diet Specific Styles */
    .meal-row {
        padding: 20px 24px;
        border-bottom: 1px solid var(--border);
    }
    .meal-row:last-child { border-bottom: none; }
    
    .meal-header {
        font-weight: 900;
        font-size: 16px;
        color: var(--primary);
        margin-bottom: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .food-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px dashed var(--border);
    }
    .food-item:last-child { border-bottom: none; }
    
    .food-name { font-weight: 700; font-size: 14px; color: var(--text-main); }
    .food-meta { font-size: 12px; color: var(--text-muted); margin-right: 4px; }
    
    .food-macros { 
        display:flex; gap:12px; font-size:11px; font-weight:bold; 
        background: var(--bg); padding: 4px 8px; border-radius: 6px;
    }

    /* Footer & Photos */
    .footer {
        margin-top: auto;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        align-items: center;
        gap: 20px;
        padding: 24px 32px;
        background: ${config.theme === 'dark' ? 'rgba(30, 41, 59, 0.5)' : '#f1f5f9'};
        border-radius: 16px;
        margin-top: 40px;
        border: 1px solid var(--border);
    }
    
    .footer-section {
        display: flex;
        flex-direction: column;
        gap: 8px;
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
        gap: 8px;
        font-size: 11px;
        color: var(--text-muted);
        font-weight: 500;
    }

    .contact-row svg {
        width: 14px;
        height: 14px;
        color: var(--primary);
    }

    .signature-box {
        text-align: center;
        width: 140px;
    }
    
    .signature-img {
        max-width: 100%;
        max-height: 60px;
        object-fit: contain;
        filter: ${config.theme === 'dark' ? 'invert(1)' : 'overlay'};
        opacity: 0.8;
    }
    
    .signature-line {
        border-top: 2px solid var(--text-main);
        margin-top: 4px;
        padding-top: 4px;
        font-size: 11px;
        font-weight: 800;
    }

    .footer-note {
        font-size: 11px;
        color: var(--text-muted);
        line-height: 1.6;
    }
    
    .quote-box {
        margin-top: 30px;
        padding: 20px;
        border-right: 4px solid var(--primary);
        background: var(--bg);
        font-style: italic;
        color: var(--text-main);
        font-size: 14px;
        font-weight: 500;
        border-radius: 4px;
    }
    
    .photo-gallery {
        margin-top: 40px; 
        page-break-inside: avoid;
    }
    
    .photo-grid {
        display: grid; 
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); 
        gap: 20px;
    }
    
    .photo-card {
        background: var(--surface); 
        padding: 12px; 
        border-radius: 16px; 
        border: 1px solid var(--border); 
        box-shadow: 0 4px 10px -2px rgba(0,0,0,0.05);
    }
    
    .photo-date {
        text-align: center; 
        font-weight: 800; 
        margin-bottom: 12px; 
        font-size: 13px; 
        color: var(--text-main); 
        background: var(--bg); 
        padding: 6px 12px; 
        border-radius: 8px;
    }

    @media print {
        body { padding: 0; background: white; }
        .page-container { box-shadow: none; padding: 0mm; width: 100%; max-width: none; min-height: 0; margin: 0; border: none; }
        .chevron-icon { display: none; }
        .day-body { display: block !important; }
        .day-header { pointer-events: none; }
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
            <!-- Hero Header -->
            <div class="header">
                <div class="brand">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:4px;">
                        ${trainer?.logoUrl ? `<img src="${trainer.logoUrl}" style="width:32px; height:32px; border-radius:8px; object-fit:cover;" />` : ''}
                        <h1 style="font-size:24px;">${trainer?.name || 'برنامه تمرینی'}</h1>
                    </div>
                </div>
                ${trainer?.logoUrl
            ? `<img src="${trainer.logoUrl}" class="brand-logo" alt="Logo" />`
            : `<div style="font-weight:900; font-size:24px; color:var(--primary); opacity:0.2;">MORABI</div>`
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
                    <span class="info-label">عنوان برنامه</span>
                    <span class="info-value">${plan.name}</span>
                </div>
                <div class="info-divider"></div>
                <div class="info-item">
                    <span class="info-label">تاریخ تنظیم</span>
                    <span class="info-value">${new Date().toLocaleDateString('fa-IR')}</span>
                </div>
                ${trainer?.clubName ? `
                <div class="info-divider"></div>
                <div class="info-item">
                    <span class="info-label">باشگاه</span>
                    <span class="info-value">${trainer.clubName}</span>
                </div>` : ''}
            </div>

            ${plan.notes ? `<div style="margin-bottom:24px; padding:16px; background:var(--bg); border-radius:12px; font-size:13px; color:var(--text-muted); line-height:1.6;"><strong>توضیحات مربی:</strong> ${plan.notes}</div>` : ''}

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
                                    <span class="day-subtitle">${day.exercises.reduce((acc, ex) => acc + parseInt(ex.sets as any || 0), 0)} ست</span>
                                    ${EXPORT_ICONS.chevron}
                                </div>
                            </div>
                            <div class="day-body">
                                ${day.exercises.length > 0 ? day.exercises.map((ex, idx) => `
                                    <div class="exercise-row">
                                        <div class="ex-main">
                                            <div class="ex-name"><span style="color:var(--primary); margin-left:8px; opacity:0.6;">${idx + 1}.</span>${ex.exerciseName}</div>
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
                                    </div>
                                `).join('') : '<div style="padding:24px;text-align:center;opacity:0.5">بدون تمرین</div>'}
                            </div>
                        `}
                    </div>
                `).join('')}
            </div>

            ${config.showQuote ? `<div class="quote-box">"${randomQuote}"</div>` : ''}

            <div class="footer">
                <div class="footer-section">
                    <div class="footer-note">
                        ${(config.showSlogan && trainer?.slogan) ? `<strong>${trainer.slogan}</strong><br/>` : ''}
                        <span style="opacity:0.7;">برای نتایج بهتر، برنامه را دقیق اجرا کنید.</span>
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
            : `<div style="font-weight:900; font-size:24px; color:var(--primary); opacity:0.2;">MORABI</div>`
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

            ${plan.notes ? `<div style="margin-bottom:24px; padding:16px; background:var(--bg); border-radius:12px; font-size:13px; color:var(--text-muted); line-height:1.6;"><strong>توضیحات مربی:</strong> ${plan.notes}</div>` : ''}

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
                                    <div class="meal-header">${meal.name}</div>
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
                        </div>
                    </div>
                `}).join('')}
            </div>

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
    const measurements = athlete.measurements || [];
    const latest = measurements[measurements.length - 1];
    const first = measurements[0];
    const weightChange = (latest?.weight || 0) - (first?.weight || 0);

    const photosHtml = generatePhotosHtml(athlete, config);

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
                                <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.2"/>
                                <stop offset="100%" stop-color="var(--primary)" stop-opacity="0"/>
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
            <!-- Hero Header -->
            <div class="header">
                <div class="brand">
                    <div style="display:flex; align-items:center; gap:12px; margin-bottom:4px;">
                        ${trainer?.logoUrl ? `<img src="${trainer.logoUrl}" style="width:32px; height:32px; border-radius:8px; object-fit:cover;" />` : ''}
                        <h1 style="font-size:24px;">${trainer?.name || 'گزارش پیشرفت'}</h1>
                    </div>
                    ${(config.showSlogan && trainer?.slogan) ? `<span class="brand-slogan">${trainer.slogan}</span>` : ''}
                    
                </div>
                ${trainer?.logoUrl
            ? `<img src="${trainer.logoUrl}" class="brand-logo" alt="Logo" />`
            : `<div style="font-weight:900; font-size:24px; color:var(--primary); opacity:0.2;">MORABI</div>`
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

            <!-- Stats/Measurements Table -->
           <div class="days-list" style="gap: 12px; margin-bottom: 30px;">
                <div class="section-title">
                     ${EXPORT_ICONS.ruler} آخرین اندازه‌گیری‌ها
                </div>
                <div class="day-card" style="border: 1px solid var(--border); border-radius: 12px; overflow: hidden;">
                     <table style="width: 100%; text-align: right; border-collapse: collapse; font-size: 13px;">
                        <thead>
                            <tr style="background: var(--bg); border-bottom: 1px solid var(--border);">
                                <th style="padding: 12px; font-weight: 800; color: var(--text-muted);">تاریخ</th>
                                <th style="padding: 12px; font-weight: 800; color: var(--text-muted);">وزن</th>
                                <th style="padding: 12px; font-weight: 800; color: var(--text-muted);">چربی</th>
                                <th style="padding: 12px; font-weight: 800; color: var(--text-muted);">دور کمر</th>
                                <th style="padding: 12px; font-weight: 800; color: var(--text-muted);">یادداشت</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${[...measurements].reverse().slice(0, 5).map(m => `
                                <tr style="border-bottom: 1px dashed var(--border);">
                                    <td style="padding: 12px;">${new Date(m.date).toLocaleDateString('fa-IR')}</td>
                                    <td style="padding: 12px; font-weight: bold;">${m.weight}</td>
                                    <td style="padding: 12px;">${m.bodyFat || '-'}</td>
                                    <td style="padding: 12px;">${m.waist || '-'}</td>
                                    <td style="padding: 12px; font-size: 12px; color: var(--text-muted);">${m.notes || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                     </table>
                </div>
           </div>

            ${chartHtml}
            ${photosHtml}

            <div class="footer">
                <div class="footer-note">
                    ${(config.showSlogan && trainer?.slogan) ? `<strong>${trainer.slogan}</strong>` : 'گزارش پیشرفت - متال پلنز'}
                    <br/>
                    <span style="opacity:0.7;">تداوم در تمرین و تغذیه سالم، کلید موفقیت شماست.</span>
                </div>
                ${(config.showSignature && trainer?.signatureUrl) ? `
                    <div class="signature-box">
                        <img src="${trainer.signatureUrl}" class="signature-img" alt="امضا" />
                        <div class="signature-line">امضای مربی</div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
};
