# 🛡 CyberGuard WebLayer
**Version 1.0.0 — Multi-Layer Client-Side Security Protection Suite**

- The **CyberGuard WebLayer** delivers a modular, multi-layer security system for modern web applications.  
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

<br>

---

<br>

# 📦 Installation (npm)

```
npm i @bylickilabs/cyber-guard-web-layer
```

<br>

---

<br>

# 🌐 CDN Integration

Insert into `<head>`:

## jsDelivr
```
<script src="https://cdn.jsdelivr.net/npm/cyber-guard-web-layer/ai.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/cyber-guard-web-layer/ddos-guard.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/cyber-guard-web-layer/protect.js" defer></script>
```

```
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/cyber-guard-web-layer/protect.css">
````

---

## unpkg

```
<script src="https://unpkg.com/cyber-guard-web-layer/ai.js" defer></script>
<script src="https://unpkg.com/cyber-guard-web-layer/ddos-guard.js" defer></script>
<script src="https://unpkg.com/cyber-guard-web-layer/protect.js" defer></script>
```

```
<link rel="stylesheet" href="https://unpkg.com/cyber-guard-web-layer/protect.css">
```

<br>

---

<br>



# ⚫ Blackout Layer & Input Shield

Insert into `<body>`:

```
<!-- BLACKOUT LAYER BEGIN -->

<div id="blackout" class="blackout" aria-hidden="true"></div>

<!-- BLACKOUT LAYER END -->

---

<!-- INPUT SHIELD BEGIN -->

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

<!-- INPUT SHIELD END -->
```

<br>

---

<br>

# Optional Screenshot Support with html2canvas

> This project can optionally support **in-browser screenshots** of sections of your web application by using the 
[`html2canvas`](https://html2canvas.hertzen.com/) library.

---

## 🔧 1. Integration in the `<head>` Section  

> [!TIP]
> To enable screenshot functionality, add the following script tag **inside the `<head>` section** of your HTML document:  

```
    <script src="https://html2canvas.hertzen.com/dist/html2canvas.js"></script>
```

> [!NOTE]
> This script is **optional**. If you do not need screenshot or capture functionality, you can omit this dependency and the rest of the framework will continue to work as usual.

---

## ✅ Summary

- Adding `html2canvas.js` to the `<head>` section enables optional screenshot features for your web UI.  
  - If you do not require this functionality, you can simply leave it out.

---

# 🛡 License  
MIT © BYLICKILABS
[LICENSE](LICENSE)
