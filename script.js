const tmi = require('tmi.js');
const axios = require('axios');
const fs = require('fs');

// Load saved stock price or set to $100.00 if not found
let stockPrice = parseFloat(fs.existsSync('stockPrice.json') ? JSON.parse(fs.readFileSync('stockPrice.json')) : 100.00);
let lastPrice = stockPrice;

const client = new tmi.Client({
  connection: {
    secure: true,
    reconnect: true,
  },
  identity: {
    username: 'lofibirdbot',  // Replace with your Twitch username
    password: 'ncertt6md03goww2u6s42jgeu175il',  // Replace with your Twitch OAuth token
  },
  channels: ['atrioc'],  // Replace with the streamer's channel you want to monitor
});

client.connect().catch((err) => {
  console.error('Error connecting to Twitch chat:', err);
  process.exit(1);  // Exit the process if we can't connect
});

// Function to check if Atrioc is live
async function checkIfAtriocIsLive() {
  try {
    const response = await axios.get('https://api.twitch.tv/helix/streams', {
      headers: {
        'Client-ID': 'gp762nuuoqcoxypju8c569th9wz7q5',  // Replace with your Twitch client ID
        'Authorization': 'Bearer ncertt6md03goww2u6s42jgeu175il',  // Replace with your Twitch OAuth token (include 'Bearer ' prefix)
      },
      params: {
        user_login: 'atrioc',  // This is the Twitch username for Atrioc
      },
    });

    // Check if Atrioc is live
    return response.data.data.length > 0;
  } catch (err) {
    console.error('Error checking live status:', err);
    return false;  // If there's an error, treat Atrioc as not live
  }
}

// Monitor Twitch chat for "Glizzy"
let glizzyCount = 0;
let lastGlizzyTime = Date.now();

client.on('message', (channel, userstate, message, self) => {
  if (self) return; // Ignore the bot's own messages
  if (message.toLowerCase().includes('glizzy')) {
    glizzyCount++;
    stockPrice += 1;
    lastGlizzyTime = Date.now();  // Reset the timer when Glizzy is mentioned
  }
});

// Function to update stock price
function updateStockPrice() {
  checkIfAtriocIsLive().then((isLive) => {
    if (!isLive) {
      console.log('Atrioc is not live, freezing stock price at:', stockPrice.toFixed(3));
      return;  // If Atrioc is not live, freeze the stock price
    }

    // Skewed random chance for stock price change (more likely to decrease)
    const changeDirection = Math.random() < 0.7 ? -1 : 1;  // 70% chance to decrease
    const changeAmount = Math.random() * 0.99;  // Maximum change of 0.99

    // Apply the price change, ensuring it is within the valid range
    stockPrice += changeDirection * changeAmount;
    stockPrice = parseFloat(stockPrice.toFixed(3));  // Round to 3 decimal places
    lastPrice = stockPrice;

    // Decrease price if "Glizzy" is not said for a while
    const timeSinceLastGlizzy = Date.now() - lastGlizzyTime;
    if (timeSinceLastGlizzy > 10000) { // 10 seconds without "Glizzy"
      stockPrice -= 0.001;
    }
    console.log(`Stock Price: $${stockPrice.toFixed(3)}`);
  }).catch((err) => {
    console.error('Error checking live status:', err);
  });
}

// Start the update cycle every second
setInterval(updateStockPrice, 1000);

// Save stock price to file on exit
process.on('exit', () => {
  fs.writeFileSync('stockPrice.json', JSON.stringify(stockPrice));
});
document.addEventListener("DOMContentLoaded", function() {
    const ctx = document.getElementById("stockChart").getContext("2d");
    const priceDisplay = document.getElementById("currentPrice"); // Reference to price display

    // Initial data
    let stockPrices = [100]; // Start at $100
    let timeLabels = [new Date().toLocaleTimeString()];
    const maxDataPoints = 20; // Keep only the last 20 points

    const stockChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: timeLabels,
            datasets: [{
                label: "$GLIZZ",
                data: stockPrices,
                borderColor: "green", // Default color
                backgroundColor: "rgba(0, 255, 0, 0.1)", // Default green fill
                borderWidth: 2,
                fill: true,
            }]
        },
        options: {
            animation: false, // Prevents lag over time
            plugins: {
                legend: { display: false } // Hides the legend
            },
            scales: {
                x: { title: { display: true, text: "Time" } },
                y: { title: { display: true, text: "Price ($)" } }
            }
        }
    });
