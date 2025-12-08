/*!
 * BYLICKILABS – AI Monitoring Framework (ai.js)
 * Version: 1.0.2
 *
 * Features:
 *  - Error & Promise Monitoring
 *  - Network Monitoring (fetch + XHR)
 *  - Resource Load Errors
 *  - Performance & FPS Tracking
 *  - Offline Event Queue Marking
 *  - AI Scoring 1.0.2 (Errors, Network, Resources, FPS, Performance)
 *  - Local Log Storage (Ring-Buffer)
 *  - Incident Report Export
 *  - Screenshot Export (optional, via html2canvas wenn vorhanden)
 *  - UI-Overlay mit Status, Export & Clear
 */

(function (window, document) {
    "use strict";

    if (!window || !document) return;

    const CONFIG = {
        appName: "Ai Monitoring Framework",
        appVersion: "1.0.2",
        environment: "production",
        storageKey: "BYLICKILABS_AI_LOGS",
        maxLogEntries: 800,
        ui: {
            enabled: true,
            position: "bottom-right"
        },
        thresholds: {
            errorRateHigh: 0.10,
            slowLoadMs: 3000,
            minEventsForAnalysis: 20,
            networkErrorRateWarn: 0.25,
            networkErrorRateCrit: 0.5,
            resourceErrorWarn: 10,
            resourceErrorCrit: 30,
            fpsWarn: 25,
            fpsCrit: 15,
            fpsWindowSeconds: 30
        }
    };

    const state = {
        logs: [],
        counters: {
            totalEvents: 0,
            errors: 0,
            warnings: 0,
            info: 0
        },
        performance: {
            pageLoadTime: null,
            fpsSamples: [],
            fpsLastTime: null,
            fpsAverage: null,
            fpsLowFrames: 0,
            fpsWindowStart: null,
            firstAnalysisDone: false
        },
        network: {
            totalRequests: 0,
            errorCount: 0,
            lastErrors: [],
            isOffline: !navigator.onLine
        },
        resources: {
            errorCount: 0
        },
        anomaly: {
            level: "normal",
            reasons: []
        },
        initialized: false
    };

    function nowISO() {
        return new Date().toISOString();
    }

    function safeStringify(obj) {
        try {
            return JSON.stringify(obj, null, 2);
        } catch (e) {
            return "{}";
        }
    }

    function loadFromStorage() {
        try {
            const raw = window.localStorage.getItem(CONFIG.storageKey);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                state.logs = parsed;
                state.counters.totalEvents = parsed.length;
                state.counters.errors = parsed.filter(l => l.level === "error").length;
                state.counters.warnings = parsed.filter(l => l.level === "warn").length;
                state.counters.info = parsed.filter(l => l.level === "info").length;
            }
        } catch (e) {
        }
    }

    function persistToStorage() {
        try {
            const trimmed = state.logs.slice(-CONFIG.maxLogEntries);
            window.localStorage.setItem(CONFIG.storageKey, JSON.stringify(trimmed));
        } catch (e) {
        }
    }

    function createLog(type, level, message, details) {
        return {
            timestamp: nowISO(),
            app: CONFIG.appName,
            version: CONFIG.appVersion,
            env: CONFIG.environment,
            type: type,
            level: level,
            message: message || "",
            details: details || {},
            userAgent: navigator.userAgent || "",
            url: window.location.href || "",
            offline: state.network.isOffline === true
        };
    }

    function addLog(entry) {
        state.logs.push(entry);
        state.counters.totalEvents++;

        switch (entry.level) {
            case "error":
                state.counters.errors++;
                break;
            case "warn":
                state.counters.warnings++;
                break;
            case "info":
                state.counters.info++;
                break;
        }

        if (state.logs.length > CONFIG.maxLogEntries) {
            state.logs = state.logs.slice(-CONFIG.maxLogEntries);
        }

        persistToStorage();
        runAnomalyAnalysis();
        updateUIStatus();
    }

    function runAnomalyAnalysis() {
        const reasons = [];
        let level = "normal";

        const total = state.counters.totalEvents || 0;
        const errorCount = state.counters.errors || 0;
        const netTotal = state.network.totalRequests || 0;
        const netErrors = state.network.errorCount || 0;
        const resErrors = state.resources.errorCount || 0;
        const fpsAvg = state.performance.fpsAverage;
        const loadTime = state.performance.pageLoadTime;

        if (total >= CONFIG.thresholds.minEventsForAnalysis && total > 0) {
            const errorRate = errorCount / total;
            if (errorRate >= CONFIG.thresholds.errorRateHigh * 2) {
                level = "critical";
                reasons.push(`Hohe JS-Fehlerrate: ${(errorRate * 100).toFixed(1)}%`);
            } else if (errorRate >= CONFIG.thresholds.errorRateHigh) {
                if (level !== "critical") level = "warning";
                reasons.push(`Erhöhte JS-Fehlerrate: ${(errorRate * 100).toFixed(1)}%`);
            }
        }

        if (loadTime != null) {
            if (loadTime > CONFIG.thresholds.slowLoadMs * 2) {
                level = "critical";
                reasons.push(`Sehr langsame Page-Load-Zeit: ${loadTime} ms`);
            } else if (loadTime > CONFIG.thresholds.slowLoadMs) {
                if (level !== "critical") level = "warning";
                reasons.push(`Langsame Page-Load-Zeit: ${loadTime} ms`);
            }
        }

        if (netTotal > 0) {
            const netRate = netErrors / netTotal;
            if (netRate >= CONFIG.thresholds.networkErrorRateCrit) {
                level = "critical";
                reasons.push(`Hohe Netzwerkfehler-Rate: ${(netRate * 100).toFixed(1)}% (${netErrors}/${netTotal})`);
            } else if (netRate >= CONFIG.thresholds.networkErrorRateWarn) {
                if (level !== "critical") level = "warning";
                reasons.push(`Erhöhte Netzwerkfehler-Rate: ${(netRate * 100).toFixed(1)}% (${netErrors}/${netTotal})`);
            }
        }

        if (resErrors >= CONFIG.thresholds.resourceErrorCrit) {
            level = "critical";
            reasons.push(`Viele fehlgeschlagene Ressourcen-Ladevorgänge: ${resErrors} Fehler`);
        } else if (resErrors >= CONFIG.thresholds.resourceErrorWarn) {
            if (level !== "critical") level = "warning";
            reasons.push(`Auffällige Anzahl an Ressourcen-Ladefehlern: ${resErrors} Fehler`);
        }

        if (fpsAvg != null) {
            if (fpsAvg <= CONFIG.thresholds.fpsCrit) {
                level = "critical";
                reasons.push(`Sehr niedrige Rendering-Performance: ~${fpsAvg.toFixed(1)} FPS`);
            } else if (fpsAvg <= CONFIG.thresholds.fpsWarn) {
                if (level !== "critical") level = "warning";
                reasons.push(`Niedrige Rendering-Performance: ~${fpsAvg.toFixed(1)} FPS`);
            }
        }

        state.anomaly.level = level;
        state.anomaly.reasons = reasons;

        if (!state.performance.firstAnalysisDone && reasons.length > 0) {
            const anomalyLog = createLog(
                "anomaly",
                level === "critical" ? "error" : "warn",
                "AI-Anomaly-Engine hat Auffälligkeiten erkannt.",
                { reasons: reasons, summary: getAnomalySummary() }
            );
            state.performance.firstAnalysisDone = true;
            state.logs.push(anomalyLog);
            state.counters.totalEvents++;
            state.counters[anomalyLog.level === "error" ? "errors" : "warnings"]++;
            persistToStorage();
        }
    }

    function getAnomalySummary() {
        return {
            level: state.anomaly.level,
            reasons: state.anomaly.reasons.slice(),
            stats: {
                totalEvents: state.counters.totalEvents,
                errors: state.counters.errors,
                warnings: state.counters.warnings,
                info: state.counters.info,
                pageLoadTime: state.performance.pageLoadTime,
                fpsAverage: state.performance.fpsAverage,
                fpsLowFrames: state.performance.fpsLowFrames,
                networkTotal: state.network.totalRequests,
                networkErrors: state.network.errorCount,
                resourceErrors: state.resources.errorCount,
                offline: state.network.isOffline
            }
        };
    }

    function captureInitialPerformance() {
        try {
            let loadTime = null;
            if (performance && performance.getEntriesByType) {
                const nav = performance.getEntriesByType("navigation");
                if (nav && nav.length > 0) {
                    loadTime = Math.round(nav[0].duration);
                }
            }
            if (!loadTime && performance && performance.timing) {
                const t = performance.timing;
                loadTime = Math.round((t.loadEventEnd || t.domComplete || 0) - t.navigationStart);
            }
            if (loadTime && loadTime > 0 && loadTime < 60000) {
                state.performance.pageLoadTime = loadTime;
                const perfLog = createLog(
                    "performance",
                    "info",
                    "Initiale Page-Load-Messung.",
                    { loadTimeMs: loadTime }
                );
                addLog(perfLog);
            }
        } catch (e) {
        }
    }

    function startFPSTracking() {
        try {
            const perf = window.performance;
            if (!perf || !perf.now || !window.requestAnimationFrame) {
                return;
            }

            state.performance.fpsWindowStart = perf.now();
            state.performance.fpsLastTime = perf.now();

            function loop() {
                try {
                    const now = perf.now();
                    const dt = now - state.performance.fpsLastTime;
                    state.performance.fpsLastTime = now;

                    if (dt > 0 && dt < 1000) {
                        const fps = 1000 / dt;
                        state.performance.fpsSamples.push(fps);

                        const windowDuration = (now - state.performance.fpsWindowStart) / 1000;
                        if (fps < CONFIG.thresholds.fpsWarn) {
                            state.performance.fpsLowFrames++;
                        }

                        if (windowDuration >= CONFIG.thresholds.fpsWindowSeconds) {
                            const samples = state.performance.fpsSamples;
                            if (samples.length > 0) {
                                const sum = samples.reduce((a, b) => a + b, 0);
                                state.performance.fpsAverage = sum / samples.length;
                            }
                            state.performance.fpsSamples = [];
                            state.performance.fpsWindowStart = now;

                            const fpsLog = createLog(
                                "performance",
                                "info",
                                "FPS-Window-Analyse abgeschlossen.",
                                {
                                    fpsAverage: state.performance.fpsAverage,
                                    fpsLowFrames: state.performance.fpsLowFrames,
                                    windowSeconds: CONFIG.thresholds.fpsWindowSeconds
                                }
                            );
                            addLog(fpsLog);
                        }
                    }
                } catch (e) {
                }
                window.requestAnimationFrame(loop);
            }

            window.requestAnimationFrame(loop);
        } catch (e) {
        }
    }

    function setupErrorMonitoring() {
        window.addEventListener("error", function (event) {
            try {
                if (event.target && event.target !== window && event.target.tagName) {
                    const el = event.target;
                    const tag = el.tagName;
                    const src = el.src || el.href || "";
                    state.resources.errorCount++;

                    const resLog = createLog(
                        "resource",
                        "warn",
                        "Ressource konnte nicht geladen werden.",
                        {
                            tag: tag,
                            src: src,
                            outerHTML: (el.outerHTML || "").slice(0, 300)
                        }
                    );
                    addLog(resLog);
                    return;
                }

                const err = event.error || {};
                const details = {
                    message: event.message || err.message || "",
                    file: event.filename || "",
                    line: event.lineno || null,
                    column: event.colno || null,
                    stack: err.stack || ""
                };
                const log = createLog("error", "error", "Unhandled JavaScript Error.", details);
                addLog(log);
            } catch (e) {
            }
        }, true);

        window.addEventListener("unhandledrejection", function (event) {
            try {
                const reason = event.reason || {};
                const details = {
                    message: reason.message || safeStringify(reason),
                    stack: reason.stack || ""
                };
                const log = createLog("error", "error", "Unhandled Promise Rejection.", details);
                addLog(log);
            } catch (e) {
            }
        });
    }

    let lastClickTimestamp = 0;
    const CLICK_THROTTLE_MS = 300;

    function setupEventMonitoring() {
        document.addEventListener("click", function (event) {
            try {
                const now = Date.now();
                if (now - lastClickTimestamp < CLICK_THROTTLE_MS) return;
                lastClickTimestamp = now;

                const target = event.target || {};
                const elemInfo = {
                    tag: target.tagName || "",
                    id: target.id || "",
                    classes: target.className || "",
                    textSnippet: (target.innerText || target.textContent || "").slice(0, 50)
                };

                const log = createLog(
                    "event",
                    "info",
                    "User Click Event.",
                    { element: elemInfo }
                );
                addLog(log);
            } catch (e) {
            }
        }, true);

        window.addEventListener("offline", function () {
            state.network.isOffline = true;
            const log = createLog(
                "system",
                "warn",
                "Browser ist offline gegangen.",
                {}
            );
            addLog(log);
        });

        window.addEventListener("online", function () {
            state.network.isOffline = false;
            const log = createLog(
                "system",
                "info",
                "Browser ist wieder online.",
                {}
            );
            addLog(log);
        });
    }

    function setupNetworkMonitoring() {
        try {
            if (window.fetch) {
                const originalFetch = window.fetch;
                window.fetch = function () {
                    const start = performance && performance.now ? performance.now() : Date.now();
                    state.network.totalRequests++;

                    return originalFetch.apply(this, arguments).then(function (response) {
                        const duration = (performance && performance.now ? performance.now() : Date.now()) - start;

                        if (!response.ok) {
                            state.network.errorCount++;
                            const log = createLog(
                                "network",
                                "warn",
                                "HTTP-Fehler bei fetch().",
                                {
                                    url: response.url,
                                    status: response.status,
                                    statusText: response.statusText,
                                    durationMs: Math.round(duration),
                                    method: (arguments[1] && arguments[1].method) || "GET"
                                }
                            );
                            addLog(log);
                        }
                        return response;
                    }).catch(function (error) {
                        state.network.errorCount++;
                        const log = createLog(
                            "network",
                            "error",
                            "fetch() ist mit einem Netzwerkfehler fehlgeschlagen.",
                            {
                                message: error && error.message ? error.message : String(error),
                                stack: error && error.stack ? error.stack : "",
                                requestInfo: arguments[0]
                            }
                        );
                        addLog(log);
                        throw error;
                    });
                };
            }

            if (window.XMLHttpRequest) {
                const OriginalXHR = window.XMLHttpRequest;

                function WrappedXHR() {
                    const xhr = new OriginalXHR();
                    let url = "";
                    let method = "GET";
                    let startTime = null;

                    const open = xhr.open;
                    xhr.open = function (m, u) {
                        method = m || "GET";
                        url = u || "";
                        return open.apply(xhr, arguments);
                    };

                    const send = xhr.send;
                    xhr.send = function () {
                        state.network.totalRequests++;
                        startTime = performance && performance.now ? performance.now() : Date.now();

                        xhr.addEventListener("loadend", function () {
                            try {
                                const duration =
                                    (performance && performance.now ? performance.now() : Date.now()) - startTime;
                                if (xhr.status >= 400 || xhr.status === 0) {
                                    state.network.errorCount++;
                                    const log = createLog(
                                        "network",
                                        "warn",
                                        "HTTP-Fehler bei XMLHttpRequest.",
                                        {
                                            url: url,
                                            status: xhr.status,
                                            statusText: xhr.statusText,
                                            method: method,
                                            durationMs: Math.round(duration)
                                        }
                                    );
                                    addLog(log);
                                }
                            } catch (e) {
                            }
                        });

                        return send.apply(xhr, arguments);
                    };

                    return xhr;
                }

                window.XMLHttpRequest = WrappedXHR;
            }
        } catch (e) {
        }
    }

    function getLogs() {
        return state.logs.slice();
    }

    function clearLogs() {
        state.logs = [];
        state.counters.totalEvents = 0;
        state.counters.errors = 0;
        state.counters.warnings = 0;
        state.counters.info = 0;
        persistToStorage();
        runAnomalyAnalysis();
        updateUIStatus();
    }

    function exportLogs() {
        const payload = {
            exportedAt: nowISO(),
            app: CONFIG.appName,
            version: CONFIG.appVersion,
            env: CONFIG.environment,
            anomaly: getAnomalySummary(),
            logs: getLogs()
        };

        const json = JSON.stringify(payload, null, 2);
        downloadBlob(json, "application/json", "bylickilabs-ai-logs");
    }

    function exportIncidentReport() {
        const summary = getAnomalySummary();
        const incident = {
            generatedAt: nowISO(),
            app: CONFIG.appName,
            version: CONFIG.appVersion,
            env: CONFIG.environment,
            summary: summary,
            lastNetworkErrors: state.network.lastErrors,
            lastEvents: getLogs().slice(-50)
        };
        const json = JSON.stringify(incident, null, 2);
        downloadBlob(json, "application/json", "bylickilabs-incident-report");
    }

    function downloadBlob(content, mime, baseName) {
        try {
            const blob = new Blob([content], { type: mime });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            const ts = new Date().toISOString().replace(/[:.]/g, "-");
            a.href = url;
            a.download = `${baseName}-${ts}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            try {
                console.error("[BYLICKILABS AI] Download fehlgeschlagen:", e);
            } catch (ignore) {}
        }
    }

    function captureScreenshot() {
        try {
            if (typeof window.html2canvas === "function") {
                window.html2canvas(document.body).then(function (canvas) {
                    canvas.toBlob(function (blob) {
                        if (!blob) return;
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        const ts = new Date().toISOString().replace(/[:.]/g, "-");
                        a.href = url;
                        a.download = `bylickilabs-ai-screenshot-${ts}.png`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                    }, "image/png");
                });
            } else {
                alert("Screenshot-Export benötigt 'html2canvas'. Bitte Bibliothek laden oder alternativ Browser-Screenshots verwenden.");
            }
        } catch (e) {
            try {
                console.error("[BYLICKILABS AI] Screenshot-Export fehlgeschlagen", e);
            } catch (ignore) {}
        }
    }

    let uiRoot = null;
    let uiStatusBadge = null;

    function createUI() {
        if (!CONFIG.ui.enabled) return;
        if (!document.body) return;

        uiRoot = document.createElement("div");
        uiRoot.id = "bylickilabs-ai-monitor";
        uiRoot.style.position = "fixed";
        uiRoot.style.zIndex = "99999";
        uiRoot.style.fontFamily = "system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";
        uiRoot.style.fontSize = "12px";
        uiRoot.style.color = "#e5e5e5";
        uiRoot.style.background = "rgba(10,10,20,0.92)";
        uiRoot.style.borderRadius = "10px";
        uiRoot.style.boxShadow = "0 0 18px rgba(0,0,0,0.6)";
        uiRoot.style.padding = "8px 10px";
        uiRoot.style.minWidth = "210px";
        uiRoot.style.backdropFilter = "blur(6px)";
        uiRoot.style.border = "1px solid rgba(120,120,255,0.45)";
        uiRoot.style.display = "flex";
        uiRoot.style.flexDirection = "column";
        uiRoot.style.gap = "6px";

        if (CONFIG.ui.position === "bottom-left") {
            uiRoot.style.left = "12px";
            uiRoot.style.bottom = "12px";
        } else {
            uiRoot.style.right = "12px";
            uiRoot.style.bottom = "12px";
        }

        const header = document.createElement("div");
        header.style.display = "flex";
        header.style.justifyContent = "space-between";
        header.style.alignItems = "center";
        header.style.gap = "8px";

        const title = document.createElement("div");
        title.textContent = "AI Monitoring";
        title.style.fontWeight = "600";
        title.style.letterSpacing = "0.03em";

        uiStatusBadge = document.createElement("span");
        uiStatusBadge.textContent = "NORMAL";
        uiStatusBadge.style.fontSize = "10px";
        uiStatusBadge.style.padding = "2px 6px";
        uiStatusBadge.style.borderRadius = "999px";
        uiStatusBadge.style.background = "rgba(50,200,120,0.18)";
        uiStatusBadge.style.border = "1px solid rgba(50,200,120,0.65)";
        uiStatusBadge.style.color = "#b7f5d2";

        header.appendChild(title);
        header.appendChild(uiStatusBadge);

        const stats = document.createElement("div");
        stats.style.fontSize = "11px";
        stats.style.opacity = "0.9";
        stats.innerHTML =
            `<span id="bl-ai-events">Events: 0</span> · ` +
            `<span id="bl-ai-errors">Errors: 0</span> · ` +
            `<span id="bl-ai-neterr">NetErr: 0</span>`;

        const buttonsRow1 = document.createElement("div");
        buttonsRow1.style.display = "flex";
        buttonsRow1.style.gap = "6px";
        buttonsRow1.style.marginTop = "2px";

        const buttonsRow2 = document.createElement("div");
        buttonsRow2.style.display = "flex";
        buttonsRow2.style.gap = "6px";

        function makeButton(label) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.textContent = label;
            btn.style.flex = "1";
            btn.style.cursor = "pointer";
            btn.style.border = "none";
            btn.style.borderRadius = "6px";
            btn.style.padding = "4px 6px";
            btn.style.fontSize = "11px";
            btn.style.background = "rgba(80,80,200,0.22)";
            btn.style.color = "#f3f3ff";
            btn.style.transition = "background 0.15s ease, transform 0.1s ease";
            btn.onmouseenter = function () {
                btn.style.background = "rgba(120,120,255,0.38)";
            };
            btn.onmouseleave = function () {
                btn.style.background = "rgba(80,80,200,0.22)";
                btn.style.transform = "scale(1.0)";
            };
            btn.onmousedown = function () {
                btn.style.transform = "scale(0.97)";
            };
            btn.onmouseup = function () {
                btn.style.transform = "scale(1.0)";
            };
            return btn;
        }

        const exportBtn = makeButton("📄 Export Logs");
        exportBtn.addEventListener("click", exportLogs);

        const incidentBtn = makeButton("📑 Incident");
        incidentBtn.addEventListener("click", exportIncidentReport);

        const screenshotBtn = makeButton("📷 Screenshot");
        screenshotBtn.addEventListener("click", captureScreenshot);

        const clearBtn = makeButton("🧹 Clear");
        clearBtn.addEventListener("click", clearLogs);

        buttonsRow1.appendChild(exportBtn);
        buttonsRow1.appendChild(incidentBtn);
        buttonsRow2.appendChild(screenshotBtn);
        buttonsRow2.appendChild(clearBtn);

        uiRoot.appendChild(header);
        uiRoot.appendChild(stats);
        uiRoot.appendChild(buttonsRow1);
        uiRoot.appendChild(buttonsRow2);

        document.body.appendChild(uiRoot);
        updateUIStatus();
    }

    function updateUIStatus() {
        if (!uiRoot || !uiStatusBadge) return;

        const eventsSpan = uiRoot.querySelector("#bl-ai-events");
        const errorsSpan = uiRoot.querySelector("#bl-ai-errors");
        const netErrSpan = uiRoot.querySelector("#bl-ai-neterr");

        if (eventsSpan) {
            eventsSpan.textContent = `Events: ${state.counters.totalEvents}`;
        }
        if (errorsSpan) {
            errorsSpan.textContent = `Errors: ${state.counters.errors}`;
        }
        if (netErrSpan) {
            netErrSpan.textContent = `NetErr: ${state.network.errorCount}`;
        }

        const level = state.anomaly.level;
        if (level === "critical") {
            uiStatusBadge.textContent = "CRITICAL";
            uiStatusBadge.style.background = "rgba(220,30,80,0.22)";
            uiStatusBadge.style.border = "1px solid rgba(255,80,120,0.8)";
            uiStatusBadge.style.color = "#ffd6e0";
        } else if (level === "warning") {
            uiStatusBadge.textContent = "WARNING";
            uiStatusBadge.style.background = "rgba(240,180,50,0.22)";
            uiStatusBadge.style.border = "1px solid rgba(255,210,80,0.9)";
            uiStatusBadge.style.color = "#fff4cf";
        } else {
            uiStatusBadge.textContent = "NORMAL";
            uiStatusBadge.style.background = "rgba(50,200,120,0.18)";
            uiStatusBadge.style.border = "1px solid rgba(50,200,120,0.65)";
            uiStatusBadge.style.color = "#b7f5d2";
        }
    }

    function init() {
        if (state.initialized) return;
        state.initialized = true;

        loadFromStorage();
        setupErrorMonitoring();
        setupEventMonitoring();
        setupNetworkMonitoring();

        if (document.readyState === "complete") {
            captureInitialPerformance();
            startFPSTracking();
            createUI();
        } else {
            window.addEventListener("load", function () {
                captureInitialPerformance();
                startFPSTracking();
                createUI();
            });
        }

        const initLog = createLog(
            "system",
            "info",
            "BYLICKILABS AI Monitoring v1.0 initialisiert.",
            { config: { appName: CONFIG.appName, env: CONFIG.environment } }
        );
        addLog(initLog);
    }

    const PublicAPI = {
        config: CONFIG,
        init: init,
        getLogs: getLogs,
        clearLogs: clearLogs,
        exportLogs: exportLogs,
        exportIncidentReport: exportIncidentReport,
        captureScreenshot: captureScreenshot,
        getAnomalySummary: getAnomalySummary,
        logCustom: function (level, message, details) {
            const lvl = level || "info";
            const log = createLog("custom", lvl, message || "", details || {});
            addLog(log);
        }
    };

    window.BYLICKILABS_AI_MONITOR = PublicAPI;
    init();

})(window, document);