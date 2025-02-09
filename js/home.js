import { loadNavBar } from "./common.js";

document.addEventListener("DOMContentLoaded", async function() {
    await loadNavBar();
    updateClock(); // Start clock immediately
    generateCalendar(); // Generate calendar
});

// 🕰️ Function to Update Clock Every Second
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    document.getElementById("clock").innerText = `${hours}:${minutes}:${seconds}`;
}

// Update the clock every second
setInterval(updateClock, 1000);

// 📅 Function to Generate Calendar
function generateCalendar() {
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";
    
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Add Headers (Days of the Week)
    daysOfWeek.forEach(day => {
        const div = document.createElement("div");
        div.textContent = day;
        div.classList.add("day", "header");
        calendar.appendChild(div);
    });

    // Empty Slots for Days Before 1st of the Month
    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement("div");
        emptyDiv.classList.add("day");
        calendar.appendChild(emptyDiv);
    }

    // Fill Calendar with Dates
    for (let i = 1; i <= lastDate; i++) {
        const div = document.createElement("div");
        div.textContent = i;
        div.classList.add("day");
        // Mark past dates with a cross
        const date = new Date(year, month, i);
        if (date < now) {
            div.classList.add("past-date");  // Add a custom class for passed dates
        }
        calendar.appendChild(div);
    }
}
