// AmbiSecure Sequence Diagram Generator — export pipeline
// SVG download and PNG (via canvas) download. PDF deferred (would need a
// heavy library; out of scope for this turn).
(function (root) {
  'use strict';

  function svgToString(svg) {
    var serializer = new XMLSerializer();
    var str = serializer.serializeToString(svg);
    // Ensure the doctype + xmlns are present for standalone files.
    if (str.indexOf('xmlns="http://www.w3.org/2000/svg"') === -1) {
      str = str.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
    }
    return '<?xml version="1.0" encoding="UTF-8"?>\n' + str;
  }

  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 50);
  }

  function downloadSVG(svg, filename) {
    var str = svgToString(svg);
    var blob = new Blob([str], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, filename || 'sequence-diagram.svg');
  }

  function downloadPNG(svg, filename, scale) {
    scale = scale || 2;
    var str = svgToString(svg);
    var img = new Image();
    var blob = new Blob([str], { type: 'image/svg+xml;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    img.onload = function () {
      var w = parseInt(svg.getAttribute('width'), 10) || 800;
      var h = parseInt(svg.getAttribute('height'), 10) || 600;
      var canvas = document.createElement('canvas');
      canvas.width = Math.round(w * scale);
      canvas.height = Math.round(h * scale);
      var ctx = canvas.getContext('2d');
      // Paint a solid background — exporting on a transparent canvas can
      // produce odd composites in some viewers.
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob(function (b) {
        if (!b) return;
        downloadBlob(b, filename || 'sequence-diagram.png');
      }, 'image/png');
    };
    img.onerror = function () {
      URL.revokeObjectURL(url);
      alert('PNG export failed — your browser refused to rasterise the SVG. Try the SVG export instead.');
    };
    img.src = url;
  }

  function downloadSource(text, filename) {
    var blob = new Blob([text || ''], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, filename || 'sequence-diagram.txt');
  }

  function copyText(text) {
    if (!navigator.clipboard) return Promise.reject(new Error('Clipboard unavailable'));
    return navigator.clipboard.writeText(text);
  }

  root.ASSeqExport = {
    svgToString: svgToString,
    downloadSVG: downloadSVG,
    downloadPNG: downloadPNG,
    downloadSource: downloadSource,
    copyText: copyText
  };
})(window);
