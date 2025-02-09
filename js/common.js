
  export async function loadNavBar() {
    const navBar = await fetch("../navbar.html");
    const navBarData = await navBar.text();
    document.getElementById("nav-bar").innerHTML = navBarData;
  }

