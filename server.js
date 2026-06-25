const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  maxHttpBufferSize: 10e6
});

const PORT = process.env.PORT || 8080;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET || '';

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
<meta name="apple-mobile-web-app-capable" content="yes"/>
<meta name="apple-mobile-web-app-status-bar-style" content="default"/>
<title>新和联胜</title>
<script src="/socket.io/socket.io.js"></script>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#fff;
  --sidebar-bg:#f8f9fa;
  --border:#e8eaed;
  --text:#1a1a1a;
  --text-muted:#8a8a8a;
  --accent-light:#f0f0f0;
  --hover:#f4f4f4;
  --msg-bg:#f7f7f7;
  --online:#22c55e;
  --font:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Hiragino Sans GB',sans-serif;
}
html,body{height:100%;overflow:hidden;font-family:var(--font);background:var(--bg);color:var(--text);}

/* ── LOGIN ── */
#loginScreen{position:fixed;inset:0;background:#fff;display:flex;align-items:center;justify-content:center;z-index:200;}
.login-box{width:320px;padding:40px 32px;border:1px solid var(--border);border-radius:20px;}
.login-logo{font-size:26px;font-weight:700;margin-bottom:4px;}
.login-sub{font-size:13px;color:var(--text-muted);margin-bottom:32px;}
.lbl{font-size:11px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;color:var(--text-muted);margin-bottom:6px;display:block;}
.inp{width:100%;padding:11px 14px;border:1.5px solid var(--border);border-radius:10px;font-size:15px;font-family:var(--font);outline:none;margin-bottom:10px;background:#fff;color:var(--text);}
.inp:focus{border-color:var(--text);}
.login-btn{width:100%;padding:12px;background:var(--text);color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;margin-top:6px;font-family:var(--font);}
.login-err{color:#ef4444;font-size:12px;margin-top:8px;display:none;}

/* ── LAYOUT ── */
#app{display:flex;height:100vh;height:100dvh;}

/* SIDEBAR — desktop only */
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

/* CHAT AREA */
#chatArea{flex:1;display:flex;flex-direction:column;height:100%;min-width:0;position:relative;}
.chat-header{padding:0 20px;height:52px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px;flex-shrink:0;}
.chat-header-hash{font-size:18px;color:var(--text-muted);}
.chat-header-name{font-size:15px;font-weight:700;}
.chat-header-desc{font-size:12px;color:var(--text-muted);margin-left:4px;border-left:1.5px solid var(--border);padding-left:10px;display:none;}
@media(min-width:640px){.chat-header-desc{display:block;}}

/* MESSAGES */
#messages{flex:1;overflow-y:auto;padding:12px 16px;display:flex;flex-direction:column;gap:1px;-webkit-overflow-scrolling:touch;}
#messages::-webkit-scrollbar{width:3px;}
#messages::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px;}
.msg-group{display:flex;flex-direction:column;margin-top:10px;}
.msg-meta{display:flex;align-items:baseline;gap:7px;margin-bottom:3px;}
.msg-username{font-size:13px;font-weight:700;}
.msg-time{font-size:10px;color:var(--text-muted);}
.msg-bubble{font-size:14px;line-height:1.55;color:var(--text);word-break:break-word;white-space:pre-wrap;max-width:640px;}
.msg-bubble img{max-width:min(280px,70vw);max-height:280px;border-radius:10px;margin-top:4px;display:block;cursor:pointer;border:1px solid var(--border);object-fit:cover;}
.msg-system{text-align:center;font-size:11px;color:var(--text-muted);padding:6px 0;margin:4px 0;}
.msg-continued .msg-meta{display:none;}
.msg-continued{margin-top:1px;}
.day-div{display:flex;align-items:center;gap:10px;margin:14px 0;font-size:11px;color:var(--text-muted);}
.day-div::before,.day-div::after{content:'';flex:1;height:1px;background:var(--border);}

/* VOICE MESSAGE */
.voice-msg{display:flex;align-items:center;gap:10px;background:var(--msg-bg);border-radius:20px;padding:8px 14px;cursor:pointer;user-select:none;max-width:200px;margin-top:4px;border:1px solid var(--border);}
.voice-play-btn{width:32px;height:32px;border-radius:50%;background:var(--text);display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.voice-play-btn svg{fill:#fff;width:14px;height:14px;margin-left:2px;}
.voice-wave{flex:1;height:24px;display:flex;align-items:center;gap:2px;}
.voice-wave span{display:inline-block;width:3px;border-radius:2px;background:var(--border);}
.voice-dur{font-size:12px;color:var(--text-muted);white-space:nowrap;}
.voice-msg.playing .voice-play-btn{background:#4F46E5;}
.voice-msg.playing .voice-wave span{background:#4F46E5;}

/* INPUT AREA */
.input-area{padding:8px 12px 8px;border-top:1px solid var(--border);flex-shrink:0;background:var(--bg);}
/* extra padding for mobile home indicator */
@supports(padding-bottom:env(safe-area-inset-bottom)){
  .input-area{padding-bottom:calc(8px + env(safe-area-inset-bottom));}
}
.input-row{display:flex;align-items:flex-end;gap:6px;}
.input-wrap{flex:1;display:flex;align-items:flex-end;gap:6px;background:var(--msg-bg);border:1.5px solid var(--border);border-radius:22px;padding:6px 6px 6px 14px;transition:border-color .15s;}
.input-wrap:focus-within{border-color:#aaa;}
#msgInput{flex:1;border:none;background:transparent;font-size:14px;font-family:var(--font);color:var(--text);outline:none;resize:none;max-height:100px;line-height:1.5;min-height:22px;padding:2px 0;}
#msgInput::placeholder{color:var(--text-muted);}
.icon-btn{background:none;border:none;cursor:pointer;padding:5px;border-radius:50%;color:var(--text-muted);display:flex;align-items:center;justify-content:center;transition:background .1s;flex-shrink:0;-webkit-tap-highlight-color:transparent;}
.icon-btn:hover,.icon-btn:active{background:var(--hover);color:var(--text);}
.icon-btn svg{width:20px;height:20px;fill:currentColor;}
.send-btn{background:var(--text);color:#fff;border:none;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:opacity .15s;-webkit-tap-highlight-color:transparent;}
.send-btn:active{opacity:.8;}
.send-btn svg{width:16px;height:16px;fill:#fff;margin-left:2px;}
#imageInput{display:none;}

/* VOICE RECORD BUTTON */
#voiceBtn{position:relative;}
#voiceBtn.recording{background:#fee2e2 !important;color:#dc2626 !important;}
.rec-indicator{position:absolute;top:-3px;right:-3px;width:9px;height:9px;border-radius:50%;background:#dc2626;display:none;animation:pulse 1s infinite;}
#voiceBtn.recording .rec-indicator{display:block;}
@keyframes pulse{0%,100%{opacity:1;}50%{opacity:.4;}}

/* VOICE RECORDING OVERLAY */
#voiceOverlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:300;display:none;flex-direction:column;align-items:center;justify-content:center;gap:20px;}
#voiceOverlay.show{display:flex;}
.voice-circle{width:80px;height:80px;border-radius:50%;background:#dc2626;display:flex;align-items:center;justify-content:center;animation:pulse-big 1s infinite;}
.voice-circle svg{width:36px;height:36px;fill:#fff;}
@keyframes pulse-big{0%,100%{transform:scale(1);}50%{transform:scale(1.1);}}
.voice-hint{color:#fff;font-size:15px;}
.voice-timer{color:#fff;font-size:28px;font-weight:700;font-variant-numeric:tabular-nums;}
.voice-cancel{color:rgba(255,255,255,.7);font-size:13px;cursor:pointer;padding:8px 20px;border:1px solid rgba(255,255,255,.3);border-radius:20px;margin-top:8px;}

/* LIGHTBOX */
#lightbox{display:none;position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:999;align-items:center;justify-content:center;cursor:zoom-out;}
#lightbox.open{display:flex;}
#lightbox img{max-width:95vw;max-height:95vh;border-radius:8px;}

/* MOBILE BOTTOM NAV */
#mobileNav{display:none;border-top:1px solid var(--border);background:var(--bg);flex-shrink:0;}
@supports(padding-bottom:env(safe-area-inset-bottom)){
  #mobileNav{padding-bottom:env(safe-area-inset-bottom);}
}
.mobile-rooms{display:flex;overflow-x:auto;padding:6px 8px;gap:6px;-webkit-overflow-scrolling:touch;scrollbar-width:none;}
.mobile-rooms::-webkit-scrollbar{display:none;}
.mobile-room-btn{white-space:nowrap;padding:5px 14px;border-radius:16px;font-size:13px;font-weight:500;background:var(--msg-bg);border:1px solid var(--border);cursor:pointer;color:var(--text);transition:background .1s;-webkit-tap-highlight-color:transparent;flex-shrink:0;}
.mobile-room-btn.active{background:var(--text);color:#fff;border-color:var(--text);}

/* RESPONSIVE */
@media(max-width:639px){
  #sidebar{display:none;}
  #mobileNav{display:block;}
  .chat-header{padding:0 14px;height:48px;}
}
</style>
</head>
<body>

<!-- LOGIN -->
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

<!-- APP -->
<div id="app">
  <!-- SIDEBAR -->
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

  <!-- CHAT -->
  <div id="chatArea">
    <div class="chat-header">
      <span class="chat-header-hash">#</span>
      <span class="chat-header-name" id="headerName">综合</span>
      <span class="chat-header-desc" id="headerDesc">欢迎来到新和联胜！</span>
    </div>

    <div id="messages">
      <div class="day-div">今天</div>
    </div>

    <div class="input-area">
      <div class="input-row">
        <div class="input-wrap">
          <textarea id="msgInput" rows="1" placeholder="发消息…"></textarea>
          <input type="file" id="imageInput" accept="image/*"/>
          <button class="icon-btn" id="imageBtn" title="发图片">
            <svg viewBox="0 0 24 24"><path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z"/></svg>
          </button>
          <button class="icon-btn" id="voiceBtn" title="按住录音">
            <div class="rec-indicator"></div>
            <svg viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zm-1 3a1 1 0 0 1 2 0v8a1 1 0 0 1-2 0V4zm6 8a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.93V21H9v2h6v-2h-2v-2.07A7 7 0 0 0 19 12h-2z"/></svg>
          </button>
        </div>
        <button class="send-btn" id="sendBtn">
          <svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>

    <!-- MOBILE NAV -->
    <div id="mobileNav">
      <div class="mobile-rooms" id="mobileRooms"></div>
    </div>
  </div>
</div>

<!-- VOICE OVERLAY -->
<div id="voiceOverlay">
  <div class="voice-timer" id="voiceTimer">0:00</div>
  <div class="voice-circle">
    <svg viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zm-1 3a1 1 0 0 1 2 0v8a1 1 0 0 1-2 0V4zm6 8a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.93V21H9v2h6v-2h-2v-2.07A7 7 0 0 0 19 12h-2z"/></svg>
  </div>
  <div class="voice-hint">松开发送语音</div>
  <div class="voice-cancel" id="voiceCancel">取消</div>
</div>

<!-- LIGHTBOX -->
<div id="lightbox"><img id="lightboxImg" src="" alt=""/></div>

<script>
const socket = io();
let myUsername='', myColor='', currentRoom='综合';
let lastMsgUser=null, lastMsgTime=null;
let cloudName='', uploadPreset='';
let mediaRecorder=null, audioChunks=[], recTimer=null, recSeconds=0, cancelled=false;

const roomDescs={'综合':'欢迎来到新和联胜！','工作':'工作交流区','闲聊':'随便聊聊','图片':'分享图片和语音'};

// fetch cloudinary config
fetch('/config').then(r=>r.json()).then(cfg=>{
  cloudName=cfg.cloudName; uploadPreset=cfg.uploadPreset;
});

// LOGIN
const loginScreen=document.getElementById('loginScreen');
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
  loginScreen.style.display='none';
  document.getElementById('myName').textContent=username;
  const av=document.getElementById('myAvatar');
  av.textContent=username[0].toUpperCase(); av.style.background=color;
  updateRoomUI(currentRoom);
});

// ROOMS
socket.on('roomList',rooms=>{
  const list=document.getElementById('roomList');
  const mobileRooms=document.getElementById('mobileRooms');
  list.innerHTML=''; mobileRooms.innerHTML='';
  rooms.forEach(r=>{
    // desktop
    const el=document.createElement('div');
    el.className='room-item'+(r.name===currentRoom?' active':'');
    el.dataset.room=r.name;
    el.innerHTML=\`<span class="room-hash">#</span><span class="room-name">\${r.name}</span><span class="room-cnt \${r.count>0?'show':''}" data-cnt="\${r.name}">\${r.count}</span>\`;
    el.addEventListener('click',()=>switchRoom(r.name));
    list.appendChild(el);
    // mobile
    const mb=document.createElement('button');
    mb.className='mobile-room-btn'+(r.name===currentRoom?' active':'');
    mb.dataset.room=r.name;
    mb.textContent='# '+r.name;
    mb.addEventListener('click',()=>switchRoom(r.name));
    mobileRooms.appendChild(mb);
  });
});

socket.on('roomUserCount',({room,count})=>{
  document.querySelectorAll(\`[data-cnt="\${room}"]\`).forEach(el=>{
    el.textContent=count; el.classList.toggle('show',count>0);
  });
});

function switchRoom(room){
  if(room===currentRoom)return;
  currentRoom=room;
  socket.emit('switchRoom',{room});
  updateRoomUI(room);
  clearMessages();
  document.querySelectorAll('.room-item').forEach(el=>el.classList.toggle('active',el.dataset.room===room));
  document.querySelectorAll('.mobile-room-btn').forEach(el=>el.classList.toggle('active',el.dataset.room===room));
}
socket.on('switchedRoom',room=>{currentRoom=room; updateRoomUI(room);});

function updateRoomUI(room){
  document.getElementById('headerName').textContent=room;
  document.getElementById('headerDesc').textContent=roomDescs[room]||'';
  document.getElementById('msgInput').placeholder=\`发消息到 #\${room}…\`;
  lastMsgUser=null; lastMsgTime=null;
}
function clearMessages(){
  document.getElementById('messages').innerHTML='<div class="day-div">今天</div>';
  lastMsgUser=null; lastMsgTime=null;
}

// ONLINE
socket.on('onlineUsers',users=>{
  const list=document.getElementById('onlineList');
  list.innerHTML='';
  users.forEach(u=>{
    const el=document.createElement('div');
    el.className='online-item';
    el.innerHTML=\`<div class="av" style="width:22px;height:22px;font-size:9px;background:\${u.color}">\${u.name[0].toUpperCase()}</div><span class="online-name">\${u.name}</span><span style="font-size:10px;color:var(--text-muted)">#\${u.room}</span><div class="dot-green"></div>\`;
    list.appendChild(el);
  });
});

// MESSAGES
socket.on('history',msgs=>{clearMessages();msgs.forEach(renderMessage);scrollBottom();});
socket.on('message',msg=>{renderMessage(msg);scrollBottom();});

function formatTime(iso){
  return new Date(iso).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'});
}
function sameMinute(a,b){
  if(!a||!b)return false;
  const da=new Date(a),db=new Date(b);
  return da.getHours()===db.getHours()&&da.getMinutes()===db.getMinutes();
}

function renderMessage(msg){
  const c=document.getElementById('messages');
  if(msg.type==='system'){
    lastMsgUser=null; lastMsgTime=null;
    const el=document.createElement('div');
    el.className='msg-system'; el.textContent=msg.text;
    c.appendChild(el); return;
  }
  const cont=msg.username===lastMsgUser&&sameMinute(msg.timestamp,lastMsgTime);
  lastMsgUser=msg.username; lastMsgTime=msg.timestamp;
  const g=document.createElement('div');
  g.className='msg-group'+(cont?' msg-continued':'');
  const meta=document.createElement('div');
  meta.className='msg-meta';
  meta.innerHTML=\`<span class="msg-username" style="color:\${msg.color}">\${esc(msg.username)}</span><span class="msg-time">\${formatTime(msg.timestamp)}</span>\`;
  g.appendChild(meta);
  const b=document.createElement('div');
  b.className='msg-bubble';
  if(msg.type==='image'){
    const img=document.createElement('img');
    img.src=msg.url; img.alt='图片'; img.loading='lazy';
    img.addEventListener('click',()=>openLightbox(msg.url));
    b.appendChild(img);
  } else if(msg.type==='voice'){
    b.appendChild(makeVoiceUI(msg.url, msg.duration||0));
  } else {
    b.textContent=msg.text;
  }
  g.appendChild(b); c.appendChild(g);
}

function makeVoiceUI(url, dur){
  const bars=[3,5,8,6,10,7,5,9,4,7,6,8,5,4,7];
  const d=document.createElement('div');
  d.className='voice-msg';
  const durStr=dur>=60?\`\${Math.floor(dur/60)}:\${String(dur%60).padStart(2,'0')}\`:\`\${dur}"\`;
  d.innerHTML=\`<div class="voice-play-btn"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div><div class="voice-wave">\${bars.map(h=>\`<span style="height:\${h}px"></span>\`).join('')}</div><span class="voice-dur">\${durStr}</span>\`;
  let audio=null;
  d.addEventListener('click',()=>{
    if(!audio){audio=new Audio(url);}
    if(audio.paused){
      audio.play();
      d.classList.add('playing');
      audio.onended=()=>d.classList.remove('playing');
    } else {
      audio.pause(); audio.currentTime=0;
      d.classList.remove('playing');
    }
  });
  return d;
}

function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function scrollBottom(){const m=document.getElementById('messages');m.scrollTop=m.scrollHeight;}

// SEND TEXT
const msgInput=document.getElementById('msgInput');
document.getElementById('sendBtn').addEventListener('click',sendText);
msgInput.addEventListener('keydown',e=>{
  if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendText();}
});
msgInput.addEventListener('input',()=>{
  msgInput.style.height='auto';
  msgInput.style.height=Math.min(msgInput.scrollHeight,100)+'px';
});
function sendText(){
  const t=msgInput.value;
  if(!t.trim()||!myUsername)return;
  socket.emit('sendMessage',{text:t,room:currentRoom});
  msgInput.value=''; msgInput.style.height='auto';
}

// IMAGE UPLOAD (Cloudinary if configured, else base64 fallback)
const imageBtn=document.getElementById('imageBtn');
const imageInput=document.getElementById('imageInput');
imageBtn.addEventListener('click',()=>imageInput.click());
imageInput.addEventListener('change',async()=>{
  const file=imageInput.files[0]; if(!file)return;
  if(file.size>10*1024*1024){alert('图片太大，最多10MB');return;}
  if(cloudName&&uploadPreset){
    // Cloudinary upload
    const fd=new FormData();
    fd.append('file',file);
    fd.append('upload_preset',uploadPreset);
    try{
      const r=await fetch(\`https://api.cloudinary.com/v1_1/\${cloudName}/image/upload\`,{method:'POST',body:fd});
      const d=await r.json();
      if(d.secure_url){socket.emit('sendImage',{url:d.secure_url,room:currentRoom});}
    }catch(e){alert('上传失败，请重试');}
  } else {
    // base64 fallback
    const reader=new FileReader();
    reader.onload=e=>socket.emit('sendImage',{url:e.target.result,room:currentRoom});
    reader.readAsDataURL(file);
  }
  imageInput.value='';
});

// VOICE RECORDING
const voiceBtn=document.getElementById('voiceBtn');
const voiceOverlay=document.getElementById('voiceOverlay');
const voiceTimer=document.getElementById('voiceTimer');
const voiceCancel=document.getElementById('voiceCancel');

function startRecording(){
  if(!navigator.mediaDevices){alert('你的浏览器不支持录音');return;}
  navigator.mediaDevices.getUserMedia({audio:true}).then(stream=>{
    cancelled=false; audioChunks=[]; recSeconds=0;
    mediaRecorder=new MediaRecorder(stream);
    mediaRecorder.ondataavailable=e=>{if(e.data.size>0)audioChunks.push(e.data);};
    mediaRecorder.onstop=()=>{
      stream.getTracks().forEach(t=>t.stop());
      if(!cancelled&&audioChunks.length>0){
        const blob=new Blob(audioChunks,{type:'audio/webm'});
        uploadVoice(blob, recSeconds);
      }
    };
    mediaRecorder.start();
    voiceBtn.classList.add('recording');
    voiceOverlay.classList.add('show');
    recTimer=setInterval(()=>{
      recSeconds++;
      const m=Math.floor(recSeconds/60), s=recSeconds%60;
      voiceTimer.textContent=\`\${m}:\${String(s).padStart(2,'0')}\`;
      if(recSeconds>=120)stopRecording(false);
    },1000);
  }).catch(()=>alert('无法访问麦克风，请检查权限'));
}

function stopRecording(cancel=false){
  cancelled=cancel;
  clearInterval(recTimer);
  voiceBtn.classList.remove('recording');
  voiceOverlay.classList.remove('show');
  voiceTimer.textContent='0:00';
  if(mediaRecorder&&mediaRecorder.state!=='inactive')mediaRecorder.stop();
}

async function uploadVoice(blob, duration){
  if(cloudName&&uploadPreset){
    const fd=new FormData();
    fd.append('file',blob,'voice.webm');
    fd.append('upload_preset',uploadPreset);
    fd.append('resource_type','video');
    try{
      const r=await fetch(\`https://api.cloudinary.com/v1_1/\${cloudName}/video/upload\`,{method:'POST',body:fd});
      const d=await r.json();
      if(d.secure_url)socket.emit('sendVoice',{url:d.secure_url,duration,room:currentRoom});
    }catch(e){alert('语音上传失败');}
  } else {
    // base64 fallback
    const reader=new FileReader();
    reader.onload=e=>socket.emit('sendVoice',{url:e.target.result,duration,room:currentRoom});
    reader.readAsDataURL(blob);
  }
}

// Touch/click handling for voice button
let voiceHoldTimer=null;
voiceBtn.addEventListener('mousedown',()=>{voiceHoldTimer=setTimeout(startRecording,200);});
voiceBtn.addEventListener('mouseup',()=>{clearTimeout(voiceHoldTimer);if(mediaRecorder&&mediaRecorder.state!=='inactive')stopRecording(false);});
voiceBtn.addEventListener('mouseleave',()=>{clearTimeout(voiceHoldTimer);});
voiceBtn.addEventListener('touchstart',e=>{e.preventDefault();voiceHoldTimer=setTimeout(startRecording,200);},{passive:false});
voiceBtn.addEventListener('touchend',e=>{e.preventDefault();clearTimeout(voiceHoldTimer);if(mediaRecorder&&mediaRecorder.state!=='inactive')stopRecording(false);});
voiceCancel.addEventListener('click',()=>stopRecording(true));

// LIGHTBOX
const lightbox=document.getElementById('lightbox');
function openLightbox(src){document.getElementById('lightboxImg').src=src;lightbox.classList.add('open');}
lightbox.addEventListener('click',()=>lightbox.classList.remove('open'));
</script>
</body>
</html>
`;

app.get('/', (req, res) => res.send(HTML_CONTENT));
app.get('/config', (req, res) => res.json({
  cloudName: CLOUDINARY_CLOUD_NAME,
  uploadPreset: CLOUDINARY_UPLOAD_PRESET
}));

const rooms = {
  '综合': { messages: [], description: '欢迎来到新和联胜！' },
  '工作': { messages: [], description: '工作交流区' },
  '闲聊': { messages: [], description: '随便聊聊' },
  '图片': { messages: [], description: '分享图片和语音' },
};

const onlineUsers = new Map();
const userColors = ['#4F46E5','#0891B2','#059669','#D97706','#DC2626','#7C3AED','#DB2777','#0284C7'];
let colorIndex = 0;

function getRoomUsers(room) {
  const users = [];
  onlineUsers.forEach((u, name) => { if (u.room === room) users.push({ name, color: u.color }); });
  return users;
}
function getAllOnlineUsers() {
  const users = [];
  onlineUsers.forEach((u, name) => users.push({ name, color: u.color, room: u.room }));
  return users;
}

io.on('connection', (socket) => {
  let currentUser = null;
  let currentRoom = null;

  socket.on('join', ({ username, room }) => {
    if (!username || !room || !rooms[room]) return;
    if (onlineUsers.has(username) && onlineUsers.get(username).socketId !== socket.id) {
      username = username + '_' + Math.floor(Math.random() * 100);
    }
    currentUser = username;
    currentRoom = room;
    const color = userColors[colorIndex++ % userColors.length];
    onlineUsers.set(currentUser, { socketId: socket.id, room, color });
    socket.join(room);
    socket.emit('history', rooms[room].messages.slice(-100));
    socket.emit('roomList', Object.keys(rooms).map(r => ({ name: r, description: rooms[r].description, count: getRoomUsers(r).length })));
    socket.emit('userConfirmed', { username: currentUser, color });
    io.emit('onlineUsers', getAllOnlineUsers());
    const sysMsg = { id: Date.now(), type: 'system', text: `${currentUser} 加入了频道`, timestamp: new Date().toISOString(), room };
    rooms[room].messages.push(sysMsg);
    io.to(room).emit('message', sysMsg);
    io.emit('roomUserCount', { room, count: getRoomUsers(room).length });
  });

  socket.on('switchRoom', ({ room }) => {
    if (!rooms[room] || !currentUser) return;
    const oldRoom = currentRoom;
    socket.leave(oldRoom);
    const userData = onlineUsers.get(currentUser);
    if (userData) { userData.room = room; onlineUsers.set(currentUser, userData); }
    currentRoom = room;
    socket.join(room);
    socket.emit('history', rooms[room].messages.slice(-100));
    socket.emit('switchedRoom', room);
    io.emit('onlineUsers', getAllOnlineUsers());
    io.emit('roomUserCount', { room: oldRoom, count: getRoomUsers(oldRoom).length });
    io.emit('roomUserCount', { room, count: getRoomUsers(room).length });
  });

  socket.on('sendMessage', ({ text, room }) => {
    if (!currentUser || !text?.trim() || !rooms[room]) return;
    const msg = { id: Date.now() + Math.random(), type: 'text', username: currentUser, color: onlineUsers.get(currentUser)?.color || '#333', text: text.trim().slice(0, 2000), timestamp: new Date().toISOString(), room };
    rooms[room].messages.push(msg);
    if (rooms[room].messages.length > 500) rooms[room].messages.shift();
    io.to(room).emit('message', msg);
  });

  socket.on('sendImage', ({ url, room }) => {
    if (!currentUser || !url || !rooms[room]) return;
    const msg = { id: Date.now() + Math.random(), type: 'image', username: currentUser, color: onlineUsers.get(currentUser)?.color || '#333', url, timestamp: new Date().toISOString(), room };
    rooms[room].messages.push(msg);
    if (rooms[room].messages.length > 500) rooms[room].messages.shift();
    io.to(room).emit('message', msg);
  });

  socket.on('sendVoice', ({ url, duration, room }) => {
    if (!currentUser || !url || !rooms[room]) return;
    const msg = { id: Date.now() + Math.random(), type: 'voice', username: currentUser, color: onlineUsers.get(currentUser)?.color || '#333', url, duration, timestamp: new Date().toISOString(), room };
    rooms[room].messages.push(msg);
    if (rooms[room].messages.length > 500) rooms[room].messages.shift();
    io.to(room).emit('message', msg);
  });

  socket.on('disconnect', () => {
    if (!currentUser) return;
    onlineUsers.delete(currentUser);
    if (currentRoom && rooms[currentRoom]) {
      const sysMsg = { id: Date.now(), type: 'system', text: `${currentUser} 离开了频道`, timestamp: new Date().toISOString(), room: currentRoom };
      rooms[currentRoom].messages.push(sysMsg);
      io.to(currentRoom).emit('message', sysMsg);
    }
    io.emit('onlineUsers', getAllOnlineUsers());
    if (currentRoom) io.emit('roomUserCount', { room: currentRoom, count: getRoomUsers(currentRoom).length });
  });
});

server.listen(PORT, () => console.log(\`新和联胜 running on port \${PORT}\`));
