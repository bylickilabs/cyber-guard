# 🛡 Unified Security Framework  
**Version 1.0.0 — Multi-Layer Client-Side Security Protection Suite**

- The **Unified Security Framework** delivers a modular, multi-layer security system for modern web applications.  
- It bundles client-side anomaly detection, DDoS-Guard, DOM protection, input shielding, service-worker hardening 
  - and UI blackout controls into one compact package.

> Designed for frictionless integration into any HTML-based project.  
> Optimized for performance. Powered by BYLICKILABS.

<br>

---

<br>

## 🚀 Included Security Modules

### ✔ AI Monitoring Layer (`ai.js`)
- Performance tracking  
- Error & anomaly logging  
- Network monitoring  
- FPS measurement  
- Behavior scoring  
- Client-side analytics

### ✔ DDoS-Guard (`ddos-guard.js`)
- Event‑flood detection  
- Request throttling  
- Basic bot traffic mitigation  
- Client-side shield activation

### ✔ DOM Protection (`protect.js` + `protect.css`)
- Blackout screen  
- Anti-manipulation guard  
- Tamper detection  
- UI shielding  

### ✔ Service Worker (`service-worker.js`)
- Offline hardening  
- Resource integrity policies  
- Static-site protection  

<br>

---

# 📦 Installation (npm)

```
npm i @bylickilabs/unified-security-layer
```

<br>

---

<br>

# 🌐 CDN Integration

Insert into `<head>`:

## jsDelivr
```
<script src="https://cdn.jsdelivr.net/npm/unified-security-framework/ai.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/unified-security-framework/ddos-guard.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/unified-security-framework/protect.js" defer></script>
```

```
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/unified-security-framework/protect.css">
````

---

## unpkg

```
<script src="https://unpkg.com/unified-security-framework/ai.js" defer></script>
<script src="https://unpkg.com/unified-security-framework/ddos-guard.js" defer></script>
<script src="https://unpkg.com/unified-security-framework/protect.js" defer></script>
```

```
<link rel="stylesheet" href="https://unpkg.com/unified-security-framework/protect.css">
```

<br>

---

<br>

# ⚫ Blackout Layer & Input Shield

Insert into `<body>`:

```
<div id="blackout" class="blackout" aria-hidden="true"></div>

<script language="JavaScript1.2">
function disableselect(e){
return false
}
function reEnable(){
return true
}
document.onselectstart=new Function ("return false")
if (window.sidebar){
document.onmousedown=disableselect
document.onclick=reEnable
}
</script>

</head>
<body oncontextmenu="return false">
<script language="JavaScript1.2">
function disableselect(e){
return false
}
function reEnable(){
return true
}
document.onselectstart=new Function ("return false")
if (window.sidebar){
document.onmousedown=disableselect
document.onclick=reEnable
}
</script>
```

---

# 🛡 License  
MIT © BYLICKILABS
[LICENSE](LICENSE)
