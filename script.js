const channelName = "atrioc";
const clientId = "gp762nuuoqcoxypju8c569th9wz7q5";  // Replace with your actual Twitch Client ID
const accessToken = "kbr6swl89bv97itcuukurnux1flnia"; // Replace with your actual Twitch OAuth Token
const botUsername = "lofibirdbot";

let glizzPrice = 100;
let priceHistory = JSON.parse(localStorage.getItem("glizzPriceHistory")) || [{ time: new Date().toLocaleTimeString(), price: glizzPrice }];
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
        if (event.data.toLowerCase().includes("glizzy")) {
            console.log("Glizzy detected!");
            updatePrice();
        }
    };
    socket.onerror = (error) => console.error("Chat connection error:", error);
}

function updatePrice() {
    console.log("Updating price...");
    const priceIncrease = (Math.random() * 1.75 + 0.25).toFixed(2);
    glizzPrice = (parseFloat(glizzPrice) + parseFloat(priceIncrease)).toFixed(2);
    priceHistory.push({ time: new Date().toLocaleTimeString(), price: glizzPrice });
    if (priceHistory.length > 20) priceHistory.shift();
    localStorage.setItem("glizzPriceHistory", JSON.stringify(priceHistory));
    console.log("New price:", glizzPrice);
    updateChart();
}

function updateChart() {
    console.log("Updating chart...");
    const ctx = document.getElementById("glizzChart").getContext("2d");
    if (!ctx) {
        console.error("Canvas element not found.");
        return;
    }
    const prices = priceHistory.map(p => p.price);
    const times = priceHistory.map(p => p.time);
    const color = prices.length > 1 && prices[prices.length - 1] > prices[prices.length - 2] ? "green" : "red";
    console.log("Chart data:", prices);
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
    document.getElementById("currentPrice").innerText = `$${glizzPrice}`;
}

setInterval(async () => {
    await checkLiveStatus();
    if (isLive) connectToChat();
}, 3000);

document.addEventListener("DOMContentLoaded", updateChart);

