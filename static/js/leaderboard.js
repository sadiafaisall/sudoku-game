/* ===================================================
    leaderboard.js
    Retrieves Leaderboard Entries from Local Storage
    Displays them in a Table
================================================== */
function loadLeaderboard() {

    // ✅ Apply saved theme
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        document.body.classList.add(savedTheme);
    }

    // ✅ Get the leaderboard data saved in localStorage
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    const tableBody = document.getElementById('leaderboard-body');

    // ✅ Clear the table first
    tableBody.innerHTML = '';

    // ✅ Populate the table
    leaderboard.forEach(entry => {
        const row = document.createElement('tr');

        const playerCell = document.createElement('td');
        playerCell.textContent = entry.name;

        const timeCell = document.createElement('td');
        timeCell.textContent = entry.time;

        const levelCell = document.createElement('td');
        levelCell.textContent = entry.level;

        row.appendChild(playerCell);
        row.appendChild(timeCell);
        row.appendChild(levelCell);

        tableBody.appendChild(row);
    });
}

// ✅ Call loadLeaderboard when page loads
window.addEventListener('DOMContentLoaded', loadLeaderboard);
