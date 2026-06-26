const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' }, maxHttpBufferSize: 10e6 });

const PORT = process.env.PORT || 8080;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || '';

const PAGE = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
<meta name="apple-mobile-web-app-capable" content="yes"/>
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
<meta name="apple-mobile-web-app-title" content="新和联胜"/>
<meta name="theme-color" content="#ffffff"/>
<title>新和联胜</title>
<link rel="manifest" href="/manifest.json"/>
<link rel="apple-touch-icon" href="/icon.png"/>
<script src="/socket.io/socket.io.js"></script>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#fff;--sidebar-bg:#f8f9fa;--border:#e8eaed;--text:#1a1a1a;
  --text-muted:#8a8a8a;--accent-light:#f0f0f0;--hover:#f4f4f4;
  --msg-bg:#f7f7f7;--online:#22c55e;
  --font:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Hiragino Sans GB',sans-serif;
  --safe-top:env(safe-area-inset-top,0px);
  --safe-bottom:env(safe-area-inset-bottom,0px);
}
html,body{height:100%;overflow:hidden;font-family:var(--font);background:var(--bg);color:var(--text);}

/* LOGIN */
#loginScreen{position:fixed;inset:0;background:#fff;display:flex;align-items:center;justify-content:center;z-index:200;padding-top:var(--safe-top);}
.login-box{width:min(320px,90vw);padding:40px 32px;border:1px solid var(--border);border-radius:20px;}
.login-logo{font-size:26px;font-weight:700;margin-bottom:4px;}
.login-sub{font-size:13px;color:var(--text-muted);margin-bottom:32px;}
.lbl{font-size:11px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;color:var(--text-muted);margin-bottom:6px;display:block;}
.inp{width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:16px;font-family:var(--font);outline:none;margin-bottom:10px;background:#fff;color:var(--text);}
.inp:focus{border-color:var(--text);}
.login-btn{width:100%;padding:13px;background:var(--text);color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;margin-top:6px;font-family:var(--font);}
.login-err{color:#ef4444;font-size:12px;margin-top:8px;display:none;}
.pwa-hint{margin-top:20px;padding:10px 14px;background:#f0f7ff;border-radius:10px;font-size:12px;color:#4F46E5;line-height:1.6;display:none;}

/* LAYOUT */
#app{display:flex;height:100vh;height:100dvh;padding-top:var(--safe-top);}

/* SIDEBAR - desktop */
#sidebar{width:220px;min-width:220px;background:var(--sidebar-bg);border-right:1px solid var(--border);display:flex;flex-direction:column;height:100%;}
.sidebar-header{padding:18px 14px 12px;border-bottom:1px solid var(--border);}
.app-name{font-size:16px;font-weight:700;}
.app-desc{font-size:11px;color:var(--text-muted);margin-top:2px;}
.sec-label{font-size:10px;font-weight:600;letter-spacing:.8px;text-transform:uppercase;color:var(--text-muted);padding:14px 14px 5px;}
.room-item{display:flex;align-items:center;gap:7px;padding:7px 10px;margin:0 5px 2px;border-radius:7px;cursor:pointer;font-size:13px;transition:background .1s;user-select:none;}
.room-item:hover{background:var(--hover);}
.room-item.active{background:var(--accent-light);font-weight:600;}
.room-hash{color:var(--text-muted);font-size:15px;}
.room-name{flex:1;}
.room-cnt{font-size:10px;color:var(--text-muted);background:var(--border);border-radius:8px;padding:1px 5px;display:none;}
.room-cnt.show{display:block;}
.online-section{margin-top:auto;border-top:1px solid var(--border);max-height:180px;overflow-y:auto;}
.online-item{display:flex;align-items:center;gap:7px;padding:5px 14px;font-size:12px;}
.av{border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;flex-shrink:0;}
.online-name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.dot-green{width:6px;height:6px;border-radius:50%;background:var(--online);flex-shrink:0;}
.user-box{padding:10px 14px;border-top:1px solid var(--border);display:flex;align-items:center;gap:8px;}
.my-name{font-size:13px;font-weight:600;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}

/* CHAT */
#chatArea{flex:1;display:flex;flex-direction:column;height:100%;min-width:0;}
.chat-header{padding:0 16px;height:52px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px;flex-shrink:0;}
.chat-header-hash{font-size:18px;color:var(--text-muted);}
.chat-header-name{font-size:15px;font-weight:700;}
.online-badge{margin-left:auto;font-size:11px;color:var(--text-muted);display:flex;align-items:center;gap:4px;}
.online-badge-dot{width:6px;height:6px;border-radius:50%;background:var(--online);}

/* MESSAGES */
#messages{flex:1;overflow-y:auto;padding:12px 14px;display:flex;flex-direction:column;gap:1px;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;}
#messages::-webkit-scrollbar{width:3px;}
#messages::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px;}
.msg-group{display:flex;flex-direction:column;margin-top:10px;}
.msg-meta{display:flex;align-items:baseline;gap:7px;margin-bottom:3px;}
.msg-username{font-size:13px;font-weight:700;}
.msg-time{font-size:10px;color:var(--text-muted);}
.msg-bubble{font-size:14.5px;line-height:1.55;color:var(--text);word-break:break-word;white-space:pre-wrap;}
.msg-bubble img{max-width:min(260px,72vw);max-height:260px;border-radius:10px;margin-top:4px;display:block;cursor:pointer;border:1px solid var(--border);object-fit:cover;}
.msg-system{text-align:center;font-size:11px;color:var(--text-muted);padding:6px 0;margin:4px 0;}
.msg-continued .msg-meta{display:none;}
.msg-continued{margin-top:1px;}
.day-div{display:flex;align-items:center;gap:10px;margin:14px 0;font-size:11px;color:var(--text-muted);}
.day-div::before,.day-div::after{content:'';flex:1;height:1px;background:var(--border);}

/* TRANSLATE */
.translate-bar{display:flex;gap:4px;margin-top:6px;opacity:0;transition:opacity .15s;}
.msg-group:hover .translate-bar,.translate-bar.mobile-show{opacity:1;}
.tl-btn{font-size:11px;padding:3px 8px;border:1px solid var(--border);border-radius:10px;cursor:pointer;background:var(--bg);color:var(--text-muted);transition:all .1s;white-space:nowrap;-webkit-tap-highlight-color:transparent;}
.tl-btn:active{background:var(--text);color:#fff;border-color:var(--text);}
.tl-btn.active-lang{background:var(--text);color:#fff;border-color:var(--text);}
.translation-box{margin-top:6px;padding:8px 12px;background:#f0f7ff;border-left:3px solid #4F46E5;border-radius:0 8px 8px 0;font-size:13px;color:#1a1a1a;line-height:1.55;display:none;}
.translation-box.show{display:block;}
.tl-label{font-size:10px;color:#4F46E5;font-weight:600;margin-bottom:3px;letter-spacing:.3px;}

/* VOICE MSG */
.voice-msg{display:flex;align-items:center;gap:10px;background:var(--msg-bg);border-radius:20px;padding:8px 14px;cursor:pointer;user-select:none;max-width:200px;margin-top:4px;border:1px solid var(--border);-webkit-tap-highlight-color:transparent;}
.voice-play-btn{width:32px;height:32px;border-radius:50%;background:var(--text);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.voice-play-btn svg{fill:#fff;width:14px;height:14px;margin-left:2px;}
.voice-wave{flex:1;height:24px;display:flex;align-items:center;gap:2px;}
.voice-wave span{display:inline-block;width:3px;border-radius:2px;background:var(--border);}
.voice-dur{font-size:12px;color:var(--text-muted);white-space:nowrap;}
.voice-msg.playing .voice-play-btn{background:#4F46E5;}
.voice-msg.playing .voice-wave span{background:#4F46E5;}

/* INPUT */
.input-area{padding:8px 12px;border-top:1px solid var(--border);flex-shrink:0;background:var(--bg);padding-bottom:calc(8px + var(--safe-bottom));}
.input-row{display:flex;align-items:flex-end;gap:6px;}
.input-wrap{flex:1;display:flex;align-items:flex-end;gap:4px;background:var(--msg-bg);border:1.5px solid var(--border);border-radius:22px;padding:6px 6px 6px 14px;transition:border-color .15s;}
.input-wrap:focus-within{border-color:#bbb;}
#msgInput{flex:1;border:none;background:transparent;font-size:16px;font-family:var(--font);color:var(--text);outline:none;resize:none;max-height:100px;line-height:1.5;min-height:24px;padding:0;}
#msgInput::placeholder{color:var(--text-muted);}
.icon-btn{background:none;border:none;cursor:pointer;padding:6px;border-radius:50%;color:var(--text-muted);display:flex;align-items:center;justify-content:center;flex-shrink:0;-webkit-tap-highlight-color:transparent;min-width:36px;min-height:36px;}
.icon-btn:active{background:var(--hover);}
.icon-btn svg{width:20px;height:20px;fill:currentColor;}
.send-btn{background:var(--text);color:#fff;border:none;border-radius:50%;width:38px;height:38px;min-width:38px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;-webkit-tap-highlight-color:transparent;}
.send-btn:active{opacity:.7;}
.send-btn svg{width:16px;height:16px;fill:#fff;margin-left:2px;}
#imageInput{display:none;}

/* VOICE RECORD */
#voiceBtn{position:relative;}
#voiceBtn.recording{background:#fee2e2 !important;color:#dc2626 !important;}
.rec-dot{position:absolute;top:4px;right:4px;width:8px;height:8px;border-radius:50%;background:#dc2626;display:none;animation:blink 1s infinite;}
#voiceBtn.recording .rec-dot{display:block;}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}

#voiceOverlay{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:300;display:none;flex-direction:column;align-items:center;justify-content:center;gap:16px;}
#voiceOverlay.show{display:flex;}
.v-timer{color:#fff;font-size:32px;font-weight:700;font-variant-numeric:tabular-nums;}
.v-circle{width:88px;height:88px;border-radius:50%;background:#dc2626;display:flex;align-items:center;justify-content:center;animation:pop 1s infinite;}
.v-circle svg{width:40px;height:40px;fill:#fff;}
@keyframes pop{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
.v-hint{color:rgba(255,255,255,.85);font-size:15px;}
.v-cancel{color:rgba(255,255,255,.6);font-size:13px;cursor:pointer;padding:8px 24px;border:1px solid rgba(255,255,255,.3);border-radius:20px;-webkit-tap-highlight-color:transparent;}

/* LIGHTBOX */
#lightbox{display:none;position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:999;align-items:center;justify-content:center;}
#lightbox.open{display:flex;}
#lightbox img{max-width:95vw;max-height:95vh;border-radius:8px;}

/* MOBILE NAV */
#mobileNav{display:none;border-top:1px solid var(--border);background:var(--bg);flex-shrink:0;padding-bottom:var(--safe-bottom);}
.mobile-rooms{display:flex;overflow-x:auto;padding:7px 10px;gap:6px;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
.mobile-rooms::-webkit-scrollbar{display:none;}
.mrb{white-space:nowrap;padding:6px 14px;border-radius:16px;font-size:13px;font-weight:500;background:var(--msg-bg);border:1px solid var(--border);cursor:pointer;color:var(--text);-webkit-tap-highlight-color:transparent;flex-shrink:0;}
.mrb.active{background:var(--text);color:#fff;border-color:var(--text);}

/* INSTALL BANNER */
#installBanner{display:none;background:#1a1a1a;color:#fff;padding:10px 16px;font-size:13px;align-items:center;gap:10px;flex-shrink:0;}
#installBanner.show{display:flex;}
.install-txt{flex:1;line-height:1.4;}
.install-btn{background:#fff;color:#1a1a1a;border:none;border-radius:8px;padding:6px 14px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;}
.install-close{background:none;border:none;color:rgba(255,255,255,.6);font-size:18px;cursor:pointer;padding:0 4px;}

@media(max-width:639px){
  #sidebar{display:none;}
  #mobileNav{display:block;}
  .translate-bar{opacity:1;}
}
</style>
</head>
<body>

<div id="installBanner">
  <div class="install-txt">📱 添加到主屏幕，像App一样使用！</div>
  <button class="install-btn" id="installBtn">安装</button>
  <button class="install-close" id="installClose">×</button>
</div>

<div id="loginScreen">
  <div class="login-box">
    <div class="login-logo">新和联胜</div>
    <div class="login-sub">私域聊天室</div>
    <label class="lbl">用户名</label>
    <input class="inp" id="usernameInput" placeholder="输入你的名字…" maxlength="20" autocomplete="off"/>
    <label class="lbl">进入频道</label>
    <select class="inp" id="roomSelect" style="cursor:pointer">
      <option value="综合">＃ 综合</option>
      <option value="工作">＃ 工作</option>
      <option value="闲聊">＃ 闲聊</option>
      <option value="图片">＃ 图片</option>
    </select>
    <button class="login-btn" id="joinBtn">进入聊天室</button>
    <div class="login-err" id="loginErr">请输入用户名</div>
  </div>
</div>

<div id="app">
  <div id="sidebar">
    <div class="sidebar-header">
      <div class="app-name">新和联胜</div>
      <div class="app-desc">私域聊天室</div>
    </div>
    <div class="sec-label">频道</div>
    <div id="roomList"></div>
    <div class="online-section">
      <div class="sec-label">在线成员</div>
      <div id="onlineList"></div>
    </div>
    <div class="user-box">
      <div class="av" id="myAvatar" style="width:28px;height:28px;font-size:11px">?</div>
      <div class="my-name" id="myName">—</div>
      <div class="dot-green"></div>
    </div>
  </div>

  <div id="chatArea">
    <div class="chat-header">
      <span class="chat-header-hash">#</span>
      <span id="headerName" style="font-size:15px;font-weight:700;">综合</span>
      <div class="online-badge"><div class="online-badge-dot"></div><span id="onlineCnt">0</span> 在线</div>
    </div>
    <div id="messages"><div class="day-div">今天</div></div>
    <div class="input-area">
      <div class="input-row">
        <div class="input-wrap">
          <textarea id="msgInput" rows="1" placeholder="发消息…"></textarea>
          <input type="file" id="imageInput" accept="image/*"/>
          <button class="icon-btn" id="imageBtn">
            <svg viewBox="0 0 24 24"><path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z"/></svg>
          </button>
          <button class="icon-btn" id="voiceBtn">
            <div class="rec-dot"></div>
            <svg viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zm-1 3a1 1 0 0 1 2 0v8a1 1 0 0 1-2 0V4zm6 8a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.93V21H9v2h6v-2h-2v-2.07A7 7 0 0 0 19 12h-2z"/></svg>
          </button>
        </div>
        <button class="send-btn" id="sendBtn">
          <svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
    <div id="mobileNav"><div class="mobile-rooms" id="mobileRooms"></div></div>
  </div>
</div>

<div id="voiceOverlay">
  <div class="v-timer" id="vTimer">0:00</div>
  <div class="v-circle"><svg viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zm-1 3a1 1 0 0 1 2 0v8a1 1 0 0 1-2 0V4zm6 8a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.93V21H9v2h6v-2h-2v-2.07A7 7 0 0 0 19 12h-2z"/></svg></div>
  <div class="v-hint">松开发送 · 上滑取消</div>
  <div class="v-cancel" id="vCancel">取消</div>
</div>

<div id="lightbox"><img id="lbImg" src="" alt=""/></div>

<script>
const socket = io();
let myUsername='', myColor='', currentRoom='综合';
let lastMsgUser=null, lastMsgTime=null;
let cloudName='', uploadPreset='';
let mediaRecorder=null, audioChunks=[], recTimer=null, recSecs=0, cancelled=false;
let deferredPrompt=null;
let onlineCount=0;

const roomDescs={'综合':'欢迎来到新和联胜！','工作':'工作交流区','闲聊':'随便聊聊','图片':'分享图片和语音'};
const langCodes={'中':'zh-CN','英':'en','日':'ja'};
const langNames={'中':'中文','英':'英文','日':'日文'};

fetch('/config').then(r=>r.json()).then(c=>{cloudName=c.cloudName;uploadPreset=c.uploadPreset;});

// PWA Install
window.addEventListener('beforeinstallprompt', e=>{
  e.preventDefault(); deferredPrompt=e;
  document.getElementById('installBanner').classList.add('show');
});
document.getElementById('installBtn').addEventListener('click',async()=>{
  if(!deferredPrompt)return;
  deferredPrompt.prompt();
  const r=await deferredPrompt.userChoice;
  deferredPrompt=null;
  document.getElementById('installBanner').classList.remove('show');
});
document.getElementById('installClose').addEventListener('click',()=>{
  document.getElementById('installBanner').classList.remove('show');
});
// iOS hint
const isIOS=/iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
const isStandalone=window.navigator.standalone;
if(isIOS&&!isStandalone){
  const b=document.getElementById('installBanner');
  b.querySelector('.install-txt').textContent='📱 点Safari底部分享按钮 → 添加到主屏幕，像App使用！';
  b.querySelector('.install-btn').style.display='none';
  b.classList.add('show');
}

// LOGIN
document.getElementById('usernameInput').focus();
document.getElementById('usernameInput').addEventListener('keydown',e=>{if(e.key==='Enter')doJoin();});
document.getElementById('joinBtn').addEventListener('click',doJoin);
function doJoin(){
  const name=document.getElementById('usernameInput').value.trim();
  if(!name){document.getElementById('loginErr').style.display='block';return;}
  document.getElementById('loginErr').style.display='none';
  currentRoom=document.getElementById('roomSelect').value;
  socket.emit('join',{username:name,room:currentRoom});
}

socket.on('userConfirmed',({username,color})=>{
  myUsername=username; myColor=color;
  document.getElementById('loginScreen').style.display='none';
  document.getElementById('myName').textContent=username;
  const av=document.getElementById('myAvatar');
  av.textContent=username[0].toUpperCase(); av.style.background=color;
  updateRoomUI(currentRoom);
});

// ROOMS
socket.on('roomList',rooms=>{
  const list=document.getElementById('roomList'),mob=document.getElementById('mobileRooms');
  list.innerHTML=''; mob.innerHTML='';
  rooms.forEach(r=>{
    const el=document.createElement('div');
    el.className='room-item'+(r.name===currentRoom?' active':'');
    el.dataset.room=r.name;
    el.innerHTML='<span class="room-hash">#</span><span class="room-name">'+r.name+'</span><span class="room-cnt '+(r.count>0?'show':'')+'" data-cnt="'+r.name+'">'+r.count+'</span>';
    el.addEventListener('click',()=>switchRoom(r.name));
    list.appendChild(el);
    const mb=document.createElement('button');
    mb.className='mrb'+(r.name===currentRoom?' active':'');
    mb.dataset.room=r.name; mb.textContent='# '+r.name;
    mb.addEventListener('click',()=>switchRoom(r.name));
    mob.appendChild(mb);
  });
});

socket.on('roomUserCount',({room,count})=>{
  document.querySelectorAll('[data-cnt="'+room+'"]').forEach(el=>{el.textContent=count;el.classList.toggle('show',count>0);});
});

socket.on('onlineUsers',users=>{
  document.getElementById('onlineCnt').textContent=users.length;
  const list=document.getElementById('onlineList'); list.innerHTML='';
  users.forEach(u=>{
    const el=document.createElement('div'); el.className='online-item';
    el.innerHTML='<div class="av" style="width:22px;height:22px;font-size:9px;background:'+u.color+'">'+u.name[0].toUpperCase()+'</div><span class="online-name">'+u.name+'</span><span style="font-size:10px;color:var(--text-muted)">#'+u.room+'</span><div class="dot-green"></div>';
    list.appendChild(el);
  });
});

function switchRoom(room){
  if(room===currentRoom)return;
  currentRoom=room; socket.emit('switchRoom',{room});
  updateRoomUI(room); clearMsgs();
  document.querySelectorAll('.room-item').forEach(el=>el.classList.toggle('active',el.dataset.room===room));
  document.querySelectorAll('.mrb').forEach(el=>el.classList.toggle('active',el.dataset.room===room));
}
socket.on('switchedRoom',room=>{currentRoom=room;updateRoomUI(room);});

function updateRoomUI(room){
  document.getElementById('headerName').textContent=room;
  document.getElementById('msgInput').placeholder='发消息到 #'+room+'…';
  lastMsgUser=null; lastMsgTime=null;
}
function clearMsgs(){
  document.getElementById('messages').innerHTML='<div class="day-div">今天</div>';
  lastMsgUser=null; lastMsgTime=null;
}

// MESSAGES
socket.on('history',msgs=>{clearMsgs();msgs.forEach(renderMsg);scrollB();});
socket.on('message',msg=>{renderMsg(msg);scrollB();});

function ft(iso){return new Date(iso).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'});}
function sm(a,b){if(!a||!b)return false;const da=new Date(a),db=new Date(b);return da.getHours()===db.getHours()&&da.getMinutes()===db.getMinutes();}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function scrollB(){const m=document.getElementById('messages');m.scrollTop=m.scrollHeight;}

function renderMsg(msg){
  const c=document.getElementById('messages');
  if(msg.type==='system'){
    lastMsgUser=null; lastMsgTime=null;
    const el=document.createElement('div'); el.className='msg-system'; el.textContent=msg.text;
    c.appendChild(el); return;
  }
  const cont=msg.username===lastMsgUser&&sm(msg.timestamp,lastMsgTime);
  lastMsgUser=msg.username; lastMsgTime=msg.timestamp;
  const g=document.createElement('div');
  g.className='msg-group'+(cont?' msg-continued':'');
  const meta=document.createElement('div'); meta.className='msg-meta';
  meta.innerHTML='<span class="msg-username" style="color:'+msg.color+'">'+esc(msg.username)+'</span><span class="msg-time">'+ft(msg.timestamp)+'</span>';
  g.appendChild(meta);
  const b=document.createElement('div'); b.className='msg-bubble';
  if(msg.type==='image'){
    const img=document.createElement('img');
    img.src=msg.url; img.alt='图片'; img.loading='lazy';
    img.addEventListener('click',()=>openLB(msg.url));
    b.appendChild(img);
  } else if(msg.type==='voice'){
    b.appendChild(makeVoice(msg.url,msg.duration||0));
  } else {
    const span=document.createElement('span'); span.textContent=msg.text; b.appendChild(span);
    // translate bar
    const bar=document.createElement('div'); bar.className='translate-bar';
    const boxId='tb'+Date.now()+Math.random().toString(36).slice(2);
    ['中','日','英'].forEach(lang=>{
      const btn=document.createElement('button'); btn.className='tl-btn';
      btn.textContent='🌐 '+lang;
      btn.addEventListener('click',()=>doTranslate(msg.text,lang,boxId,btn));
      bar.appendChild(btn);
    });
    b.appendChild(bar);
    const box=document.createElement('div'); box.className='translation-box'; box.id=boxId;
    b.appendChild(box);
  }
  g.appendChild(b); c.appendChild(g);
}

// TRANSLATE
const tlCache={};
// Detect source language based on character set
function detectLang(text){
  if(/[\\u3040-\\u30ff\\u31f0-\\u31ff]/.test(text)) return 'ja';
  if(/[\\u4e00-\\u9fff]/.test(text)) return 'zh-CN';
  if(/[a-zA-Z]/.test(text)) return 'en';
  return 'zh-CN';
}

async function doTranslate(text, langLabel, boxId, btn){
  const box=document.getElementById(boxId); if(!box)return;
  const targetLang=langCodes[langLabel];

  // Toggle off if same lang already shown
  if(btn.classList.contains('active-lang')){
    box.classList.remove('show'); btn.classList.remove('active-lang'); return;
  }
  btn.closest('.msg-bubble').querySelectorAll('.tl-btn').forEach(b=>b.classList.remove('active-lang'));
  btn.classList.add('active-lang');

  const srcLang=detectLang(text);
  // Don't translate if already in target language
  if(srcLang===targetLang||(srcLang==='zh-CN'&&targetLang==='zh-CN')){
    box.innerHTML='<div class="tl-label">提示</div>已经是'+langNames[langLabel]+'了';
    box.classList.add('show'); return;
  }

  const cacheKey=text+'|'+targetLang;
  if(tlCache[cacheKey]){
    box.innerHTML='<div class="tl-label">'+langNames[langLabel]+'</div>'+esc(tlCache[cacheKey]);
    box.classList.add('show'); return;
  }

  const orig=btn.textContent; btn.textContent='…';
  try{
    const langpair=srcLang+'|'+targetLang;
    const url='https://api.mymemory.translated.net/get?q='+encodeURIComponent(text)+'&langpair='+langpair;
    const r=await fetch(url,{signal:AbortSignal.timeout(8000)});
    const d=await r.json();
    const result=d&&d.responseData&&d.responseData.translatedText;
    if(result&&result!==text&&!result.includes('MYMEMORY WARNING')&&!result.includes('INVALID')){
      tlCache[cacheKey]=result;
      box.innerHTML='<div class="tl-label">'+langNames[langLabel]+'</div>'+esc(result);
      box.classList.add('show');
    } else {
      box.innerHTML='<div class="tl-label">提示</div>翻译失败，请稍后再试';
      box.classList.add('show');
    }
  }catch(e){
    box.innerHTML='<div class="tl-label">提示</div>网络超时，请重试';
    box.classList.add('show');
  }
  btn.textContent=orig;
}

// VOICE MSG UI
function makeVoice(url,dur){
  const bars=[3,5,8,6,10,7,5,9,4,7,6,8,5,4,7];
  const d=document.createElement('div'); d.className='voice-msg';
  const ds=dur>=60?Math.floor(dur/60)+':'+String(dur%60).padStart(2,'0'):dur+'"';
  d.innerHTML='<div class="voice-play-btn"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div><div class="voice-wave">'+bars.map(h=>'<span style="height:'+h+'px"></span>').join('')+'</div><span class="voice-dur">'+ds+'</span>';
  let audio=null;
  d.addEventListener('click',()=>{
    if(!audio)audio=new Audio(url);
    if(audio.paused){audio.play();d.classList.add('playing');audio.onended=()=>d.classList.remove('playing');}
    else{audio.pause();audio.currentTime=0;d.classList.remove('playing');}
  });
  return d;
}

// SEND TEXT
const msgInput=document.getElementById('msgInput');
document.getElementById('sendBtn').addEventListener('click',sendText);
msgInput.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendText();}});
msgInput.addEventListener('input',()=>{msgInput.style.height='auto';msgInput.style.height=Math.min(msgInput.scrollHeight,100)+'px';});
function sendText(){
  const t=msgInput.value.trim(); if(!t||!myUsername)return;
  socket.emit('sendMessage',{text:t,room:currentRoom});
  msgInput.value=''; msgInput.style.height='auto';
}

// IMAGE
document.getElementById('imageBtn').addEventListener('click',()=>document.getElementById('imageInput').click());
document.getElementById('imageInput').addEventListener('change',async()=>{
  const file=document.getElementById('imageInput').files[0]; if(!file)return;
  if(file.size>10*1024*1024){alert('图片太大，最多10MB');return;}
  if(cloudName&&uploadPreset){
    const fd=new FormData(); fd.append('file',file); fd.append('upload_preset',uploadPreset);
    try{
      const r=await fetch('https://api.cloudinary.com/v1_1/'+cloudName+'/image/upload',{method:'POST',body:fd});
      const d=await r.json();
      if(d.secure_url)socket.emit('sendImage',{url:d.secure_url,room:currentRoom});
    }catch(e){alert('上传失败，请重试');}
  } else {
    const reader=new FileReader();
    reader.onload=e=>socket.emit('sendImage',{url:e.target.result,room:currentRoom});
    reader.readAsDataURL(file);
  }
  document.getElementById('imageInput').value='';
});

// VOICE RECORD
const voiceBtn=document.getElementById('voiceBtn');
const vOverlay=document.getElementById('voiceOverlay');
const vTimer=document.getElementById('vTimer');

function startRec(){
  if(!navigator.mediaDevices){alert('浏览器不支持录音');return;}
  navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
    cancelled=false; audioChunks=[]; recSecs=0;
    mediaRecorder=new MediaRecorder(stream);
    mediaRecorder.ondataavailable=e=>{if(e.data.size>0)audioChunks.push(e.data);};
    mediaRecorder.onstop=()=>{
      stream.getTracks().forEach(t=>t.stop());
      if(!cancelled&&audioChunks.length>0)uploadVoice(new Blob(audioChunks,{type:'audio/webm'}),recSecs);
    };
    mediaRecorder.start();
    voiceBtn.classList.add('recording'); vOverlay.classList.add('show');
    recTimer=setInterval(()=>{
      recSecs++;
      vTimer.textContent=Math.floor(recSecs/60)+':'+String(recSecs%60).padStart(2,'0');
      if(recSecs>=120)stopRec(false);
    },1000);
  }).catch(()=>alert('无法访问麦克风，请检查权限设置'));
}

function stopRec(cancel=false){
  cancelled=cancel; clearInterval(recTimer);
  voiceBtn.classList.remove('recording'); vOverlay.classList.remove('show');
  vTimer.textContent='0:00';
  if(mediaRecorder&&mediaRecorder.state!=='inactive')mediaRecorder.stop();
}

async function uploadVoice(blob,duration){
  if(cloudName&&uploadPreset){
    const fd=new FormData(); fd.append('file',blob,'voice.webm'); fd.append('upload_preset',uploadPreset); fd.append('resource_type','video');
    try{
      const r=await fetch('https://api.cloudinary.com/v1_1/'+cloudName+'/video/upload',{method:'POST',body:fd});
      const d=await r.json();
      if(d.secure_url)socket.emit('sendVoice',{url:d.secure_url,duration,room:currentRoom});
    }catch(e){alert('语音上传失败');}
  } else {
    const reader=new FileReader();
    reader.onload=e=>socket.emit('sendVoice',{url:e.target.result,duration,room:currentRoom});
    reader.readAsDataURL(blob);
  }
}

let holdTimer=null;
voiceBtn.addEventListener('mousedown',()=>{holdTimer=setTimeout(startRec,150);});
voiceBtn.addEventListener('mouseup',()=>{clearTimeout(holdTimer);if(mediaRecorder&&mediaRecorder.state!=='inactive')stopRec(false);});
voiceBtn.addEventListener('mouseleave',()=>clearTimeout(holdTimer));
voiceBtn.addEventListener('touchstart',e=>{e.preventDefault();holdTimer=setTimeout(startRec,150);},{passive:false});
voiceBtn.addEventListener('touchend',e=>{e.preventDefault();clearTimeout(holdTimer);if(mediaRecorder&&mediaRecorder.state!=='inactive')stopRec(false);});
document.getElementById('vCancel').addEventListener('click',()=>stopRec(true));

// LIGHTBOX
function openLB(src){document.getElementById('lbImg').src=src;document.getElementById('lightbox').classList.add('open');}
document.getElementById('lightbox').addEventListener('click',()=>document.getElementById('lightbox').classList.remove('open'));

// SW registration for PWA
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('/sw.js').catch(()=>{});
}
</script>
</body>
</html>
`;

const MANIFEST = "{\"name\": \"\u65b0\u548c\u8054\u80dc\", \"short_name\": \"\u65b0\u548c\u8054\u80dc\", \"description\": \"\u79c1\u57df\u804a\u5929\u5ba4\", \"start_url\": \"/\", \"display\": \"standalone\", \"background_color\": \"#ffffff\", \"theme_color\": \"#1a1a1a\", \"orientation\": \"portrait\", \"icons\": [{\"src\": \"/icon.png\", \"sizes\": \"192x192\", \"type\": \"image/png\"}, {\"src\": \"/icon.png\", \"sizes\": \"512x512\", \"type\": \"image/png\"}]}";

const SW = 'const CACHE="xlsv2";self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll([" /"]))));self.addEventListener("fetch",e=>{if(e.request.url.includes("/socket.io/"))return;e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));});';

const ICON_B64 = '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';

app.get('/', (req, res) => res.send(PAGE));
app.get('/manifest.json', (req, res) => { res.setHeader('Content-Type','application/manifest+json'); res.send(MANIFEST); });
app.get('/sw.js', (req, res) => { res.setHeader('Content-Type','application/javascript'); res.send(SW); });
app.get('/icon.png', (req, res) => { const buf = Buffer.from(ICON_B64, 'base64'); res.setHeader('Content-Type','image/png'); res.send(buf); });
app.get('/config', (req, res) => res.json({ cloudName: CLOUDINARY_CLOUD_NAME, uploadPreset: CLOUDINARY_UPLOAD_PRESET }));

const rooms = {
  '\u7efc\u5408': { messages: [], description: '\u6b22\u8fce\u6765\u5230\u65b0\u548c\u8054\u80dc\uff01' },
  '\u5de5\u4f5c': { messages: [], description: '\u5de5\u4f5c\u4ea4\u6d41\u533a' },
  '\u95f2\u804a': { messages: [], description: '\u968f\u4fbf\u804a\u804a' },
  '\u56fe\u7247': { messages: [], description: '\u5206\u4eab\u56fe\u7247\u548c\u8bed\u97f3' },
};
const onlineUsers = new Map();
const userColors = ['#4F46E5','#0891B2','#059669','#D97706','#DC2626','#7C3AED','#DB2777','#0284C7'];
let colorIndex = 0;
function getRoomUsers(room){const u=[];onlineUsers.forEach((v,k)=>{if(v.room===room)u.push({name:k,color:v.color});});return u;}
function getAllUsers(){const u=[];onlineUsers.forEach((v,k)=>u.push({name:k,color:v.color,room:v.room}));return u;}
io.on('connection', (socket) => {
  let me=null, myRoom=null;
  socket.on('join', ({username,room}) => {
    if(!username||!room||!rooms[room])return;
    if(onlineUsers.has(username)&&onlineUsers.get(username).socketId!==socket.id)
      username=username+'_'+Math.floor(Math.random()*100);
    me=username; myRoom=room;
    const color=userColors[colorIndex++%userColors.length];
    onlineUsers.set(me,{socketId:socket.id,room,color});
    socket.join(room);
    socket.emit('history',rooms[room].messages.slice(-100));
    socket.emit('roomList',Object.keys(rooms).map(r=>({name:r,description:rooms[r].description,count:getRoomUsers(r).length})));
    socket.emit('userConfirmed',{username:me,color});
    io.emit('onlineUsers',getAllUsers());
    const sys={id:Date.now(),type:'system',text:me+'\u52a0\u5165\u4e86\u9891\u9053',timestamp:new Date().toISOString(),room};
    rooms[room].messages.push(sys); io.to(room).emit('message',sys);
    io.emit('roomUserCount',{room,count:getRoomUsers(room).length});
  });
  socket.on('switchRoom',({room})=>{
    if(!rooms[room]||!me)return;
    const old=myRoom; socket.leave(old);
    const u=onlineUsers.get(me); if(u){u.room=room;onlineUsers.set(me,u);}
    myRoom=room; socket.join(room);
    socket.emit('history',rooms[room].messages.slice(-100));
    socket.emit('switchedRoom',room);
    io.emit('onlineUsers',getAllUsers());
    io.emit('roomUserCount',{room:old,count:getRoomUsers(old).length});
    io.emit('roomUserCount',{room,count:getRoomUsers(room).length});
  });
  socket.on('sendMessage',({text,room})=>{
    if(!me||!text||!text.trim()||!rooms[room])return;
    const msg={id:Date.now()+Math.random(),type:'text',username:me,color:(onlineUsers.get(me)||{}).color||'#333',text:text.trim().slice(0,2000),timestamp:new Date().toISOString(),room};
    rooms[room].messages.push(msg);if(rooms[room].messages.length>500)rooms[room].messages.shift();
    io.to(room).emit('message',msg);
  });
  socket.on('sendImage',({url,room})=>{
    if(!me||!url||!rooms[room])return;
    const msg={id:Date.now()+Math.random(),type:'image',username:me,color:(onlineUsers.get(me)||{}).color||'#333',url,timestamp:new Date().toISOString(),room};
    rooms[room].messages.push(msg);if(rooms[room].messages.length>500)rooms[room].messages.shift();
    io.to(room).emit('message',msg);
  });
  socket.on('sendVoice',({url,duration,room})=>{
    if(!me||!url||!rooms[room])return;
    const msg={id:Date.now()+Math.random(),type:'voice',username:me,color:(onlineUsers.get(me)||{}).color||'#333',url,duration,timestamp:new Date().toISOString(),room};
    rooms[room].messages.push(msg);if(rooms[room].messages.length>500)rooms[room].messages.shift();
    io.to(room).emit('message',msg);
  });
  socket.on('disconnect',()=>{
    if(!me)return;
    onlineUsers.delete(me);
    if(myRoom&&rooms[myRoom]){
      const sys={id:Date.now(),type:'system',text:me+'\u79bb\u5f00\u4e86\u9891\u9053',timestamp:new Date().toISOString(),room:myRoom};
      rooms[myRoom].messages.push(sys); io.to(myRoom).emit('message',sys);
    }
    io.emit('onlineUsers',getAllUsers());
    if(myRoom)io.emit('roomUserCount',{room:myRoom,count:getRoomUsers(myRoom).length});
  });
});
server.listen(PORT,()=>console.log('\u65b0\u548c\u8054\u80dc running on port '+PORT));
