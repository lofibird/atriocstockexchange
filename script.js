const channelName = "atrioc";
const linkusChannel = "linkus7";
const clientId = "gp762nuuoqcoxypju8c569th9wz7q5";
const accessToken = "c2x7iu1o7uj3gag1hbk49phq1jc6jp";
const botUsername = "lofibirdbot";

let glizzPrice = 100;
let coffeeCowPrice = 100;
let fmclPrice = 100;
let linkPrice = 100;
let glizzPriceHistory = JSON.parse(localStorage.getItem("glizzPriceHistory")) || [{ time: new Date().toLocaleTimeString(), price: glizzPrice }];
let coffeeCowPriceHistory = JSON.parse(localStorage.getItem("coffeeCowPriceHistory")) || [{ time: new Date().toLocaleTimeString(), price: coffeeCowPrice }];
let fmclPriceHistory = JSON.parse(localStorage.getItem("fmclPriceHistory")) || [{ time: new Date().toLocaleTimeString(), price: fmclPrice }];
let linkPriceHistory = JSON.parse(localStorage.getItem("linkPriceHistory")) || [{ time: new Date().toLocaleTimeString(), price: linkPrice }];
let isLive = false;
let linkusLive = false;

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
        if (message.includes("linkus7")) {
            console.log("Linkus7 detected!");
            updatePrice("link", 5);
        }
    };
    socket.onerror = (error) => console.error("Chat connection error:", error);
}

function updatePrice(type, customIncrease = null) {
    console.log(`Updating price for ${type}...`);
    const priceIncrease = customIncrease !== null ? customIncrease : (Math.random() * 1.75 + 0.25).toFixed(2);
    
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
    if (type === "link") {
        linkPrice = (parseFloat(linkPrice) + parseFloat(priceIncrease)).toFixed(2);
        linkPriceHistory.push({ time: new Date().toLocaleTimeString(), price: linkPrice });
        if (linkPriceHistory.length > 20) linkPriceHistory.shift();
        localStorage.setItem("linkPriceHistory", JSON.stringify(linkPriceHistory));
        document.getElementById("linkPrice").innerText = `$${linkPrice}`;
        updateChart("link");
    }
}

setInterval(async () => {
    await checkLiveStatus();
    await checkLinkusLiveStatus();
    if (isLive) connectToChat();
    if (linkusLive) updatePrice("link", 0.50);
}, 60000);

document.addEventListener("DOMContentLoaded", () => {
    updateChart("glizz");
    updateChart("coffeeCow");
    updateChart("fmcl");
    updateChart("link");
});



