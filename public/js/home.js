import { loadNavBar, displayDate } from "./common.js";

document.addEventListener("DOMContentLoaded", async function() {
  checkLoginStatus();
  generateCalendar(); 
  await loadNavBar(); 
  displayDate();
});

async function checkLoginStatus() { 
  const response = await fetch("https://planit-backend-drmi.onrender.com/api/check-auth", {credentials: "include"});
  const data = await response.json();
  console.log("checking login");
  if(!data.loggedIn){
      window.location.href = "index.html";
  }
}

// Function to display tasks on the UI
function displayTasks(day, taskText, status) {
  const taskList = document.getElementById(`tasks-${day}`);

  // Create container for the task
  const taskDiv = document.createElement("div");
  taskDiv.classList.add("task-item");

  // Create checkbox icon (using image here)
  const checkbox = document.createElement("img");
  checkbox.src = status ? "./images/checked_icon.png" : "./images/unchecked_icon.png";
  checkbox.alt = status ? "Complete Task" : "Incomplete Task";
  checkbox.classList.add("task-icon");

  // Create the span for task text
  const taskSpan = document.createElement("span");
  taskSpan.textContent = taskText;
  if (status) taskSpan.classList.add("completed");

  // Event listener for toggling task completion
  checkbox.addEventListener("click", async function () {
    status = !status; // Toggle state
    checkbox.src = status ? "./images/checked_icon.png" : "./images/unchecked_icon.png";
    taskSpan.classList.toggle("completed", status);

    // Compute the date string in the same format used when saving the task
    const date = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${day}`;

    // Update task completion in backend using PATCH
    await fetch("https://planit-backend-drmi.onrender.com/update-task", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, task: taskText, status }),
    });
  });

  // Delete button (endpoint not defined in your server code yet)
  const deleteBtn = document.createElement("img");
  deleteBtn.src = "./images/remove_icon.png";
  deleteBtn.alt = "Delete Task";
  deleteBtn.classList.add("task-icon", "delete-btn");
  deleteBtn.addEventListener("click", async function () {
    const date = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${day}`;
    const response = await fetch("https://planit-backend-drmi.onrender.com/delete-task", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, task: taskText }),
    });
    if (response.ok) {
        taskDiv.remove();
      } else {
        alert("Failed to delete task");
      } // Remove task from UI
  });

  // Append elements to task container
  taskDiv.appendChild(checkbox);
  taskDiv.appendChild(taskSpan);
  taskDiv.appendChild(deleteBtn);
  taskList.appendChild(taskDiv);
}

// Function to add a new task
async function addTask(day) {
  const taskInput = document.getElementById(`task-input-${day}`);
  const taskText = taskInput.value.trim();

  if (taskText) {
    const date = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${day}`;

    const response = await fetch("https://planit-backend-drmi.onrender.com/save-task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Send status as false (meaning not completed)
      body: JSON.stringify({ date, task: taskText, status: false }),
    });
    
    if (response.ok) {
      displayTasks(day, taskText, false);
      taskInput.value = ""; // Clear input after adding task
    } else {
      alert("Error in saving task");
    }
  } else {
    alert("Please enter a task!");
  }
}

// Function to load tasks for a day
async function loadTasks(day) {
  const date = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${day}`;
  
  const response = await fetch(`https://planit-backend-drmi.onrender.com/get-tasks/${date}`);
  const data = await response.json();
  
  const taskList = document.getElementById(`tasks-${day}`); 
  taskList.innerHTML = ""; // Clear previous tasks
  // Ensure we use each task object's properties correctly
  data.tasks.forEach(taskObj => {
    displayTasks(day, taskObj.task, taskObj.status);
  });
}

// Function to generate the calendar UI
function generateCalendar() {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";
  const now = new Date();
  now.setHours(0,0,0,0);
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Add headers for days of the week
  daysOfWeek.forEach(day => {
    const div = document.createElement("div");
    div.textContent = day;
    div.classList.add("day", "header");
    calendar.appendChild(div);
  });

  // Create empty slots for days before the 1st of the month
  for (let i = 0; i < firstDay; i++) {
    const emptyDiv = document.createElement("div");
    emptyDiv.classList.add("day");
    calendar.appendChild(emptyDiv);
  }

  // Create each day of the month
  for (let i = 1; i <= lastDate; i++) {
    const div = document.createElement("div");
    div.textContent = i;
    div.classList.add("day");
    
    // Mark past dates visually if needed
    const date = new Date(year, month, i);
    if (date < now) {
      div.classList.add("past-date");
    }

    // Add task input and container for each day
    const taskInputContainer = document.createElement("div");
    taskInputContainer.classList.add("input-container");
    taskInputContainer.innerHTML = `
      <input type="text" class="task-input" id="task-input-${i}" placeholder="Enter task" ${date < now ? "disabled" : ""}>
      <button class="add-btn" data-day="${i}" ${date < now ? "disabled" : ""}>Add</button>
      <div class="tasks" id="tasks-${i}"></div>
    `;
    
    div.appendChild(taskInputContainer);
    calendar.appendChild(div);

    loadTasks(i);
  }

  // Attach event listeners to "Add" buttons
  const buttons = document.querySelectorAll('.add-btn');
  buttons.forEach(button => {
    button.addEventListener('click', function() {
      const day = this.getAttribute('data-day');
      addTask(day);
    });
  });
}
