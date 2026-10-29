/** TOAN VUNG GOC V4.7.4 - DRIVE ATTACHMENT API TEST.
 * Deploy as: Me; access: Anyone; use long shared access key as Script Property TVG_UPLOAD_KEY.
 * No file is made public automatically.
 */
const TVG474 = {
  ORIGIN: 'https://robotglass247.github.io',
  ROOT_NAME: 'TOAN_VUNG_GOC_TAI_LIEU_TEST',
  MAX_BYTES: 5 * 1024 * 1024,
  TYPES: { assignment:'BAI_GIAO', result:'BAI_DA_LAM' },
  EXTS: /\.(pdf|doc|docx|xls|xlsx|png|jpg|jpeg|webp|txt)$/i,
  MIMES: {
    pdf:'application/pdf',doc:'application/msword',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls:'application/vnd.ms-excel',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',txt:'text/plain'
  }
};
function setupTVG474() {
  const root = tvgRoot_();
  Logger.log('Thư mục Drive TEST: '+root.getUrl());
  Logger.log('Hãy đặt Script Property TVG_UPLOAD_KEY >= 12 ký tự và triển khai Web App.');
}
function tvgRoot_() {
  const props=PropertiesService.getScriptProperties(), id=props.getProperty('TVG474_ROOT_ID');
  if(id){try{return DriveApp.getFolderById(id)}catch(_){}}
  const folder=DriveApp.createFolder(TVG474.ROOT_NAME);
  props.setProperty('TVG474_ROOT_ID',folder.getId());return folder;
}
function tvgName_(v,max){return String(v||'').replace(/[\\/\r\n\x00-\x1f<>:"|?*]/g,'_').trim().slice(0,max)||'Khong_ten'}
function tvgFolder_(root,name){const i=root.getFoldersByName(name);return i.hasNext()?i.next():root.createFolder(name)}
function tvgAuthorized_(key){const expected=PropertiesService.getScriptProperties().getProperty('TVG_UPLOAD_KEY')||'';return expected.length>=12 && String(key||'')===expected;}
function tvgList_(p){
 const root=tvgRoot_(), k=tvgName_(p.planId,100), it=root.getFoldersByName(k);
 if(!it.hasNext()) return {};
 const folder=it.next(), out={};
 Object.keys(TVG474.TYPES).forEach(type=>{
   const sub=folder.getFoldersByName(TVG474.TYPES[type]);if(!sub.hasNext())return;
   const files=sub.next().getFiles();let best=null;
   while(files.hasNext()) {const f=files.next();if(!best||f.getDateCreated()>best.getDateCreated())best=f;}
   if(best)out[type]={name:best.getName(),url:best.getUrl(),id:best.getId()};
 });return out;
}
function tvgUpload_(p){
 const type=String(p.type||''), planId=String(p.planId||'');
 if(!TVG474.TYPES[type])throw Error('Loại tài liệu không hợp lệ');
 if(!/^[a-zA-Z0-9_-]{4,100}$/.test(planId))throw Error('Mã buổi học không hợp lệ');
 const filename=tvgName_(p.filename,120), ext=(filename.split('.').pop()||'').toLowerCase();
 if(!TVG474.EXTS.test(filename)||!TVG474.MIMES[ext])throw Error('Định dạng tài liệu không được hỗ trợ');
 const encoded=String(p.base64||'');if(!encoded||encoded.length>Math.ceil(TVG474.MAX_BYTES*4/3)+10||!/^[A-Za-z0-9+/=]+$/.test(encoded))throw Error('Tệp không hợp lệ hoặc lớn hơn 5 MB');
 const bytes=Utilities.base64Decode(encoded);if(!bytes.length||bytes.length>TVG474.MAX_BYTES)throw Error('Tệp phải từ 1 byte đến 5 MB');
 const root=tvgRoot_(), lesson=tvgFolder_(root,planId), sub=tvgFolder_(lesson,TVG474.TYPES[type]);
 const f=sub.createFile(Utilities.newBlob(bytes,TVG474.MIMES[ext],filename));
 f.setDescription('Toán Vững Gốc V4.7.4 • '+type+' • '+planId);
 return {name:f.getName(),url:f.getUrl(),id:f.getId()};
}
function tvgResponse_(value){
 // Response is an HTML document in a frame. Its JS only posts a JSON value back to known parent origin.
 const json=JSON.stringify(value).replace(/</g,'\\u003c').replace(/-->/g,'--\\u003e');
 const html='<!doctype html><html><head><meta charset="UTF-8"></head><body><p>Đã xử lý yêu cầu. Bạn có thể trở lại ứng dụng.</p><script>window.parent.postMessage('+json+','+JSON.stringify(TVG474.ORIGIN)+');<\\/script></body></html>';
 return HtmlService.createHtmlOutput(html.replace('<\\/script>','</script>')).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function doPost(e){
 let nonce='';try{
   const p=(e&&e.parameter)||{};nonce=String(p.nonce||'').slice(0,80);
   if(!tvgAuthorized_(p.accessKey))throw Error('Mã truy cập không hợp lệ');
   const action=String(p.action||'');
   let data;
   if(action==='upload')data=tvgUpload_(p);
   else if(action==='list')data=tvgList_(p);
   else throw Error('Hành động không hợp lệ');
   return tvgResponse_({app:'TVG474',nonce,ok:true,action,data});
 }catch(err){return tvgResponse_({app:'TVG474',nonce,ok:false,error:String(err.message||err)})}
}
function doGet(){return HtmlService.createHtmlOutput('<h3>Toán Vững Gốc – Drive API TEST</h3><p>Chỉ xử lý tải tệp có mã truy cập từ ứng dụng đã cấu hình.</p>')}
