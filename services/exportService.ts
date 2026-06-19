import html2canvas from 'html2canvas';
import { Athlete, WorkoutPlan, NutritionPlan, TrainerProfile, ExportConfig } from '../types';
import { getExportStyles, getPlanHtml, getDietHtml, getProgressHtml, getWeeklyReportHtml } from '../utils/exportUtils';

const sanitizeFilename = (name: string): string =>
    name.replace(/[<>"'&]/g, '').replace(/\s+/g, '-');

const TOGGLE_DAY_SCRIPT = `
function toggleDay(header) {
    const body = header.nextElementSibling;
    const icon = header.querySelector('.chevron-icon');
    if (body.style.display === 'none') {
        body.style.display = 'block';
        if(icon) icon.style.transform = 'rotate(180deg)';
    } else {
        body.style.display = 'none';
        if(icon) icon.style.transform = 'rotate(0deg)';
    }
}
`;

export const wrapHtml = (title: string, bodyContent: string, styles: string, includeToggle: boolean): string => `
    <!DOCTYPE html>
    <html lang="fa" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet" type="text/css" />
        <style>${styles}</style>
    </head>
    <body>
        ${bodyContent}
        ${includeToggle ? `<script>${TOGGLE_DAY_SCRIPT}</script>` : ''}
    </body>
    </html>
`;

export const downloadHtml = (filename: string, htmlContent: string) => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
};

export const generateImageFromHtml = async (
    htmlContent: string,
    styles: string,
    width: number,
    theme: string
): Promise<string> => {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = `${width}px`;
    container.style.direction = 'rtl';
    container.innerHTML = `<style>${styles}</style>${htmlContent}`;
    document.body.appendChild(container);

    await new Promise(resolve => setTimeout(resolve, 500));

    try {
        const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            backgroundColor: theme === 'dark' ? '#0f172a' : '#f8fafc',
            logging: false
        });
        return canvas.toDataURL('image/png');
    } finally {
        if (document.body.contains(container)) {
            document.body.removeChild(container);
        }
    }
};

const downloadExportAsHtml = (title: string, filename: string, bodyContent: string, config: ExportConfig, includeToggle: boolean) => {
    const styles = getExportStyles(config);
    const htmlContent = wrapHtml(title, bodyContent, styles, includeToggle);
    downloadHtml(filename, htmlContent);
};

const downloadExportAsImage = async (filename: string, bodyContent: string, config: ExportConfig, onStart: () => void, onEnd: () => void) => {
    onStart();
    try {
        const styles = getExportStyles(config);
        const dataUrl = await generateImageFromHtml(bodyContent, styles, 794, config.theme);
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error('Image export failed:', err);
        alert('خطا در تولید تصویر. لطفا دوباره تلاش کنید.');
    } finally {
        onEnd();
    }
};

export const downloadPlanAsHtml = (plan: WorkoutPlan, athlete: Athlete, trainer: TrainerProfile | null, config: ExportConfig) => {
    downloadExportAsHtml(
        `برنامه تمرینی ${athlete.fullName}`,
        `plan-${sanitizeFilename(athlete.fullName)}.html`,
        getPlanHtml(plan, athlete, trainer, config),
        config,
        true
    );
};

export const downloadDietAsHtml = (plan: NutritionPlan, athlete: Athlete, trainer: TrainerProfile | null, config: ExportConfig) => {
    downloadExportAsHtml(
        `رژیم غذایی ${athlete.fullName}`,
        `diet-${sanitizeFilename(athlete.fullName)}.html`,
        getDietHtml(plan, athlete, trainer, config),
        config,
        true
    );
};

export const downloadProgressAsHtml = (athlete: Athlete, trainer: TrainerProfile | null, config: ExportConfig) => {
    downloadExportAsHtml(
        `گزارش پیشرفت ${athlete.fullName}`,
        `progress-${sanitizeFilename(athlete.fullName)}.html`,
        getProgressHtml(athlete, trainer, config),
        config,
        false
    );
};

export const downloadPlanAsImage = async (plan: WorkoutPlan, athlete: Athlete, trainer: TrainerProfile | null, config: ExportConfig, onStart: () => void, onEnd: () => void) => {
    downloadExportAsImage(
        `plan-${sanitizeFilename(athlete.fullName)}.png`,
        getPlanHtml(plan, athlete, trainer, config),
        config, onStart, onEnd
    );
};

export const downloadDietAsImage = async (plan: NutritionPlan, athlete: Athlete, trainer: TrainerProfile | null, config: ExportConfig, onStart: () => void, onEnd: () => void) => {
    downloadExportAsImage(
        `diet-${sanitizeFilename(athlete.fullName)}.png`,
        getDietHtml(plan, athlete, trainer, config),
        config, onStart, onEnd
    );
};

export const downloadProgressAsImage = async (athlete: Athlete, trainer: TrainerProfile | null, config: ExportConfig, onStart: () => void, onEnd: () => void) => {
    downloadExportAsImage(
        `progress-${sanitizeFilename(athlete.fullName)}.png`,
        getProgressHtml(athlete, trainer, config),
        config, onStart, onEnd
    );
};

// Weekly Report exports
export const downloadWeeklyReportAsHtml = (athlete: Athlete, trainer: TrainerProfile | null, config: ExportConfig, dateRange: { start: Date; end: Date }) => {
    downloadExportAsHtml(
        `گزارش هفتگی ${athlete.fullName}`,
        `weekly-report-${sanitizeFilename(athlete.fullName)}.html`,
        getWeeklyReportHtml(athlete, trainer, config, dateRange),
        config,
        false
    );
};

export const downloadWeeklyReportAsImage = async (athlete: Athlete, trainer: TrainerProfile | null, config: ExportConfig, dateRange: { start: Date; end: Date }, onStart: () => void, onEnd: () => void) => {
    downloadExportAsImage(
        `weekly-report-${sanitizeFilename(athlete.fullName)}.png`,
        getWeeklyReportHtml(athlete, trainer, config, dateRange),
        config, onStart, onEnd
    );
};

// CSV Exports
const BOM = '\uFEFF';

const downloadCsv = (filename: string, csvContent: string) => {
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
};

export const downloadMeasurementsCsv = (athlete: Athlete) => {
    const headers = ['date', 'weight', 'bodyFat', 'neck', 'shoulder', 'chest', 'arms', 'forearms', 'waist', 'hips', 'thighs', 'calves', 'mood', 'notes'];
    const rows = (athlete.measurements || []).map(m =>
        [m.date, m.weight, m.bodyFat || '', m.neck || '', m.shoulder || '', m.chest || '', m.arms || '', m.forearms || '', m.waist || '', m.hips || '', m.thighs || '', m.calves || '', m.mood || '', m.notes || ''].join(',')
    );
    downloadCsv(`measurements-${sanitizeFilename(athlete.fullName)}.csv`, [headers.join(','), ...rows].join('\n'));
};

export const downloadPRsCsv = (athlete: Athlete) => {
    const headers = ['exerciseName', 'weight', 'reps', 'date', 'notes'];
    const rows = (athlete.personalRecords || []).map(pr =>
        [`"${pr.exerciseName}"`, pr.weight, pr.reps, pr.date, `"${pr.notes || ''}"`].join(',')
    );
    downloadCsv(`personal-records-${sanitizeFilename(athlete.fullName)}.csv`, [headers.join(','), ...rows].join('\n'));
};
