// --- 1. Weather Code Mapping (Required Function) ---
function mapWeatherCodeToDescription(code) {
    // This object maps the WMO Weather interpretation codes (WW) to a human-readable description
    const weatherDescriptions = {
        0: 'clear sky',
        1: 'mainly clear',
        2: 'partly cloudy',
        3: 'overcast',
        45: 'fog',
        48: 'depositing rime fog',
        51: 'drizzle: light',
        53: 'drizzle: moderate',
        55: 'drizzle: dense',
        56: 'freezing drizzle: light',
        57: 'freezing drizzle: dense',
        61: 'rain: slight',
        63: 'rain: moderate',
        65: 'rain: heavy',
        66: 'freezing rain: light',
        67: 'freezing rain: heavy',
        71: 'snow fall: slight',
        73: 'snow fall: moderate',
        75: 'snow fall: heavy',
        77: 'snow grains',
        80: 'rain showers: slight',
        81: 'rain showers: moderate',
        82: 'rain showers: violent',
        85: 'snow showers: slight',
        86: 'snow showers: heavy',
        95: 'thunderstorm: slight or moderate',
        96: 'thunderstorm with slight hail',
        99: 'thunderstorm with heavy hail'
    };
    return weatherDescriptions[code] || 'unknown weather';
}

// --- 2. Fetch Weather Data for Detroit (Required Function) ---
async function fetchWeather() {
    // Coordinates for Detroit, Michigan: latitude: 42.3314 and longitude: -83.0458
    const DETROIT_LAT = '42.3314';
    const DETROIT_LON = '-83.0458';
    const API_URL = `https://api.open-meteo.com/v1/forecast?latitude=${DETROIT_LAT}&longitude=${DETROIT_LON}&current_weather=true`;

    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        // Map the weather code from the API response to the description
        const weatherCode = data.current_weather.weathercode;
        return mapWeatherCodeToDescription(weatherCode);
    } catch (error) {
        console.error("Error fetching weather:", error);
        return 'weather data unavailable'; // Fallback message
    }
}

// --- 3. Get and Format Date/Time (Required Function) ---
function getCurrentDateTime() {
    const now = new Date();
    // Use 'America/New_York' for EST time zone
    const options = { timeZone: 'America/New_York' };

    // Time: 12-hour clock with AM/PM (e.g., 1:03:45 PM)
    const time = now.toLocaleTimeString('en-US', { ...options, hour12: true, second: '2-digit' });

    // Date: MM/DD/YYYY format
    const date = now.toLocaleDateString('en-US', options);

    // Get the hour (0-23) for the greeting message logic (e.g., 13)
    const hour = now.toLocaleString('en-US', { ...options, hour: 'numeric', hourCycle: 'h23' });
    
    return { time, date, hour: parseInt(hour) };
}

// --- 4. Main Update Function (Updates Greeting/Time/Weather) ---
async function updateWelcomeMessage() {
    const greetingEl = document.getElementById('greetingMessage');
    const userName = localStorage.getItem('userName') || 'Friend'; 

    // --- Time/Date Logic ---
    const { time, date, hour } = getCurrentDateTime(); 

    // Determine the greeting based on the hour
    let greetingPrefix;
    if (hour >= 5 && hour < 12) { // 5 AM to 11:59 AM
        greetingPrefix = "Good morning";
    } else if (hour >= 12 && hour < 18) { // 12 PM to 5:59 PM
        greetingPrefix = "Good afternoon";
    } else { // 6 PM to 4:59 AM
        greetingPrefix = "Good evening";
    }

    // --- Weather Logic ---
    const weatherDescription = await fetchWeather();
    
    // VVVV THIS IS THE CORRECTED LINE VVVV
    // It correctly uses the 'time' variable for the clock
    greetingEl.innerHTML = 
        `${greetingPrefix}, ${userName}! It's ${time} EST on ${date}, and it's ${weatherDescription} right now.`;
}

// --- 5. Last Visit Logic ---
function updateLastVisit() {
    const lastVisitEl = document.getElementById('lastVisitMessage');
    const LAST_VISIT_KEY = 'lastVisitTime';
    
    const lastVisitTime = localStorage.getItem(LAST_VISIT_KEY);
    
    if (lastVisitTime) {
        lastVisitEl.innerHTML = `Btw, you last visited on ${lastVisitTime}.`;
    } else {
        lastVisitEl.innerHTML = `Welcome! This looks like your first visit.`;
    }

    // Update the last visit time for the next session
    const now = new Date();
    // Get formatted time/date in EST for storage
    const formattedTime = now.toLocaleString('en-US', { 
        timeZone: 'America/New_York', 
        hour12: true, 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
    localStorage.setItem(LAST_VISIT_KEY, formattedTime);
}

// --- 6. Event Listeners and Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    const nameForm = document.getElementById('nameForm');
    const nameInput = document.getElementById('nameInput');
    
    // Set the input field if the name is already stored
    nameInput.value = localStorage.getItem('userName') || '';

    // Handle form submission to save the name
    nameForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent traditional form submission behavior
        
        const enteredName = nameInput.value.trim();
        if (enteredName) {
            localStorage.setItem('userName', enteredName); // Save the name to localStorage
            alert(`Hello, ${enteredName}! Your name has been saved.`);
            // Rerun the update to immediately show the personalized greeting
            updateWelcomeMessage(); 
        }
    });

    // Display Last Visit time
    updateLastVisit();

    // Initial run of the welcome message
    updateWelcomeMessage(); 
    
    // Update the message every second (1000 milliseconds)
    setInterval(updateWelcomeMessage, 1000); 
});
