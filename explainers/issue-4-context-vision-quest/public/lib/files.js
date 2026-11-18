// Builds the downloads in the browser, so a person's context file never has to leave their device to be exported.
// A Word file is a zip of a few XML parts. A PDF is a short text document with one font. No libraries.
const enc = new TextEncoder();

const CRC_TABLE = (() => { const table = new Uint32Array(256); for (let n = 0; n < 256; n += 1) { let c = n; for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; table[n] = c >>> 0; } return table; })();
export function crc32(bytes) { let c = 0xffffffff; for (const byte of bytes) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }

// A zip with the files stored, not compressed. Fine for a page of text, and Word opens it.
export function zip(files) {
  const parts = []; const central = []; let offset = 0;
  const u16 = value => { const b = new Uint8Array(2); new DataView(b.buffer).setUint16(0, value, true); return b; };
  const u32 = value => { const b = new Uint8Array(4); new DataView(b.buffer).setUint32(0, value >>> 0, true); return b; };
  const cat = list => { const out = new Uint8Array(list.reduce((n, p) => n + p.length, 0)); let at = 0; for (const p of list) { out.set(p, at); at += p.length; } return out; };
  for (const [name, text] of files) {
    const nameBytes = enc.encode(name); const data = typeof text === 'string' ? enc.encode(text) : text; const crc = crc32(data);
    const local = cat([u32(0x04034b50), u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(crc), u32(data.length), u32(data.length), u16(nameBytes.length), u16(0), nameBytes, data]);
    central.push(cat([u32(0x02014b50), u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(crc), u32(data.length), u32(data.length), u16(nameBytes.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), nameBytes]));
    parts.push(local); offset += local.length;
  }
  const directory = cat(central);
  return cat([...parts, directory, u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(directory.length), u32(offset), u16(0)]);
}

const xml = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[ch]).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');

// Markdown headings (#, ##), bullets (- ) and plain lines become Word paragraphs.
export function docx(markdown) {
  const para = line => {
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) return `<w:p><w:pPr><w:pStyle w:val="Heading${heading[1].length}"/></w:pPr><w:r><w:t xml:space="preserve">${xml(heading[2])}</w:t></w:r></w:p>`;
    const bullet = /^[-*]\s+(.*)$/.exec(line);
    return `<w:p>${bullet ? '<w:pPr><w:ind w:left="360" w:hanging="240"/></w:pPr><w:r><w:t xml:space="preserve">• </w:t></w:r>' : ''}<w:r><w:t xml:space="preserve">${xml(bullet ? bullet[1] : line)}</w:t></w:r></w:p>`;
  };
  const body = String(markdown).split('\n').map(para).join('');
  const styles = ['Heading1', 'Heading2', 'Heading3'].map((id, i) => `<w:style w:type="paragraph" w:styleId="${id}"><w:name w:val="heading ${i + 1}"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="240" w:after="80"/></w:pPr><w:rPr><w:b/><w:sz w:val="${[32, 28, 24][i]}"/></w:rPr></w:style>`).join('');
  return zip([
    ['[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>'],
    ['_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'],
    ['word/_rels/document.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'],
    ['word/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:rPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>${styles}</w:styles>`],
    ['word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`],
  ]);
}

// A simple PDF: Letter pages, Helvetica 11 pt, long lines wrapped. Characters outside Latin-1 are replaced so the text always shows.
export function pdf(text) {
  const clean = String(text).replace(/\r/g, '').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/•/g, '*').replace(/[^\x09\x0a\x20-\x7e\xa0-\xff]/g, '?');
  const maxChars = 88; const linesPerPage = 52; const lines = [];
  for (const raw of clean.split('\n')) {
    let line = raw.replace(/\t/g, '    ');
    if (!line) { lines.push(''); continue; }
    while (line.length > maxChars) { let cut = line.lastIndexOf(' ', maxChars); if (cut < 20) cut = maxChars; lines.push(line.slice(0, cut)); line = line.slice(cut).trimStart(); }
    lines.push(line);
  }
  const pages = []; for (let i = 0; i < lines.length; i += linesPerPage) pages.push(lines.slice(i, i + linesPerPage)); if (!pages.length) pages.push(['']);
  const esc = value => value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const objects = []; // 1 catalog, 2 pages, 3 font, then a page and a content stream per page
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
  const kids = [];
  pages.forEach((pageLines, index) => {
    const pageId = 4 + index * 2; const contentId = pageId + 1; kids.push(`${pageId} 0 R`);
    const stream = `BT /F1 11 Tf 14 TL 72 740 Td ${pageLines.map(line => `(${esc(line)}) Tj T*`).join(' ')} ET`;
    objects[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });
  objects[2] = `<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${pages.length} >>`;
  let out = '%PDF-1.4\n'; const offsets = [];
  for (let id = 1; id < objects.length; id += 1) { offsets[id] = out.length; out += `${id} 0 obj\n${objects[id]}\nendobj\n`; }
  const xref = out.length;
  out += `xref\n0 ${objects.length}\n0000000000 65535 f \n${offsets.slice(1).map(o => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  const bytes = new Uint8Array(out.length); for (let i = 0; i < out.length; i += 1) bytes[i] = out.charCodeAt(i) & 0xff; // Latin-1: one byte per character
  return bytes;
}
