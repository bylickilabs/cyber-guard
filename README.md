# 🛡 CyberGuard
**Version 1.0.3 — Multi-Layer Client-Side Security Protection Suite**

|<img width="1280" height="640" alt="cyberguard" src="https://github.com/user-attachments/assets/8a88eac9-b7eb-40d7-b7a1-bf4f85b0a288" />  |
|---|

- CyberGuard delivers a modular, multi-layer security system for modern web applications.
- It consolidates client-side anomaly detection, DDoS-Guard, DOM protection, input shielding, service-worker hardening,
  - and UI blackout controls into a single, cohesive security package.

> Designed for seamless integration into any HTML-based project.
  - Performance-optimized. Engineered by BYLICKILABS.

<br>

---

<br>

## 🚀 Included Security Modules

### ✔ AI Monitoring Layer (`ai.min.js`)
- Performance tracking  
- Error & anomaly logging  
- Network monitoring  
- FPS measurement  
- Behavior scoring  
- Client-side analytics

### ✔ DDoS-Guard (`ddos-guard.min.js`)
- Event‑flood detection  
- Request throttling  
- Basic bot traffic mitigation  
- Client-side shield activation

### ✔ DOM Protection (`protect.min.js` + `protect.min.css`)
- Blackout screen  
- Anti-manipulation guard  
- Tamper detection  
- UI shielding  

## ➕ Additional Features in v1.0.3 (Upgrade from v1.0.0)

Version **v1.0.3** extends the existing feature set with structured telemetry, deeper contextual insight, and professional reporting capabilities. All features from v1.0.0 remain fully intact.

---

### 🔹 Session & Event Telemetry
- Introduction of a global **Session ID** per page load
- Sequential **Event IDs** for unique identification of every log entry
- Consistent event ordering across the entire session
- Capture of **session start time** for time-based analysis

---

### 🔹 Breadcrumb Tracking (Context History)
- Recording of relevant pre-events before failures:
  - User click interactions
  - JavaScript runtime errors
  - Unhandled promise rejections
  - Network & XHR errors
  - Online / Offline state changes
- Automatic limitation of breadcrumb history
- Breadcrumbs embedded into every log entry

---

### 🔹 Per-Event Snapshot Extensions
Each log entry now includes:
- **Performance snapshot** (page load time, average FPS, low-FPS frames)
- **Network snapshot** (request counters, error count, offline state)
- **Resource snapshot** (failed resource loads)
- Current breadcrumb context

---

### 🔹 Extended Network Error History
- Persistent tracking of recent network and XHR failures
- Storage of:
  - URL
  - HTTP status
  - Request method
  - Request duration
- Integrated into incident and session reports

---

### 🔹 Advanced Export & Reporting Capabilities
- **CSV export** for structured analysis and BI tooling
- **HTML report** for management, audit, and documentation use
- **Session-specific export** (logs limited to the active session)
- Enhanced JSON exports including session and telemetry data

---

### 🔹 UI Overlay Enhancements
- Additional export controls:
  - CSV
  - HTML
  - Session report
- Improved button grouping for operational workflows
- Increased information density without breaking existing behavior

---

### 🔹 Internal Stability & Governance Improvements
- Event sequence reconstruction from local storage
- Clean initialization of session state
- Consistent log structures across all export formats
- No breaking changes to the existing public API

---

**v1.0.1** elevates the AI Monitoring Layer from basic client-side monitoring to a **fully observability-ready telemetry and incident analysis system**, remaining entirely backend-free and privacy-first.


<br>

---

<br>

# 📦 Installation (npm)

```
npm i @bylickilabs/cyber-guard
```

<br>

---

<br>

# 🌐 CDN Integration

Insert into `<head>`:

## jsDelivr
```
<script src="https://cdn.jsdelivr.net/npm/@bylickilabs/cyber-guard/ai.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/@bylickilabs/cyber-guard/ddos-guard.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/@bylickilabs/cyber-guard/protect.min.js" defer></script>

```

```
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@bylickilabs/cyber-guard/protect.min.css">
````

---

## unpkg

```
<script src="https://unpkg.com/@bylickilabs/cyber-guard/ai.min.js" defer></script>
<script src="https://unpkg.com/@bylickilabs/cyber-guard/ddos-guard.min.js" defer></script>
<script src="https://unpkg.com/@bylickilabs/cyber-guard/protect.min.js" defer></script>

```

```
<link rel="stylesheet" href="https://unpkg.com/@bylickilabs/cyber-guard/protect.min.css">
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

