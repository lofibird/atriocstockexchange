const channelName = "atrioc";
const clientId = "gp762nuuoqcoxypju8c569th9wz7q5";
const accessToken = "54bg1ejaca8l1f49iyudx3f4v3a239";
const botUsername = "lofibirdbot";
let glizzPrice = 100;
let priceHistory = JSON.parse(localStorage.getItem("glizzPriceHistory")) || [{ time: new Date().toLocaleTimeString(), price: glizzPrice }];
let isLive = false;

async function checkLiveStatus() {
    const url = `https://api.twitch.tv/helix/streams?user_login=${atrioc}`;
    const response = await fetch(url, {
        headers: {
            "Client-ID": clientId,
            "Authorization": `Bearer ${accessToken}`
        }
    });
    const data = await response.json();
    isLive = data.data.length > 0;
}

function connectToChat() {
    const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");
    socket.onopen = () => {
        socket.send("PASS oauth:" + accessToken);
        socket.send("NICK " + botUsername);
        socket.send(`JOIN #${channelName}`);
    };
    socket.onmessage = (event) => {
        if (!isLive) return;
        if (event.data.toLowerCase().includes("glizzy")) {
            updatePrice();
        }
    };
}

function updatePrice() {
    const priceIncrease = (Math.random() * 1.75 + 0.25).toFixed(2);
    glizzPrice = (parseFloat(glizzPrice) + parseFloat(priceIncrease)).toFixed(2);
    priceHistory.push({ time: new Date().toLocaleTimeString(), price: glizzPrice });
    if (priceHistory.length > 20) priceHistory.shift();
    localStorage.setItem("glizzPriceHistory", JSON.stringify(priceHistory));
    updateChart();
}

function updateChart() {
    const ctx = document.getElementById("glizzChart").getContext("2d");
    const prices = priceHistory.map(p => p.price);
    const times = priceHistory.map(p => p.time);
    const color = prices[prices.length - 1] > prices[prices.length - 2] ? "green" : "red";
    
    new Chart(ctx, {
        type: "line",
        data: {
            labels: times,
            datasets: [{
                label: "$GLIZZ Price",
                data: prices,
                borderColor: color,
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: { x: { display: true }, y: { display: true } }
        }
    });
}

setInterval(async () => {
    await checkLiveStatus();
    if (isLive) connectToChat();
}, 3000);

document.addEventListener("DOMContentLoaded", updateChart);
