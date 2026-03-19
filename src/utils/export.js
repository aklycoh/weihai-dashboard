const getStylesText = () => {
  const cssTexts = [];

  Array.from(document.styleSheets).forEach((sheet) => {
    try {
      Array.from(sheet.cssRules).forEach((rule) => {
        cssTexts.push(rule.cssText);
      });
    } catch {
      // 跳过浏览器不允许读取的样式表。
    }
  });

  return cssTexts.join('\n');
};

const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const getElementSize = (element) => {
  const rect = element.getBoundingClientRect();

  return {
    width: Math.ceil(Math.max(rect.width, element.scrollWidth)),
    height: Math.ceil(Math.max(rect.height, element.scrollHeight)),
  };
};

const cloneExportElement = (element) => {
  const clone = element.cloneNode(true);
  clone.querySelectorAll('.no-export').forEach((node) => node.remove());
  return clone;
};

export const waitForNextPaint = () => new Promise((resolve) => {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(resolve);
  });
});

export const downloadElementAsPng = async ({ element, fileName }) => {
  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#f8fafc',
    ignoreElements: (node) => node.classList?.contains('no-export') ?? false,
  });

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/png');
  });

  if (!blob) {
    throw new Error('无法生成 PNG 文件，请稍后重试。');
  }

  downloadBlob(blob, fileName);
};

export const downloadElementAsSvg = async ({ element, fileName }) => {
  const clone = cloneExportElement(element);
  const { width, height } = getElementSize(element);
  const stylesText = getStylesText();
  const serializedClone = new XMLSerializer().serializeToString(clone);

  // 使用 foreignObject 导出整块 dashboard，浏览器内查看和再次打开最稳定。
  const svgMarkup = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    '<foreignObject x="0" y="0" width="100%" height="100%">',
    `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;height:${height}px;">`,
    '<style><![CDATA[',
    stylesText,
    ']]></style>',
    serializedClone,
    '</div>',
    '</foreignObject>',
    '</svg>',
  ].join('');

  downloadBlob(
    new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' }),
    fileName,
  );
};
