// ©Thorsten Bylicki | ©BYLICKILABS – CyberGuard WebLayer (ddos-guard.js)
// Website Protection
// Client-Side Throttling, Bot Detection & Headless Fingerprinting 
// v1.0.0

(function () {
    "use strict";

    const CONFIG = {
        windowMs: 60 * 1000,
        baseMaxRequests: 80,
        maxRequestsPenalty: {
            low: 0,
            medium: 20,
            high: 40
        },
        banMs: {
            low: 1 * 60 * 1000,
            medium: 3 * 60 * 1000,
            high: 5 * 60 * 1000
        },
        storageKey: "es_ddos_guard_state_v2",
        logging: {
            enabled: true,
            mode: "console",
            beaconUrl: "/es-ddos-log",
            localKey: "es_ddos_guard_logs",
            maxEntries: 50
        }
    };

    const CORRELATION_ID = (function () {
        try {
            const existing = sessionStorage.getItem("es_ddos_corr_id");
            if (existing) return existing;
            const id = Math.random().toString(36).slice(2, 10) + "-" + Date.now().toString(36);
            sessionStorage.setItem("es_ddos_corr_id", id);
            return id;
        } catch (e) {
            return "unknown";
        }
    })();


    const UA_PATTERNS = [
        "-", "0", "_", "ab/", "acunetix", "ahrefs", "ahrefsbot", "aiohttp", "akamai", "androidwebview", "apachebench", "appdynamics", "arachni", "attack", "aws-health", "baiduspider", "batch", "batch-download", "beam-us-up", "beautifulsoup", "binaryedge", "bingbot", "blazemeter",
        "blekkobot", "bombardier", "bot", "browserless", "bruteforce", "burp", "burpcrawler", "burpsuite", "censys", "cfnetwork", "circleci", "cloud-proxy", "cloudflare-diagnostic", "colly", "contact-scraper", "crawl", "crawler", "crawler4j", "crawling", "curl", "curl-lite", "curl/", "cypress",
        "data-miner", "data-scraper", "datadog", "datascraper", "detectify", "dirb", "dirbuster", "dirhunt", "dirsearch", "discordbot", "domaincrawler", "dotbot", "download", "downloader", "duckduckbot", "esp32httpclient", "esp8266httpclient", "exabot", "facebookexternalhit", "fastapi-client",
		"fetch", "fetch/", "ffuf", "fierce", "fierce-scanner", "fileget", "formgrabber", "forwarder", "gatling", "github-actions", "gitlab-runner", "go-http", "go-http-client", "goquery", "grab", "grabber", "greynoise", "grpc-go", "grpc-java", "headless", "headless firefox", "headless-khtml",
        "headless-shell", "headlesschrome", "heritrix", "hey/", "http.rb", "http4s", "httpclient", "httpcomponents", "httpfuzz", "httpie", "httprobe", "httptrace", "httpunit", "httpx", "httrack", "insomnia", "intelbot", "java", "java-http", "java/", "jenkins", "jsoup", "k6", "libcurl", "libfetch",
        "libwww", "linkdexbot", "linkpadbot", "linkwalker", "linux", "loaderio", "loadtest", "locust", "malicious", "maltego", "masscan", "mechanicalsoup", "mechanize", "megaindex", "metasploit", "mj12bot", "mojeekbot", "mozilla/4.0 (compatible)",
        "mozilla/5.0 (x11; linux x86_64) applewebkit/537.36", "nagios", "nessus", "netprobe", "netsparker", "newrelic", "newspaper", "newspaper3k", "nightwatch", "nikto", "nmap", "node-fetch", "null", "objective-c", "okhttp", "okhttp/2", "okhttp/3", "okhttp/4", "okhttps", "onpagebot",
        "openindexspider", "openproxy", "openvas", "oracle-uptime", "osint", "osint-scrape", "pagegrabber", "paros", "pattern-extractor", "pentest", "perl", "perl/", "phantom", "phantomjs", "php", "php/", "pingdom", "playwright", "powershell", "proxy", "proxy-service", "pycurl", "pypeteer",
        "pyspider", "python", "python-httplib", "python-httpx", "python-requests", "python-urllib", "python-urllib3", "python/", "quake", "qualys", "qwantbot", "rankactive", "rankranger", "recon", "recon-ng", "reconbot", "rest-assured", "restclient", "restsharp", "resttemplate", "retrofit", 
		"reverse-proxy","robotframework", "ruby", "ruby-http", "ruby/", "rust-client", "scanbot", "scanner", "screaming frog", "searchmetrics", "semrushbot", "sentrybot", "seo spider", "seoanalyzer", "seocheckbot", "seokicks", "serpstat", "seznambot", "shadowbrowser", "shodan", "siege", "sistrix", 
		"skipfish", "slimerjs", "sniper", "sogouspider", "spider", "spoof", "sqlmap", "sqlninja", "sslscan", "statuscake", "superagent", "supertest", "synthetic", "telegrambot", "theharvester", "tls-scan", "tor", "tor-exit", "tor-relay", "torbrowser", "trident", "tsung", "twitterbot", "unirest", 
		"unirest-java", "unknown", "uptimerobot", "urlgrabber", "urllib", "urllib3", "urlscanner", "vegeta", "vpn", "vpngate", "vscan", "vsdbot", "vtprobe", "w3af", "wapiti","wd/", "webcopier", "webdriver", "webdriverio", "webscraper", "wget", "wget-lite", "wget/", "whatweb", "winhttp", "wrk", "x11", 
		"xspider", "yandexbot", "yandeximages", "yandexmetrika", "yandexmobile", "zabbix", "zgrab", "zoomeye"
    ];


    function loadState() {
        try {
            const raw = localStorage.getItem(CONFIG.storageKey);
            if (!raw) return {};
            const parsed = JSON.parse(raw);
            return typeof parsed === "object" && parsed !== null ? parsed : {};
        } catch (e) {
            return {};
        }
    }

    function saveState(state) {
        try {
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(state || {}));
        } catch (e) {
        }
    }


    function logEvent(type, payload) {
        if (!CONFIG.logging.enabled || CONFIG.logging.mode === "silent") {
            return;
        }

        const entry = {
            type: type,
            ts: new Date().toISOString(),
            correlationId: CORRELATION_ID,
            payload: payload || {}
        };

        try {
            if (CONFIG.logging.mode === "console") {
                console.warn("[CyberGuard WebLayer DDoS Guard]", entry);
            } else if (CONFIG.logging.mode === "beacon" && typeof navigator.sendBeacon === "function" && CONFIG.logging.beaconUrl) {
                navigator.sendBeacon(CONFIG.logging.beaconUrl, JSON.stringify(entry));
            } else if (CONFIG.logging.mode === "local") {
                const key = CONFIG.logging.localKey;
                let existing = [];
                try {
                    existing = JSON.parse(localStorage.getItem(key) || "[]");
                    if (!Array.isArray(existing)) existing = [];
                } catch (e) {
                    existing = [];
                }
                existing.push(entry);
                if (existing.length > CONFIG.logging.maxEntries) {
                    existing = existing.slice(existing.length - CONFIG.logging.maxEntries);
                }
                localStorage.setItem(key, JSON.stringify(existing));
            }
        } catch (e) {
        }
    }

    function matchSuspiciousUserAgent(uaLower) {
        const hits = [];
        for (let i = 0; i < UA_PATTERNS.length; i++) {
            const p = UA_PATTERNS[i];
            if (uaLower.indexOf(p.toLowerCase()) !== -1) {
                hits.push(p);
            }
        }
        return hits;
    }

    function detectHeadlessFingerprint(uaLower) {
        let score = 0;
        const signals = [];

        try {
            if (navigator.webdriver) {
                score += 2;
                signals.push("navigator.webdriver === true");
            }

            if (navigator.plugins && navigator.plugins.length === 0) {
                score += 1;
                signals.push("navigator.plugins.length === 0");
            }

            if (navigator.languages && navigator.languages.length === 0) {
                score += 1;
                signals.push("navigator.languages.length === 0");
            }

            if (/(headless|phantomjs|slimerjs|ghost|electron)/i.test(uaLower)) {
                score += 2;
                signals.push("UA contains headless-related keyword");
            }

            if (typeof window !== "undefined" &&
                "chrome" in window &&
                uaLower.indexOf("headlesschrome") !== -1) {
                score += 2;
                signals.push("Chrome headless signature");
            }
        } catch (e) {
        }

        return { score, signals };
    }


    function computeRateScore(count, baseMax) {
        if (!baseMax || baseMax <= 0) return 0;
        const ratio = count / baseMax;
        if (ratio >= 1.0) return 3;
        if (ratio >= 0.8) return 2;
        if (ratio >= 0.5) return 1;
        return 0;
    }

    function evaluateThreat(state, uaLower) {
        const count = state.count || 0;
        const uaMatches = matchSuspiciousUserAgent(uaLower);
        const headless = detectHeadlessFingerprint(uaLower);
        const rateScore = computeRateScore(count, CONFIG.baseMaxRequests);

        const uaScore = Math.min(uaMatches.length, 3);
        const totalScore = uaScore + headless.score + rateScore;

        let level = "low";
        if (totalScore >= 5) {
            level = "high";
        } else if (totalScore >= 3) {
            level = "medium";
        }

        return {
            level,
            score: totalScore,
            rateScore,
            uaScore,
            uaMatches,
            headlessSignals: headless.signals
        };
    }

    function getEffectiveMaxRequests(level) {
        const penalty = CONFIG.maxRequestsPenalty[level] || 0;
        const max = CONFIG.baseMaxRequests - penalty;
        return max < 10 ? 10 : max;
    }

    function getBanDuration(level) {
        return CONFIG.banMs[level] || CONFIG.banMs.medium;
    }


    function showBlockScreen(message) {
        const msgDe = "Die CyberGuard WebLayer Protection hat deinen Zugriff " +
            "vorübergehend eingeschränkt. Bitte warte einen Moment und lade die Seite neu. " +
            "Bei fortbestehenden Problemen wende dich an den Admin\n\n";
        const msgEn = "The CyberGuard WebLayer protection has temporarily limited your access. " +
            "Please wait a moment and reload the page. If the issue persists, please contact Admin\n\n";

        const overlay = document.createElement("div");
        overlay.id = "es-ddos-guard-overlay";

        Object.assign(overlay.style, {
            position: "fixed",
            inset: "0",
            background: "radial-gradient(circle at top, #050614 0, #02030b 55%, #000 100%)",
            color: "#00f5ff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            padding: "2rem",
            zIndex: "99999",
            fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        });

        overlay.innerHTML = `
		<h1 style="font-size:1.6rem; margin-bottom:0.75rem;">
			CyberGuard WebLayer – Client-Side Protection
		</h1><br><br>

		<p style="max-width:36rem; font-size:0.95rem; opacity:0.9; line-height:1.5;">
			${message || (msgDe + "<br><br>" + msgEn)}
		</p>

		<p style="margin-top:1.5rem; font-size:0.75rem; opacity:0.7;">
			©Thorsten Bylicki | ©BYLICKILABS – CyberGuard WebLayer
		</p>

<p style="margin-top:1.2rem;">
    <a href="https://github.com/bylickilabs"
       target="_blank"
       rel="noopener noreferrer"
       style="
           display:inline-flex;
           align-items:center;
           gap:0.45rem;
           padding:0.55rem 1.1rem;
           background:#0d1117;
           border:1px solid #00f5ff;
           border-radius:8px;
           text-decoration:none;
           color:#00f5ff;
           font-weight:600;
           font-size:0.95rem;
           transition:all .22s ease;
       "
       onmouseover="this.style.background='#00f5ff'; this.style.color='#000';"
       onmouseout="this.style.background='#0d1117'; this.style.color='#00f5ff';"
    >
        <svg height="18" width="18" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 
            2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 
            0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52
            -.01-.53.63-.01 1.08.58 1.23.82.72 1.21 
            1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78
            -.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08
            -.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64
            -.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 
            2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51
            .56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65
            3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93
            -.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 
            8c0-4.42-3.58-8-8-8z"/>
        </svg>
        GitHub
    </a>
</p>

		`;


        const append = function () {
            if (!document.body) return;
            const existing = document.getElementById("es-ddos-guard-overlay");
            if (!existing) {
                document.body.appendChild(overlay);
            }
        };

        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", append);
        } else {
            append();
        }
    }


    try {
        const now = Date.now();
        let state = loadState();
        if (!state || typeof state !== "object") {
            state = {};
        }

        const ua = (navigator.userAgent || "");
        const uaLower = ua.toLowerCase();

        if (state.banUntil && now < state.banUntil) {
            logEvent("ban_active", {
                ua: ua,
                threatLevel: state.lastThreatLevel || "unknown",
                score: state.lastScore || 0,
                count: state.count || 0,
                windowStart: state.windowStart || null,
                banUntil: state.banUntil
            });
            showBlockScreen();
            return;
        }

        if (!state.windowStart || now - state.windowStart > CONFIG.windowMs) {
            state.windowStart = now;
            state.count = 0;
        }

        state.count = (state.count || 0) + 1;

        const threat = evaluateThreat(state, uaLower);
        const effectiveMax = getEffectiveMaxRequests(threat.level);
        const banMs = getBanDuration(threat.level);

        if (state.count > effectiveMax) {
            state.banUntil = now + banMs;
            state.lastThreatLevel = threat.level;
            state.lastScore = threat.score;
            saveState(state);

            logEvent("ban_set", {
                ua: ua,
                threatLevel: threat.level,
                score: threat.score,
                uaMatches: threat.uaMatches,
                headlessSignals: threat.headlessSignals,
                count: state.count,
                windowStart: state.windowStart,
                banUntil: state.banUntil,
                effectiveMax: effectiveMax
            });

            showBlockScreen();
            return;
        }

        state.lastThreatLevel = threat.level;
        state.lastScore = threat.score;
        saveState(state);

        if (threat.level !== "low") {
            logEvent("suspicious_activity", {
                ua: ua,
                threatLevel: threat.level,
                score: threat.score,
                uaMatches: threat.uaMatches,
                headlessSignals: threat.headlessSignals,
                count: state.count,
                windowStart: state.windowStart,
                effectiveMax: effectiveMax
            });
        }

    } catch (e) {
        try {
            console.error("[CyberGuard WebLayer] Runtime error", e);
        } catch (ignore) {
        }
    }

})();