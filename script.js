const channelName = "atrioc";
const clientId = "gp762nuuoqcoxypju8c569th9wz7q5";  // Replace with your actual Twitch Client ID
const accessToken = "kbr6swl89bv97itcuukurnux1flnia"; // Replace with your actual Twitch OAuth Token
const botUsername = "lofibirdbot";

let glizzPrice = 100;
let priceHistory = JSON.parse(localStorage.getItem("glizzPriceHistory")) || [{ time: new Date().toLocaleTimeString(), price: glizzPrice }];
let isLive = false;

// Check if Atrioc is live
async function checkLiveStatus() {
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
    } catch (error) {
        console.error("Error checking live status:", error);
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
        if (!isLive) return;
        if (event.data.toLowerCase().includes("glizzy")) {
            updatePrice();
        }
    };

    socket.onerror = (error) => console.error("Chat connection error:", error);
}

// Update the price when "Glizzy" is mentioned
function updatePrice() {
    const priceIncrease = (Math.random() * 1.75 + 0.25).toFixed(2);
    glizzPrice = (parseFloat(glizzPrice) + parseFloat(priceIncrease)).toFixed(2);
    priceHistory.push({ time: new Date().toLocaleTimeString(), price: glizzPrice });

    if (priceHistory.length > 20) priceHistory.shift();

    localStorage.setItem("glizzPriceHistory", JSON.stringify(priceHistory));
    updateChart();
}

// Update the chart display
function updateChart() {
    const ctx = document.getElementById("glizzChart").getContext("2d");

    if (!ctx) {
        console.error("Canvas element not found.");
        return;
    }

    const prices = priceHistory.map(p => p.price);
    const times = priceHistory.map(p => p.time);
    const color = prices.length > 1 && prices[prices.length - 1] > prices[prices.length - 2] ? "green" : "red";

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
            scales: { 
                x: { display: true }, 
                y: { display: true } 
            }
        }
    });
}

// Run live check and chat monitoring every 3 seconds
setInterval(async () => {
    await checkLiveStatus();
    if (isLive) connectToChat();
}, 3000);

// Ensure the chart is displayed when the page loads
document.addEventListener("DOMContentLoaded", updateChart);

