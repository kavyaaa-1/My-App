document.querySelector(".login-form").addEventListener("submit", validateLogin);

async function validateLogin(event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
    });

    const data = await response.json();

    if (response.ok) {
        localStorage.setItem("username", username);
        window.location.href = "home.html";
    } else {
        document.getElementById("error-message").textContent = data.message;
    }
}

async function checkLoginStatus() { 
    const response = await fetch("http://localhost:5000/api/check-auth", {credentials: "include"});
    const data = await response.json();

    if(data.loggin){
        window.location.href = "home.html";
    }
}
checkLoginStatus();
