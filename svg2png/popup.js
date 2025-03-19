document.addEventListener('DOMContentLoaded', function() {
  const selectSvgBtn = document.getElementById('selectSvg');
  const downloadPngBtn = document.getElementById('downloadPng');
  const svgFileInput = document.getElementById('svgFile');
  const preview = document.getElementById('preview');
  let currentSvg = null;

  selectSvgBtn.addEventListener('click', () => {
    svgFileInput.click();
  });

  svgFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (event) => {
        preview.innerHTML = event.target.result;
        currentSvg = event.target.result;
        downloadPngBtn.disabled = false;
      };
      reader.readAsText(file);
    } else {
      alert('请选择有效的 SVG 文件');
    }
  });

  downloadPngBtn.addEventListener('click', () => {
    if (!currentSvg) return;

    const svgElement = preview.querySelector('svg');
    
    // 获取 SVG 的尺寸
    const bbox = svgElement.getBBox();
    const width = bbox.width;
    const height = bbox.height;
    
    // 设置 SVG 的尺寸属性
    svgElement.setAttribute('width', width);
    svgElement.setAttribute('height', height);
    svgElement.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${width} ${height}`);
    
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const scale = 2; // 放大倍数
      canvas.width = width * scale;
      canvas.height = height * scale;
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // 设置白色背景
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);

      try {
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const timestamp = new Date().getTime();
            
            chrome.downloads.download({
              url: url,
              filename: `converted_${timestamp}.png`,
              saveAs: true
            });
          } else {
            alert('转换失败，请重试');
          }
        }, 'image/png', 1.0);
      } catch (error) {
        console.error('转换错误:', error);
        alert('转换失败，请重试');
      }
    };

    img.onerror = () => {
      alert('图片加载失败，请重试');
    };

    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgData);
  });
}); 