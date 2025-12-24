export const getUUID = () => Math.random().toString(36).substring(2, 11);

export const downloadFile = (data, fileName, mimeType = 'text/json') => {
  const dataStr = `data:${mimeType};charset=utf-8,` + encodeURIComponent(data);
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", fileName);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export const pythonBoolean = (value) => value ? "True" : "False";

