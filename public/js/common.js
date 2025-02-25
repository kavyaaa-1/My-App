
  export async function loadNavBar() {
    const navBar = await fetch("navbar.html");
    const navBarData = await navBar.text();
    document.getElementById("nav-bar").innerHTML = navBarData;
  }

  export function displayDate() {
    const monthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    document.getElementById("date").innerText = `${monthsOfYear[month]} ${year}`;
}
