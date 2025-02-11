let glizzPrice = 100;
let coffeeCowPrice = 100;
let fmclPrice = 100;
let glizzPriceHistory = JSON.parse(localStorage.getItem("glizzPriceHistory")) || [{ time: new Date().toLocaleTimeString(), price: glizzPrice }];
let coffeeCowPriceHistory = JSON.parse(localStorage.getItem("coffeeCowPriceHistory")) || [{ time: new Date().toLocaleTimeString(), price: coffeeCowPrice }];
let fmclPriceHistory = JSON.parse(localStorage.getItem("fmclPriceHistory")) || [{ time: new Date().toLocaleTimeString(), price: fmclPrice }];
let isLive = false;

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
        if (message.includes("glizzy")) {
            console.log("Glizzy detected!");
            updatePrice("glizz");
        }
        if (message.includes("coffee cow")) {
            console.log("Coffee Cow detected!");
            updatePrice("coffeeCow");
        }
        if (message.includes("fmcl") || message.includes("chungus")) {
            console.log("FMCL detected!");
            updatePrice("fmcl");
        }
    };
    socket.onerror = (error) => console.error("Chat connection error:", error);
}

function updatePrice(type) {
    console.log(`Updating price for ${type}...`);
    const priceIncrease = (Math.random() * 1.75 + 0.25).toFixed(2);
    
    if (type === "glizz") {
        glizzPrice = (parseFloat(glizzPrice) + parseFloat(priceIncrease)).toFixed(2);
        glizzPriceHistory.push({ time: new Date().toLocaleTimeString(), price: glizzPrice });
        if (glizzPriceHistory.length > 20) glizzPriceHistory.shift();
        localStorage.setItem("glizzPriceHistory", JSON.stringify(glizzPriceHistory));
        document.getElementById("currentPrice").innerText = `$${glizzPrice}`;
        updateChart("glizz");
    }
    if (type === "coffeeCow") {
        coffeeCowPrice = (parseFloat(coffeeCowPrice) + parseFloat(priceIncrease)).toFixed(2);
        coffeeCowPriceHistory.push({ time: new Date().toLocaleTimeString(), price: coffeeCowPrice });
        if (coffeeCowPriceHistory.length > 20) coffeeCowPriceHistory.shift();
        localStorage.setItem("coffeeCowPriceHistory", JSON.stringify(coffeeCowPriceHistory));
        document.getElementById("coffeeCowPrice").innerText = `$${coffeeCowPrice}`;
        updateChart("coffeeCow");
    }
    if (type === "fmcl") {
        fmclPrice = (parseFloat(fmclPrice) + parseFloat(priceIncrease)).toFixed(2);
        fmclPriceHistory.push({ time: new Date().toLocaleTimeString(), price: fmclPrice });
        if (fmclPriceHistory.length > 20) fmclPriceHistory.shift();
        localStorage.setItem("fmclPriceHistory", JSON.stringify(fmclPriceHistory));
        document.getElementById("fmclPrice").innerText = `$${fmclPrice}`;
        updateChart("fmcl");
    }
}

function updateChart(type) {
    console.log(`Updating ${type} chart...`);
    const ctx = document.getElementById(`${type}Chart`).getContext("2d");
    if (!ctx) {
        console.error("Canvas element not found for", type);
        return;
    }
    
    const priceHistory = type === "glizz" ? glizzPriceHistory : type === "coffeeCow" ? coffeeCowPriceHistory : fmclPriceHistory;
    const prices = priceHistory.map(p => p.price);
    const times = priceHistory.map(p => p.time);
    const color = prices.length > 1 && prices[prices.length - 1] > prices[prices.length - 2] ? "green" : "red";
    
    new Chart(ctx, {
        type: "line",
        data: {
            labels: times,
            datasets: [{
                data: prices,
                borderColor: color,
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: { x: { display: true }, y: { display: true } },
            plugins: { legend: { display: false } }
        }
    });
}

setInterval(async () => {
    await checkLiveStatus();
    if (isLive) connectToChat();
}, 3000);

document.addEventListener("DOMContentLoaded", () => {
    updateChart("glizz");
    updateChart("coffeeCow");
    updateChart("fmcl");
});



