import { downloadFile } from './utils';

/**
 * Логика экспорта в SVG
 */
export const exportToSvg = (fabricCanvas) => {
    const fileName = prompt("SVG file name:", "volleyball_drill") || "volleyball_drill";

    // Генерируем SVG код из канваса
    const svgData = fabricCanvas.toSVG();

    // Используем существующую утилиту для скачивания текстовых файлов
    downloadFile(svgData, `${fileName}.svg`, 'image/svg+xml');
};