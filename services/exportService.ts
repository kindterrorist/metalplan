import html2canvas from 'html2canvas';
import { Athlete, WorkoutPlan, NutritionPlan, TrainerProfile, ExportConfig } from '../types';
import { getExportStyles, getPlanHtml, getDietHtml, getProgressHtml } from '../utils/exportUtils';

export const downloadHtml = (filename: string, htmlContent: string) => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
};

export const generateImageFromHtml = async (
    htmlContent: string,
    styles: string,
    width: number,
    theme: string
): Promise<string> => {
    // Create a temporary container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = `${width}px`;
    container.style.direction = 'rtl';
    container.innerHTML = `<style>${styles}</style>${htmlContent}`;
    document.body.appendChild(container);

    // Wait a tick for styles to render
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
        const canvas = await html2canvas(container, {
            scale: 2, // Retina quality
            useCORS: true, // For images
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


export const downloadPlanAsHtml = (plan: WorkoutPlan, athlete: Athlete, trainer: TrainerProfile | null, config: ExportConfig) => {
    const styles = getExportStyles(config);
    const bodyContent = getPlanHtml(plan, athlete, trainer, config);

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="fa" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <title>برنامه تمرینی ${athlete.fullName}</title>
        <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet" type="text/css" />
        <style>${styles}</style>
    </head>
    <body>
        ${bodyContent}
        <script>
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
        </script>
        <script>window.print();</script>
    </body>
    </html>
    `;

    downloadHtml(`plan-${athlete.fullName.replace(/\s+/g, '-')}.html`, htmlContent);
};

export const downloadDietAsHtml = (plan: NutritionPlan, athlete: Athlete, trainer: TrainerProfile | null, config: ExportConfig) => {
    const styles = getExportStyles(config);
    const bodyContent = getDietHtml(plan, athlete, trainer, config);

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="fa" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <title>رژیم غذایی ${athlete.fullName}</title>
        <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet" type="text/css" />
        <style>${styles}</style>
    </head>
    <body>
        ${bodyContent}
        <script>
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
        </script>
        <script>window.print();</script>
    </body>
    </html>
    `;

    downloadHtml(`diet-${athlete.fullName.replace(/\s+/g, '-')}.html`, htmlContent);
};

export const downloadProgressAsHtml = (athlete: Athlete, trainer: TrainerProfile | null, config: ExportConfig) => {
    const styles = getExportStyles(config);
    const bodyContent = getProgressHtml(athlete, trainer, config);

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="fa" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <title>گزارش پیشرفت ${athlete.fullName}</title>
        <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet" type="text/css" />
        <style>${styles}</style>
    </head>
    <body>
        ${bodyContent}
        <script>window.print();</script>
    </body>
    </html>
    `;

    downloadHtml(`progress-${athlete.fullName.replace(/\s+/g, '-')}.html`, htmlContent);
};

export const downloadPlanAsImage = async (plan: WorkoutPlan, athlete: Athlete, trainer: TrainerProfile | null, config: ExportConfig, onStart: () => void, onEnd: () => void) => {
    onStart();
    try {
        const styles = getExportStyles(config);
        const bodyContent = getPlanHtml(plan, athlete, trainer, config);
        const dataUrl = await generateImageFromHtml(bodyContent, styles, 794, config.theme);

        const link = document.createElement('a');
        link.download = `plan-${athlete.fullName.replace(/\s+/g, '-')}.png`;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error('Image export failed:', err);
        alert('خطا در تولید تصویر. لطفا دوباره تلاش کنید.');
    } finally {
        onEnd();
    }
};

export const downloadDietAsImage = async (plan: NutritionPlan, athlete: Athlete, trainer: TrainerProfile | null, config: ExportConfig, onStart: () => void, onEnd: () => void) => {
    onStart();
    try {
        const styles = getExportStyles(config);
        const bodyContent = getDietHtml(plan, athlete, trainer, config);
        const dataUrl = await generateImageFromHtml(bodyContent, styles, 794, config.theme);

        const link = document.createElement('a');
        link.download = `diet-${athlete.fullName.replace(/\s+/g, '-')}.png`;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error('Image export failed:', err);
        alert('خطا در تولید تصویر. لطفا دوباره تلاش کنید.');
    } finally {
        onEnd();
    }
};

export const downloadProgressAsImage = async (athlete: Athlete, trainer: TrainerProfile | null, config: ExportConfig, onStart: () => void, onEnd: () => void) => {
    onStart();
    try {
        const styles = getExportStyles(config);
        const bodyContent = getProgressHtml(athlete, trainer, config);
        const dataUrl = await generateImageFromHtml(bodyContent, styles, 794, config.theme);

        const link = document.createElement('a');
        link.download = `progress-${athlete.fullName.replace(/\s+/g, '-')}.png`;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error('Image export failed:', err);
        alert('خطا در تولید تصویر. لطفا دوباره تلاش کنید.');
    } finally {
        onEnd();
    }
};
