/* =============================================================
   ©Thorsten Bylicki | ©BYLICKILABS – Unified Security Framework  
   Version: 1.0.2
   ============================================================= */

(() => {
    'use strict';

    const html = document.documentElement;
    const blackout = document.getElementById('blackout');

    let securityLocked = false;
    let freezeLayer = null;

    const SECURITY_MESSAGE =
        "\n🔒 Zugriff verweigert 🔒\n\n" +
        "Unautorisierte Debugging - oder Analyseversuche wurden erkannt.\n\n" +
        "Unser Sicherheitsframework greift hier konsequent\n " +
        "- Integrität und Schutz stehen an erster Stelle.\n\n" +
        "©Thorsten Bylicki | ©BYLICKILABS\n" +
        "- https://github.com/bylickilabs";

    const isEditable = (el) => {
        if (!el) return false;
        if (el.isContentEditable) return true;
        const tag = el.tagName?.toLowerCase();
        return ['input','textarea','select'].includes(tag) ||
               el.getAttribute?.('role') === 'textbox';
    };

    const showBlackout = () => blackout?.classList.add('show');
    const hideBlackout = () => blackout?.classList.remove('show');
    const enableBlur = () => html.classList.add('sensitive-blur');
    const disableBlur = () => html.classList.remove('sensitive-blur');

    const guardActive = () => !securityLocked;

    function createFreezeLayer() {
        freezeLayer = document.createElement("div");
        Object.assign(freezeLayer.style, {
            position: "fixed",
            inset: "0",
            background: "#000",
            opacity: "1",
            pointerEvents: "all",
            zIndex: "999999999",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#00f5ff",
            fontFamily: "system-ui",
            textAlign: "center",
            padding: "2rem"
        });

        freezeLayer.innerHTML = `
            <div>
                <div style="font-size:1.6rem; margin-bottom:1rem;">
                    🔒 Sicherheitsmodus aktiviert
                </div>
                <div style="font-size:0.95rem; opacity:0.9;">
                    Die Oberfläche wurde aus Sicherheitsgründen gesperrt.
                </div>
                <div style="margin-top:1.2rem; opacity:0.5; font-size:0.8rem;">
                    ©BYLICKILABS – Unified Security Layer
                </div>
            </div>
        `;

        document.body.appendChild(freezeLayer);
    }

    function showSecurityPopup(after) {
        const popup = document.createElement("div");

        Object.assign(popup.style, {
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "#0a0a0a",
            color: "#00f5ff",
            padding: "2rem",
            borderRadius: "14px",
            boxShadow: "0 0 25px rgba(0,255,255,0.5)",
            border: "1px solid #00f5ff",
            zIndex: "999999998",
            textAlign: "center",
            fontFamily: "system-ui"
        });

        popup.innerHTML = `
            <h2 style="font-size:1.45rem; margin-bottom:1rem;">🔒 Sicherheitswarnung</h2>
            <p style="font-size:0.95rem; line-height:1.6; opacity:0.85;">
                Ein Debugging - oder Analyseversuch wurde erkannt.<br>
                Der Sicherheitsmodus wird nun aktiviert.
            </p>

            <button id="popup-ok-btn" 
                style="
                    margin-top:1.4rem;
                    padding:0.6rem 1.6rem;
                    font-size:1rem;
                    font-weight:bold;
                    color:#000;
                    background:#00f5ff;
                    border:none;
                    border-radius:6px;
                    cursor:pointer;
                ">
                OK
            </button>

            <p style="margin-top:1rem; font-size:0.75rem; opacity:0.4;">
                ©Thorsten Bylicki | ©BYLICKILABS – Unified Security Layer
            </p>
        `;

        document.body.appendChild(popup);

        document.getElementById("popup-ok-btn").onclick = () => {
            popup.remove();
            after();
        };
    }

    function activateSecurityLock(reason) {
        if (securityLocked) return;
        securityLocked = true;

        showSecurityPopup(() => {

            setTimeout(() => {
                alert(
                    SECURITY_MESSAGE +
                    (reason ? "\n\n[Erkannt: " + reason + "]" : "")
                );
            }, 30);

            setTimeout(() => {
                createFreezeLayer();
                showBlackout();
                enableBlur();
            }, 80);
        });
    }

    document.addEventListener('contextmenu', (e) => {
        if (!guardActive()) return e.preventDefault();
        if (!isEditable(e.target)) {
            e.preventDefault();
            showSecurityPopup(() => {});
        }
    }, { capture: true });

    document.addEventListener('selectstart', (e) => {
        if (!guardActive()) return e.preventDefault();
        if (!isEditable(e.target)) e.preventDefault();
    }, { capture: true });

    ['copy', 'cut', 'paste'].forEach(evt => {
        document.addEventListener(evt, (e) => {
            if (!guardActive()) return e.preventDefault();
            if (!isEditable(e.target)) e.preventDefault();
        }, { capture: true });
    });

    document.addEventListener('dragstart', (e) => {
        if (!guardActive()) return e.preventDefault();
        if (!isEditable(e.target)) e.preventDefault();
    }, { capture: true });

    document.addEventListener('keydown', (e) => {
        if (!guardActive()) return e.preventDefault();

        const key = (e.key || '').toLowerCase();
        const ctrlOrMeta = e.ctrlKey || e.metaKey;

        if (
            key === 'f12' ||
            (ctrlOrMeta && e.shiftKey && ['i','j','c'].includes(key)) ||
            (ctrlOrMeta && key === 'u')
        ) {
            e.preventDefault();
            activateSecurityLock("DevTools-Hotkey");
            return;
        }

        const blocked = new Set(['a','c','v','x','s','p']);
        if (ctrlOrMeta && blocked.has(key) && !isEditable(e.target)) {
            e.preventDefault();
            return;
        }
    }, { capture: true });

    document.addEventListener('keydown', (e) => {
        if (!guardActive()) return e.preventDefault();

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
            e.preventDefault();
            showSecurityPopup(() => {});
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!guardActive()) return e.preventDefault();

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
            e.preventDefault();
            showSecurityPopup(() => {});
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!guardActive()) return e.preventDefault();

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
            e.preventDefault();
            showSecurityPopup(() => {});
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!guardActive()) return e.preventDefault();

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
            e.preventDefault();
            showSecurityPopup(() => {});
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!guardActive()) return e.preventDefault();

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
            e.preventDefault();
            showSecurityPopup(() => {});
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!guardActive()) return e.preventDefault();

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'j') {
            e.preventDefault();
            showSecurityPopup(() => {});
        }
    });

    document.addEventListener('keydown', (e) => {
        if (!guardActive()) return e.preventDefault();

        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
            e.preventDefault();
            showSecurityPopup(() => {});
        }
    });

    window.addEventListener('beforeprint', () => {
        if (!guardActive()) return;
        showBlackout();
        html.classList.add("no-print");
    });

    window.addEventListener('afterprint', () => {
        if (!guardActive()) return;
        hideBlackout();
        html.classList.remove("no-print");
    });

    ['keydown', 'keyup'].forEach(evt => {
        document.addEventListener(evt, (e) => {
            if (!guardActive()) return e.preventDefault();

            if (
                e.key === "PrintScreen" ||
                e.code === "PrintScreen" ||
                e.keyCode === 44
            ) {
                e.preventDefault?.();
                showBlackout();
                setTimeout(hideBlackout, 4000);
            }
        });
    });

    window.addEventListener('blur', () => {
        if (!guardActive()) return;
        enableBlur();
        showBlackout();
    });

    window.addEventListener('focus', () => {
        if (!guardActive()) return;
        disableBlur();
        hideBlackout();
    });

    document.addEventListener('visibilitychange', () => {
        if (!guardActive()) return;

        if (document.hidden) {
            enableBlur();
            showBlackout();
        } else {
            disableBlur();
            hideBlackout();
        }
    });

    html.classList.add('wm-overlay');

    function debuggerTrap() {
        if (securityLocked) return;
        const start = performance.now();
        debugger;
        const diff = performance.now() - start;
        if (diff > 25) activateSecurityLock("Debugger/Tampering");
    }

    function dimensionDetection() {
        if (securityLocked) return;
        const t = 160;
        if (
            Math.abs(window.outerWidth - window.innerWidth) > t ||
            Math.abs(window.outerHeight - window.innerHeight) > t
        ) {
            activateSecurityLock("DevTools (Dimension)");
        }
    }

    function getterDetection() {
        if (securityLocked) return;
        const element = new Image();
        Object.defineProperty(element, "id", {
            get: () => activateSecurityLock("DevTools (Inspector)")
        });
        console.log(element);
    }

    setInterval(() => {
        debuggerTrap();
        dimensionDetection();
        getterDetection();
    }, 600);

})();