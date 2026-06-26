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
async function doTranslate(text, langLabel, boxId, btn){
  const box=document.getElementById(boxId); if(!box)return;
  const targetLang=langCodes[langLabel];
  const cacheKey=text+'|'+targetLang;
  
  // Toggle off if same lang is already shown
  if(btn.classList.contains('active-lang')){
    box.classList.remove('show'); btn.classList.remove('active-lang'); return;
  }
  // Deactivate other lang buttons in same bar
  btn.closest('.msg-bubble').querySelectorAll('.tl-btn').forEach(b=>b.classList.remove('active-lang'));
  btn.classList.add('active-lang');
  
  if(tlCache[cacheKey]){
    box.innerHTML='<div class="tl-label">'+langNames[langLabel]+'</div>'+esc(tlCache[cacheKey]);
    box.classList.add('show'); return;
  }
  
  const orig=btn.textContent; btn.textContent='…';
  try{
    const url='https://api.mymemory.translated.net/get?q='+encodeURIComponent(text)+'&langpair=auto|'+targetLang;
    const r=await fetch(url,{signal:AbortSignal.timeout(8000)});
    const d=await r.json();
    const result=d&&d.responseData&&d.responseData.translatedText;
    if(result&&result!==text&&!result.includes('MYMEMORY WARNING')){
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

const MANIFEST = JSON.stringify({
  name: "\u65b0\u548c\u8054\u80dc",
  short_name: "\u65b0\u548c\u8054\u80dc",
  description: "\u79c1\u57df\u804a\u5929\u5ba4",
  start_url: "/",
  display: "standalone",
  background_color: "#ffffff",
  theme_color: "#1a1a1a",
  orientation: "portrait",
  icons: [
    { src: "/icon.png", sizes: "192x192", type: "image/png" },
    { src: "/icon.png", sizes: "512x512", type: "image/png" }
  ]
});

const SW = `
const CACHE = 'xlsv1';
self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(['/']))));
self.addEventListener('fetch', e => {
  if(e.request.url.includes('/socket.io/')) return;
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
`;

// Simple icon - a colored circle SVG as PNG placeholder
const ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192"><rect width="192" height="192" rx="40" fill="#1a1a1a"/><text x="96" y="125" text-anchor="middle" fill="white" font-size="90" font-family="PingFang SC,sans-serif">\u80dc</text></svg>';

app.get('/', (req, res) => res.send(PAGE));
app.get('/manifest.json', (req, res) => { res.setHeader('Content-Type','application/manifest+json'); res.send(MANIFEST); });
app.get('/sw.js', (req, res) => { res.setHeader('Content-Type','application/javascript'); res.send(SW); });
app.get('/icon.png', (req, res) => { res.setHeader('Content-Type','image/svg+xml'); res.send(ICON_SVG); });
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
    rooms[room].messages.push(sys);
    io.to(room).emit('message',sys);
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
      rooms[myRoom].messages.push(sys);io.to(myRoom).emit('message',sys);
    }
    io.emit('onlineUsers',getAllUsers());
    if(myRoom)io.emit('roomUserCount',{room:myRoom,count:getRoomUsers(myRoom).length});
  });
});

server.listen(PORT,()=>console.log('\u65b0\u548c\u8054\u80dc running on port '+PORT));
