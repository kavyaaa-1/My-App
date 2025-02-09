import { loadNavBar } from "./common.js";

document.addEventListener("DOMContentLoaded", async function() {
    displayDate();
    generateCalendar(); 
    await loadNavBar(); 
});

// Function to Update Clock Every Second
// function updateClock() {
//     const now = new Date();
//     const hours = String(now.getHours()).padStart(2, '0');
//     const minutes = String(now.getMinutes()).padStart(2, '0');
//     const seconds = String(now.getSeconds()).padStart(2, '0');
//     document.getElementById("clock").innerText = `${hours}:${minutes}:${seconds}`;
// }
// Function to Update Clock Every Second
function displayDate() {
    const monthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    document.getElementById("date").innerText = `${monthsOfYear[month]} ${year}`;
}

// Update the clock every second
setInterval(updateClock, 1000);

// Function to Add Task
function addTask(day) {
    const taskInput = document.getElementById(`task-input-${day}`);
    const taskText = taskInput.value.trim();

    if (taskText) {
        const taskList = document.getElementById(`tasks-${day}`);
        const taskDiv = document.createElement("div");
        taskDiv.textContent = taskText;
        taskList.appendChild(taskDiv);
        taskInput.value = ""; // Clear the input after adding the task
    } else {
        alert("Please enter a task!");
    }
}

// Function to Generate Calendar
function generateCalendar() {
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";
    const now = new Date();
    now.setHours(0,0,0,0)
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
        console.log("date", date);
        console.log(now);
        if (date < now) {
            div.classList.add("past-date");
        }

        // Add task input for each day
        const taskInputContainer = document.createElement("div");
        taskInputContainer.classList.add("input-container");
        taskInputContainer.innerHTML = `
            <input type="text" class="task-input" id="task-input-${i}" placeholder="Enter task" ${date < now ? "disabled" : ""}>
            <button class="add-btn" data-day="${i}" ${date < now ? "disabled" : ""}>Add</button>
            <div class="tasks" id="tasks-${i}"></div>
        `;
        
        div.appendChild(taskInputContainer);
        calendar.appendChild(div);
    }

    // Add event listeners for "Add" buttons
    const buttons = document.querySelectorAll('.add-btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const day = this.getAttribute('data-day');
            addTask(day);
        });
    });
}
