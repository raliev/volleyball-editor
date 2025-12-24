/**
 * Логика экспорта в PNG
 */
export const exportToPng = (fabricCanvas) => {
    const fileName = prompt("PNG file name:", "volleyball_drill") || "volleyball_drill";

    // multiplier: 2 делает изображение более четким (Retina-quality)
    const dataURL = fabricCanvas.toDataURL({
        format: 'png',
        multiplier: 2,
        enableRetinaScaling: true
    });

    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};