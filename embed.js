// Discord Embed Generator 用JavaScript

// フィールド（複数行テキスト入力）管理
const fieldsArea = document.getElementById('fieldsArea');
const fieldCountSpan = document.getElementById('fieldCountSpan');
let fieldCount = 3;

// 単一フィールドHTMLを生成
function makeField(i, name='', value='', inline=false) {
  return `
  <div class="field-row" data-index="${i}">
    <input type="text" placeholder="フィールド名" value="${name.replace(/"/g,'&quot;')}" id="fieldName${i}">
    <input type="text" placeholder="値" value="${value.replace(/"/g,'&quot;')}" id="fieldValue${i}">
    <label>
      <input type="checkbox" id="fieldInline${i}" ${inline?'checked':''}> インライン
    </label>
    <button type="button" class="remove-field-btn" onclick="removeFieldByIndex(${i})" title="このフィールドを削除">✖</button>
  </div>`;
}

// フィールド追加
function addField() {
  fieldCount++;
  fieldsArea.insertAdjacentHTML('beforeend', makeField(fieldCount));
  fieldCountSpan.textContent = fieldCount;
  updatePreview();
}

// フィールド末尾削除
function removeField() {
  if(fieldCount>0){
    fieldsArea.removeChild(fieldsArea.lastElementChild);
    fieldCount--;
    fieldCountSpan.textContent = fieldCount;
    updatePreview();
  }
}

// 任意インデックスのフィールド削除
function removeFieldByIndex(idx) {
  const row = fieldsArea.querySelector('.field-row[data-index="'+idx+'"]');
  if(row){
    row.remove();
    fieldCount--;
    fieldCountSpan.textContent = fieldCount;
    updatePreview();
  }
}

// 初期フィールド表示
function initFields() {
  fieldsArea.innerHTML = 
    makeField(1, 'フィールド1', 'フィールド1の値', true) +
    makeField(2, 'フィールド2', 'フィールド2の値', true) +
    makeField(3, 'フィールド3', 'フィールド3の値（インラインでない）', false);
  fieldCountSpan.textContent = 3;
}
initFields();

// 入力イベントでプレビュー更新
document.querySelectorAll('.form-area input, .form-area textarea').forEach(el=>{
  el.addEventListener('input', updatePreview);
});
fieldsArea.addEventListener('input', updatePreview);

// --- Embedカラー連動ロジック ---
const colorPicker = document.getElementById('embedColorPicker');
const colorNum = document.getElementById('embedColor');
const colorHex = document.getElementById('embedColorHex');

// 10進→16進/カラーピッカー 連動
colorNum.addEventListener('input',()=>{
  let val = parseInt(colorNum.value,10);
  if(isNaN(val) || val<0) val=0;
  if(val>16777215) val=16777215;
  let hex = '#' + val.toString(16).padStart(6,'0');
  colorHex.value = hex;
  colorPicker.value = hex;
  updatePreview();
});
// 16進→10進/カラーピッカー 連動
colorHex.addEventListener('input',()=>{
  let hex = colorHex.value;
  if(!/^#[0-9a-fA-F]{6}$/.test(hex)) return;
  let num = parseInt(hex.slice(1),16);
  colorNum.value = num;
  colorPicker.value = hex;
  updatePreview();
});
// カラーピッカー→10進/16進 連動
colorPicker.addEventListener('input',()=>{
  let hex = colorPicker.value;
  colorHex.value = hex;
  colorNum.value = parseInt(hex.slice(1),16);
  updatePreview();
});

// --- Embed日時カレンダー・時刻選択連動 ---
const embedDate = document.getElementById('embedDate');
const embedTime = document.getElementById('embedTime');
const embedTimestamp = document.getElementById('embedTimestamp');

// 日付・時刻 → ISO8601
function dateTimeToISO() {
  if (!embedDate.value && !embedTime.value) return '';
  let date = embedDate.value ? embedDate.value : '1970-01-01';
  let time = embedTime.value ? embedTime.value : '00:00:00';
  // time may be "HH:MM" or "HH:MM:SS"
  if (time.length === 5) time += ':00';
  // Assume local time and convert to UTC
  let dtLocal = new Date(date + 'T' + time);
  if (isNaN(dtLocal)) return '';
  return dtLocal.toISOString();
}
// ISO8601 → 日付・時刻
function isoToDateTime(iso) {
  if (!iso) return {date: '', time: ''};
  try {
    let dt = new Date(iso);
    if (isNaN(dt)) return {date: '', time: ''};
    // Get date in YYYY-MM-DD, time in HH:MM:SS (local time)
    let local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000);
    let y = local.getFullYear();
    let m = (local.getMonth()+1).toString().padStart(2,'0');
    let d = local.getDate().toString().padStart(2,'0');
    let date = `${y}-${m}-${d}`;
    let hh = local.getHours().toString().padStart(2,'0');
    let mm = local.getMinutes().toString().padStart(2,'0');
    let ss = local.getSeconds().toString().padStart(2,'0');
    let time = `${hh}:${mm}:${ss}`;
    return {date, time};
  } catch { return {date: '', time: ''}; }
}

// 日付・時刻入力 → テキスト
embedDate.addEventListener('input', ()=>{
  embedTimestamp.value = dateTimeToISO();
  updatePreview();
});
embedTime.addEventListener('input', ()=>{
  embedTimestamp.value = dateTimeToISO();
  updatePreview();
});
// テキスト → 日付・時刻
embedTimestamp.addEventListener('input', ()=>{
  const {date, time} = isoToDateTime(embedTimestamp.value);
  embedDate.value = date || '';
  embedTime.value = time || '';
  updatePreview();
});

// 初期値セット
(function setInitialDateTime(){
  // 既定値
  const def = embedTimestamp.value || "2025-05-31T01:49:27Z";
  if(def){
    const {date, time} = isoToDateTime(def);
    if(date) embedDate.value = date;
    if(time) embedTime.value = time;
    embedTimestamp.value = def;
  }
})();

// 簡易Markdownパーサ（太字・リンク変換）
function parseMarkdown(text) {
  let html = text
    .replace(/</g, '&lt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/\n/g, '<br>');
  return html;
}

// Embed用のJSONデータを生成
function buildEmbedJson() {
  const username = document.getElementById('botName').value || undefined;
  const avatar_url = document.getElementById('avatarUrl').value || undefined;
  const content = document.getElementById('msgContent').value || undefined;
  const title = document.getElementById('embedTitle').value || undefined;
  const url = document.getElementById('embedUrl').value || undefined;
  const description = document.getElementById('embedDescription').value || undefined;
  const color = Number(document.getElementById('embedColor').value) || undefined;
  const timestamp = document.getElementById('embedTimestamp').value || undefined;
  const thumbnail_url = document.getElementById('embedThumbnail').value || undefined;
  const image_url = document.getElementById('embedImage').value || undefined;
  const author_name = document.getElementById('embedAuthorName').value || undefined;
  const author_url = document.getElementById('embedAuthorUrl').value || undefined;
  const author_icon_url = document.getElementById('embedAuthorIcon').value || undefined;
  const footer_text = document.getElementById('embedFooterText').value || undefined;
  const footer_icon_url = document.getElementById('embedFooterIcon').value || undefined;

  // フィールド情報収集
  let fields = [];
  fieldsArea.querySelectorAll('.field-row').forEach((row, idx)=>{
    const i = row.getAttribute('data-index');
    const name = document.getElementById('fieldName'+i)?.value;
    const value = document.getElementById('fieldValue'+i)?.value;
    const inline = document.getElementById('fieldInline'+i)?.checked;
    if(name && value) fields.push({name, value, inline});
  });

  // Embed構築
  let embed = {};
  if(title) embed.title = title;
  if(description) embed.description = description;
  if(url) embed.url = url;
  if(typeof color === "number" && !isNaN(color)) embed.color = color;
  if(timestamp) embed.timestamp = timestamp;
  if(fields.length > 0) embed.fields = fields;
  if(thumbnail_url) embed.thumbnail = { url: thumbnail_url };
  if(image_url) embed.image = { url: image_url };
  if(author_name || author_url || author_icon_url) {
    embed.author = {};
    if(author_name) embed.author.name = author_name;
    if(author_url) embed.author.url = author_url;
    if(author_icon_url) embed.author.icon_url = author_icon_url;
  }
  if(footer_text || footer_icon_url) {
    embed.footer = {};
    if(footer_text) embed.footer.text = footer_text;
    if(footer_icon_url) embed.footer.icon_url = footer_icon_url;
  }

  // 全体構造
  const out = {};
  if(content) out.content = content;
  if(username) out.username = username;
  if(avatar_url) out.avatar_url = avatar_url;
  out.tts = false;
  out.embeds = [embed];
  return out;
}

// JSONコピー機能
function copyJson() {
  const out = buildEmbedJson();
  const text = JSON.stringify(out, null, 2);
  navigator.clipboard.writeText(text).then(()=>{
    const btn = document.querySelector('.json-copy-btn');
    btn.textContent = "コピーしました";
    setTimeout(()=>{ btn.textContent = "コピー"; }, 1200);
  });
}

// プレビューを描画・更新
function updatePreview() {
  // 各値を取得
  const botName = document.getElementById('botName').value || 'EmbedテストBot';
  const avatarUrl = document.getElementById('avatarUrl').value || 'https://cdn.discordapp.com/embed/avatars/0.png';
  const msgContent = document.getElementById('msgContent').value || '';
  const embedTitle = document.getElementById('embedTitle').value;
  const embedUrl = document.getElementById('embedUrl').value;
  const embedDescription = document.getElementById('embedDescription').value;
  const embedColor = colorNum.value;
  const embedTimestamp = document.getElementById('embedTimestamp').value;
  const embedThumbnail = document.getElementById('embedThumbnail').value;
  const embedImage = document.getElementById('embedImage').value;
  const embedAuthorName = document.getElementById('embedAuthorName').value;
  const embedAuthorUrl = document.getElementById('embedAuthorUrl').value;
  const embedAuthorIcon = document.getElementById('embedAuthorIcon').value;
  const embedFooterText = document.getElementById('embedFooterText').value;
  const embedFooterIcon = document.getElementById('embedFooterIcon').value;

  // フィールド情報収集
  let fields = [];
  fieldsArea.querySelectorAll('.field-row').forEach((row, idx)=>{
    const i = row.getAttribute('data-index');
    const name = document.getElementById('fieldName'+i)?.value;
    const value = document.getElementById('fieldValue'+i)?.value;
    const inline = document.getElementById('fieldInline'+i)?.checked;
    if(name && value) fields.push({name, value, inline});
  });

  // 時刻表示
  let timeString = '';
  if(embedTimestamp) {
    try {
      const dt = new Date(embedTimestamp);
      if(!isNaN(dt)) {
        const hh = dt.getHours().toString().padStart(2,'0');
        const mm = dt.getMinutes().toString().padStart(2,'0');
        timeString = `・${dt.getFullYear()}-${(dt.getMonth()+1)}-${dt.getDate()} ${hh}:${mm}`;
      }
    } catch{}
  }

  // プレビューHTML生成
  let html = `
  <div class="discord-message">
    <img class="discord-avatar" src="${avatarUrl}" alt="${botName}">
    <div class="discord-main">
      <div class="discord-header">
        <span class="discord-username">${botName}</span>
        <span class="discord-bot">アプリ</span>
        <span class="discord-time">今</span>
      </div>
      <div class="discord-content">${msgContent?parseMarkdown(msgContent):''}</div>
      <div class="discord-embed" style="border-left-color: #${(Number(embedColor).toString(16).padStart(6,'0'))};">
        <div class="discord-embed-main">
          ${(embedAuthorName||embedAuthorIcon||embedAuthorUrl) ? `
          <div class="discord-embed-author">
            ${embedAuthorIcon?`<img src="${embedAuthorIcon}" alt="${embedAuthorName||''}">`:''}
            ${embedAuthorUrl?`<a href="${embedAuthorUrl}" target="_blank" style="color:#00b0f4;">${embedAuthorName||''}</a>`:embedAuthorName||''}
          </div>`:''}
          ${embedTitle?`
          <div class="discord-embed-title">
            ${embedUrl?`<a href="${embedUrl}" target="_blank" style="color:#00b0f4;">${embedTitle}</a>`:embedTitle}
          </div>`:''}
          ${embedDescription?`
          <div class="discord-embed-description">${parseMarkdown(embedDescription)}</div>
          `:''}
          ${fields.length>0?`
          <div class="discord-embed-fields">
            ${fields.map(f=>`
              <div class="discord-embed-field${f.inline?'':' full'}">
                <div class="discord-embed-field-name">${f.name}</div>
                <div class="discord-embed-field-value">${parseMarkdown(f.value)}</div>
              </div>
            `).join('')}
          </div>
          `:''}
          ${embedImage?`
          <img class="discord-embed-image" src="${embedImage}" alt="">
          `:''}
          ${(embedFooterText||embedFooterIcon||embedTimestamp)?`
          <div class="discord-embed-footer">
            ${embedFooterIcon?`<img src="${embedFooterIcon}" alt="footer">`:''}
            <span>${embedFooterText||''}${timeString}</span>
          </div>
          `:''}
        </div>
        ${embedThumbnail?`<img class="discord-embed-thumb" src="${embedThumbnail}" alt="">`:''}
      </div>
    </div>
  </div>
  `;
  document.getElementById('preview').innerHTML = html;

  // JSON出力
  const json = buildEmbedJson();
  document.getElementById('jsonOutput').textContent = JSON.stringify(json, null, 2);
}
updatePreview();
