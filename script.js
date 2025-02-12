const charts = {};
const priceHistory = {
    glizz: [{ time: new Date().toLocaleTimeString(), price: 100 }],
    coffeeCow: [{ time: new Date().toLocaleTimeString(), price: 100 }],
    fmcl: [{ time: new Date().toLocaleTimeString(), price: 100 }],
    link: [{ time: new Date().toLocaleTimeString(), price: 100 }],
    htmn: [{ time: new Date().toLocaleTimeString(), price: 100 }],
    squx: [{ time: new Date().toLocaleTimeString(), price: 100 }] // Added SQUX
};
let isLive = false;
let linkusLive = false;
let squeexLive = false;

async function checkSqueexLiveStatus() {
    try {
        const response = await fetch(`https://api.twitch.tv/helix/streams?user_login=squeex`, {
            headers: {
                "Client-ID": "gp762nuuoqcoxypju8c569th9wz7q5",
                "Authorization": `Bearer c2x7iu1o7uj3gag1hbk49phq1jc6jp`
            }
        });
        const data = await response.json();
        squeexLive = data.data.length > 0;
    } catch (error) {
        console.error("Error checking Squeex live status:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    ["glizz", "coffeeCow", "fmcl", "link", "htmn", "squx"].forEach(type => updateChart(type, 100, 100));
    setInterval(async () => {
        await checkLiveStatus();
        await checkSqueexLiveStatus();
    }, 60000);
    setInterval(() => {
        ["glizz", "coffeeCow", "fmcl", "link", "htmn", "squx"].forEach(type => {
            const prevPrice = parseFloat(priceHistory[type].slice(-2, -1)[0]?.price || 100);
            const newPrice = parseFloat(priceHistory[type].slice(-1)[0].price);
            updateChart(type, prevPrice, newPrice);
        });
    }, 3000);
});
