import { loadNavBar, displayDate } from "./common.js";

document.addEventListener("DOMContentLoaded", async function() {
  checkLoginStatus();
  generateCalendar(); 
  await loadNavBar(); 
  displayDate();
  showPopup();
});
document.getElementById("toggle-tasks").addEventListener("change", function () {
  generateCalendar(); 
});


async function checkLoginStatus() { 
  const response = await fetch("https://planit-backend-drmi.onrender.com/api/check-auth", {credentials: "include"});
  const data = await response.json();
  console.log("checking login");
  if(!data.loggedIn){
      window.location.href = "index.html";
  }
}

function displayTasks(day, taskText, status, taskOwner) {
  const player = localStorage.getItem("username"); 
  const isOwner = taskOwner === player; // Check if task belongs to the user

  const taskList = document.getElementById(`tasks-${day}`);

  // Task container
  const taskDiv = document.createElement("div");
  taskDiv.classList.add("task-item");

  // Checkbox
  const checkbox = document.createElement("img");
  checkbox.src = status ? "./images/checked_icon.png" : "./images/unchecked_icon.png";
  checkbox.alt = status ? "Complete Task" : "Incomplete Task";
  checkbox.classList.add("task-icon");

  // Task Text
  const taskSpan = document.createElement("span");
  taskSpan.textContent = taskText;
  if (status) taskSpan.classList.add("completed");

  if (isOwner) {
    checkbox.addEventListener("click", async function () {
      status = !status;
      checkbox.src = status ? "./images/checked_icon.png" : "./images/unchecked_icon.png";
      taskSpan.classList.toggle("completed", status);

      const date = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${day}`;

      await fetch("https://planit-backend-drmi.onrender.com/update-task", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, task: taskText, status, player }),
      });

      let today = new Date().toISOString().split("T")[0];
      localStorage.removeItem("popup-shown-" + today);      
      checkTaskCompletion();
    });
  } else {
    checkbox.style.opacity = "0.3";
  }

  const deleteBtn = document.createElement("img");
    deleteBtn.src = "./images/remove_icon.png";
    deleteBtn.alt = "Delete Task";
    deleteBtn.classList.add("task-icon", "delete-btn");
  // Delete Button (Only for Owner)
  if (isOwner) {
    deleteBtn.addEventListener("click", async function () {
      const date = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${day}`;
      const response = await fetch("https://planit-backend-drmi.onrender.com/delete-task", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, task: taskText, player }),
      });
      if (response.ok) {
        taskDiv.remove();
      } else {
        alert("Failed to delete task");
      }
    });

  }else {
    deleteBtn.style.opacity = "0.3"; 
  }

  // Append elements to task container
  taskDiv.appendChild(checkbox);
  taskDiv.appendChild(taskSpan);
  taskList.appendChild(taskDiv);
  taskDiv.appendChild(deleteBtn);

}


// Function to add a new task
async function addTask(day) {
  const taskInput = document.getElementById(`task-input-${day}`);
  const taskText = taskInput.value.trim();
  const player = localStorage.getItem("username"); 

  if (taskText) {
    const date = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${day}`;

    const response = await fetch("https://planit-backend-drmi.onrender.com/save-task", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, task: taskText, status: false , player: player}),
    });
    
    if (response.ok) {
      displayTasks(day, taskText, false, player);
      taskInput.value = ""; // Clear input after adding task
      let today = new Date().toISOString().split("T")[0];
      localStorage.removeItem("popup-shown-" + today);
    } else {
      alert("Error in saving task");
    }
  } else {
    alert("Please enter a task!");
  }
}

async function loadTasks(day) {
  const date = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${day}`;
  const player = localStorage.getItem("username"); // Get current user
  const showMine = document.getElementById("toggle-tasks").checked;

  const response = await fetch(`https://planit-backend-drmi.onrender.com/get-tasks/${date}`);
  const data = await response.json();
  
  const taskList = document.getElementById(`tasks-${day}`);
  taskList.innerHTML = ""; // Clear previous tasks

  data.tasks.forEach(taskObj => {
    // Show only tasks based on toggle
    if ((showMine && taskObj.player === player) || (!showMine && taskObj.player !== player)) {
      displayTasks(day, taskObj.task, taskObj.status, taskObj.player);
    }
  });
  // ✅ Check task completion **only if loading today's tasks**
  const today = new Date();
  const todayDate = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  if (date === todayDate) {
    setTimeout(() => checkTaskCompletion(date), 500); // Slight delay to allow DOM update
  }
  // Update the toggle label text
  document.getElementById("toggle-label").textContent = showMine ? "My Tasks" : "Other's Tasks";
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
    if(date.getTime() == now.getTime()){
      div.classList.add("today");
    }else if (date < now) {
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


function showPopup() {
  console.log("Showing popup...");

  // Create overlay
  const overlay = document.createElement("div");
  overlay.id = "popup-overlay";
  overlay.classList.add("popup-overlay");

  // Create popup container
  const popup = document.createElement("div");
  popup.id = "celebration-popup";
  popup.classList.add("popup");

  const messages = JSON.parse(process.env.MESSAGES  || '["🎉 We did it!!"]');

  let randomMessage = messages[Math.floor(Math.random() * messages.length)];

  // Add content inside popup
  popup.innerHTML = `
  <div class="popup-content">
      <h2>Everything done !!</h2>
      <p>${randomMessage}</p>
      <img src="./images/celebration.gif" alt="Celebration GIF">
      <div class="popup-button-container">
          <button id="close-popup">Awesome</button>
      </div>
  </div>
`;


  // Append elements to body
  document.body.appendChild(overlay);
  document.body.appendChild(popup);

  // // 🎊 CONFETTI EFFECT - More fun!
  // setTimeout(() => {
  //   confetti({
  //     particleCount: 150,
  //     spread: 80,
  //     startVelocity: 50,
  //     scalar: 1.2,
  //     origin: { y: 0.7 }
  //   });
  // }, 300); // Small delay for better effect

  // Close button event
  document.getElementById("close-popup").addEventListener("click", function() {
    document.body.removeChild(popup);
    document.body.removeChild(overlay);
    let today = new Date().toISOString().split("T")[0];
    localStorage.setItem("popup-shown-" + today, "true");
  });
}

// Function to check if all tasks are completed
async function checkTaskCompletion(date) {
  console.log("Checking if all today's tasks are completed...");

  try {
      // Fetch tasks from the backend
      let response = await fetch(`https://planit-backend-drmi.onrender.com/get-tasks/${date}`);
      let data = await response.json();
      console.log("Fetched tasks:", data);

      if (!data.tasks || data.tasks.length === 0) return; // No tasks today

      // Check if all tasks are completed
      let allCompleted = data.tasks.every(task => task.status === true);
      if (allCompleted) {
          console.log("All today's tasks completed!");
          let today = new Date().toISOString().split("T")[0];
          let popupShown = localStorage.getItem("popup-shown-" + today);

          if (!popupShown) {
              showPopup();
          }
      }
  } catch (error) {
      console.error("Error fetching tasks:", error);
  }
}

