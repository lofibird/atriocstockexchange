const charts = {};
const priceHistory = {
    glizz: [{ time: new Date().toLocaleTimeString(), price: 100 }],
    coffeeCow: [{ time: new Date().toLocaleTimeString(), price: 100 }],
    fmcl: [{ time: new Date().toLocaleTimeString(), price: 100 }],
    link: [{ time: new Date().toLocaleTimeString(), price: 100 }]
};
let isLive = false;
let linkusLive = false;

function updatePrice(type, customIncrease = null) {
    const priceIncrease = customIncrease !== null ? customIncrease : (Math.random() * 1.75 + 0.25).toFixed(2);
    const prevPrice = parseFloat(priceHistory[type].slice(-1)[0].price);
    const newPrice = (prevPrice + parseFloat(priceIncrease)).toFixed(2);
    const time = new Date().toLocaleTimeString();
    
    priceHistory[type].push({ time, price: newPrice });
    if (priceHistory[type].length > 20) priceHistory[type].shift();
    
    document.getElementById(`${type}Price`).innerText = `$${newPrice}`;

    updateChart(type, prevPrice, newPrice);
}

function updateChart(type, prevPrice, newPrice) {
    const ctx = document.getElementById(`${type}Chart`).getContext("2d");
    const history = priceHistory[type];

    const color = newPrice > prevPrice ? 'green' : 'red';

    if (charts[type]) {
        charts[type].data.labels = history.map(entry => entry.time);
        charts[type].data.datasets[0].data = history.map(entry => entry.price);
        charts[type].data.datasets[0].borderColor = color;
        charts[type].update();
    } else {
        charts[type] = new Chart(ctx, {
            type: "line",
            data: {
                labels: history.map(entry => entry.time),
                datasets: [{
                    data: history.map(entry => entry.price),
                    borderColor: color,
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1
                }]
            },
            options: {
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: value => `$${value.toFixed(2)}`
                        }
                    }
                }
            }
        });
    }
    applyMarketStatus();
}

async function checkLiveStatus() {
    try {
        const response = await fetch(`https://api.twitch.tv/helix/streams?user_login=atrioc`, {
            headers: {
                "Client-ID": "gp762nuuoqcoxypju8c569th9wz7q5",
                "Authorization": `Bearer c2x7iu1o7uj3gag1hbk49phq1jc6jp`
            }
        });
        const data = await response.json();
        isLive = data.data.length > 0;
        applyMarketStatus();
    } catch (error) {
        console.error("Error checking live status:", error);
    }
}

async function checkLinkusLiveStatus() {
    try {
        const response = await fetch(`https://api.twitch.tv/helix/streams?user_login=linkus7`, {
            headers: {
                "Client-ID": "gp762nuuoqcoxypju8c569th9wz7q5",
                "Authorization": `Bearer c2x7iu1o7uj3gag1hbk49phq1jc6jp`
            }
        });
        const data = await response.json();
        linkusLive = data.data.length > 0;
    } catch (error) {
        console.error("Error checking Linkus7 live status:", error);
    }
}

function applyMarketStatus() {
    const chartsContainer = document.getElementById("chartsContainer");
    const overlayText = document.getElementById("marketOverlay");

    if (isLive) {
        chartsContainer.style.filter = "none";
        overlayText.style.display = "none";
    } else {
        chartsContainer.style.filter = "grayscale(100%)";
        overlayText.style.display = "block";
    }
}

function connectToChat() {
    const socket = new WebSocket("wss://irc-ws.chat.twitch.tv:443");

    socket.onopen = () => {
        console.log("Connected to Twitch chat");
        socket.send(`PASS oauth:c2x7iu1o7uj3gag1hbk49phq1jc6jp`);
        socket.send(`NICK lofibirdbot`);
        socket.send(`JOIN #atrioc`);
    };

    socket.onmessage = (event) => {
        if (!isLive) return;
        const message = event.data.toLowerCase();

        if (message.includes("glizzy")) updatePrice("glizz");
        if (message.includes("coffee cow")) updatePrice("coffeeCow");
        if (message.includes("fmcl") || message.includes("chungus")) updatePrice("fmcl");
        if (message.includes("linkus7")) updatePrice("link", 5);
    };

    socket.onerror = (error) => console.error("Chat connection error:", error);
}

document.addEventListener("DOMContentLoaded", () => {
    ["glizz", "coffeeCow", "fmcl", "link"].forEach(type => updateChart(type, 100, 100));

    setInterval(async () => {
        await checkLiveStatus();
        await checkLinkusLiveStatus();
        if (isLive) connectToChat();
        if (linkusLive) updatePrice("link", 0.50);
    }, 60000);

    setInterval(() => {
        ["glizz", "coffeeCow", "fmcl", "link"].forEach(type => {
            const prevPrice = parseFloat(priceHistory[type].slice(-2, -1)[0]?.price || 100);
            const newPrice = parseFloat(priceHistory[type].slice(-1)[0].price);
            updateChart(type, prevPrice, newPrice);
        });
    }, 3000);
});
// Initialize price history for $HTMN
priceHistory.htmn = [{ time: new Date().toLocaleTimeString(), price: 100 }];

function updateHTMNPrice() {
    const priceIncrease = (Math.random() * 1.75 + 0.25).toFixed(2);
    const prevPrice = parseFloat(priceHistory.htmn.slice(-1)[0].price);
    const newPrice = (prevPrice + parseFloat(priceIncrease)).toFixed(2);
    const time = new Date().toLocaleTimeString();
    
    priceHistory.htmn.push({ time, price: newPrice });
    if (priceHistory.htmn.length > 20) priceHistory.htmn.shift();
    
    document.getElementById(`htmnPrice`).innerText = `$${newPrice}`;
    updateChart('htmn', prevPrice, newPrice);
}

async function checkLiveStatus() {
    try {
        const response = await fetch(`https://api.twitch.tv/helix/streams?user_login=atrioc`, {
            headers: {
                "Client-ID": "gp762nuuoqcoxypju8c569th9wz7q5",
                "Authorization": `Bearer c2x7iu1o7uj3gag1hbk49phq1jc6jp`
            }
        });
        const data = await response.json();
        isLive = data.data.length > 0;
        const gameName = data.data[0]?.game_name?.toLowerCase();
        
        if (gameName && gameName.includes("hitman")) {
            setInterval(() => {
                updateHTMNPrice();
            }, 1000); // Update every second if the game is HITMAN
        }
        
        applyMarketStatus();
    } catch (error) {
        console.error("Error checking live status:", error);
    }
}

// Create the $HTMN chart
function updateChart(type, prevPrice, newPrice) {
    const ctx = document.getElementById(`${type}Chart`).getContext("2d");
    const history = priceHistory[type];

    const color = newPrice > prevPrice ? 'green' : 'red';

    if (charts[type]) {
        charts[type].data.labels = history.map(entry => entry.time);
        charts[type].data.datasets[0].data = history.map(entry => entry.price);
        charts[type].data.datasets[0].borderColor = color;
        charts[type].update();
    } else {
        charts[type] = new Chart(ctx, {
            type: "line",
            data: {
                labels: history.map(entry => entry.time),
                datasets: [{
                    data: history.map(entry => entry.price),
                    borderColor: color,
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1
                }]
            },
            options: {
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: value => `$${value.toFixed(2)}`
                        }
                    }
                }
            }
        });
    }
}

// Update the DOM after page load to include $HTMN chart
document.addEventListener("DOMContentLoaded", () => {
    ["glizz", "coffeeCow", "fmcl", "link", "htmn"].forEach(type => updateChart(type, 100, 100));
});
