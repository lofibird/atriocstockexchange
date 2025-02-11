const channelName = "atrioc";
const linkusChannel = "linkus7";
const clientId = "gp762nuuoqcoxypju8c569th9wz7q5";
const accessToken = "c2x7iu1o7uj3gag1hbk49phq1jc6jp";
const botUsername = "lofibirdbot";

// Stock prices
let glizzPrice = 100;
let coffeeCowPrice = 100;
let fmclPrice = 100;
let linkPrice = 100;

// Price history
let glizzPriceHistory = JSON.parse(localStorage.getItem("glizzPriceHistory")) || [{ time: new Date().toLocaleTimeString(), price: glizzPrice }];
let coffeeCowPriceHistory = JSON.parse(localStorage.getItem("coffeeCowPriceHistory")) || [{ time: new Date().toLocaleTimeString(), price: coffeeCowPrice }];
let fmclPriceHistory = JSON.parse(localStorage.getItem("fmclPriceHistory")) || [{ time: new Date().toLocaleTimeString(), price: fmclPrice }];
let linkPriceHistory = JSON.parse(localStorage.getItem("linkPriceHistory")) || [{ time: new Date().toLocaleTimeString(), price: linkPrice }];

// Stream status
let isLive = false;
let linkusLive = false;

// Check if Atrioc is live
async function checkLiveStatus() {
    console.log("Checking if Atrioc is live...");
    const url = `https://api.twitch.tv/helix/streams?user_login=${channelName}`;
   
    try {
        const response = await fetch(url, {
            headers: {
                "Client-ID": clientId,
                "Authorization": `Bearer ${accessToken}`
            }
        });
        const data = await response.json();
        isLive = data.data.length > 0;
        console.log("Live status:", isLive);
    } catch (error) {
        console.error("Error checking live status:", error);
    }
}

// Check if Linkus7 is live
async function checkLinkusLiveStatus() {
    console.log("Checking if Linkus7 is live...");
    const url = `https://api.twitch.tv/helix/streams?user_login=${linkusChannel}`;
   
    try {
        const response = await fetch(url, {
            headers: {
                "Client-ID": clientId,
                "Authorization": `Bearer ${accessToken}`
            }
        });
        const data = await response.json();
        linkusLive = data.data.length > 0;
        console.log("Linkus7 Live status:", linkusLive);
    } catch (error) {
        console.error("Error checking Linkus7 live status:", error);
    }
}

// Connect to Twitch chat
function connectToChat() {
    const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");
   
    socket.onopen = () => {
        console.log("Connected to Twitch chat");
        socket.send(`PASS oauth:${accessToken}`);
        socket.send(`NICK ${botUsername}`);
        socket.send(`JOIN #${channelName}`);
    };

    socket.onmessage = (event) => {
        console.log("Chat message received:", event.data);
        if (!isLive) return;

        const message = event.data.toLowerCase();
        if (message.includes("glizzy")) updatePrice("glizz");
        if (message.includes("coffee cow")) updatePrice("coffeeCow");
        if (message.includes("fmcl") || message.includes("chungus")) updatePrice("fmcl");
        if (message.includes("linkus7")) updatePrice("link", 5);
    };

    socket.onerror = (error) => console.error("Chat connection error:", error);
}

// Update price
function updatePrice(type, customIncrease = null) {
    const priceIncrease = customIncrease !== null ? customIncrease : (Math.random() * 1.75 + 0.25).toFixed(2);
   
    let price, priceHistory, priceElement;
   
    switch (type) {
        case "glizz":
            glizzPrice = (parseFloat(glizzPrice) + parseFloat(priceIncrease)).toFixed(2);
            price = glizzPrice;
            priceHistory = glizzPriceHistory;
            priceElement = "currentPrice";
            break;
        case "coffeeCow":
            coffeeCowPrice = (parseFloat(coffeeCowPrice) + parseFloat(priceIncrease)).toFixed(2);
            price = coffeeCowPrice;
            priceHistory = coffeeCowPriceHistory;
            priceElement = "coffeeCowPrice";
            break;
        case "fmcl":
            fmclPrice = (parseFloat(fmclPrice) + parseFloat(priceIncrease)).toFixed(2);
            price = fmclPrice;
            priceHistory = fmclPriceHistory;
            priceElement = "fmclPrice";
            break;
        case "link":
            linkPrice = (parseFloat(linkPrice) + parseFloat(priceIncrease)).toFixed(2);
            price = linkPrice;
            priceHistory = linkPriceHistory;
            priceElement = "linkPrice";
            break;
    }

    priceHistory.push({ time: new Date().toLocaleTimeString(), price });
    if (priceHistory.length > 20) priceHistory.shift();
    localStorage.setItem(`${type}PriceHistory`, JSON.stringify(priceHistory));

    document.getElementById(priceElement).innerText = `$${price}`;
    updateChart(type, priceHistory);
}

// Chart setup
const charts = {};

function createChart(chartId) {
    const ctx = document.getElementById(chartId).getContext("2d");
    return new Chart(ctx, {
        type: "line",
        data: {
            labels: [],
            datasets: [{
                label: `$${chartId.toUpperCase()} Price`,
                borderColor: "blue",
                borderWidth: 2,
                fill: false,
                data: []
            }]
        },
        options: {
            scales: {
                x: { type: "time", time: { unit: "minute" } },
                y: { beginAtZero: false }
            }
        }
    });
}

// Update chart function
function updateChart(type, priceHistory) {
    if (!charts[type]) charts[type] = createChart(`${type}Chart`);

    const chart = charts[type];
    chart.data.labels = priceHistory.map(entry => entry.time);
    chart.data.datasets[0].data = priceHistory.map(entry => entry.price);
    chart.update();
}

// Run updates every 60 seconds
setInterval(async () => {
    await checkLiveStatus();
    await checkLinkusLiveStatus();
    if (isLive) connectToChat();
    if (linkusLive) updatePrice("link", 0.50);
}, 60000);

// Initialize charts when page loads
document.addEventListener("DOMContentLoaded", () => {
    ["glizz", "coffeeCow", "fmcl", "link"].forEach(type => {
        updateChart(type, JSON.parse(localStorage.getItem(`${type}PriceHistory`)) || [{ time: new Date().toLocaleTimeString(), price: 100 }]);
    });
});


