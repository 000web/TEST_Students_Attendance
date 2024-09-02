document.getElementById("date-range-form").addEventListener("submit", async function(e) {
    e.preventDefault(); // Prevent form submission from refreshing the page

    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;

    if (!startDate || !endDate) {
        alert("Please select both a start and end date.");
        return;
    }

    try {
        // Fetch attendance data from the Google Apps Script web app
        const url = `https://script.google.com/macros/s/AKfycbzAlOkHYDrZbe75BVvFA0QDYoK_ayMM0Hzn22hko8CpREUEZu2qNO3QDn15SYnFyNuNqA/exec?action=fetchAttendance&startDate=${startDate}&endDate=${endDate}`;
                     
        const response = await fetch(url);
        const data = await response.json();

        // Process the data and group by date
        const attendanceCount = data.reduce((acc, record) => {
            const date = record.date.split("T")[0]; // Only keep the date part (YYYY-MM-DD)
            acc[date] = (acc[date] || 0) + (record.status === "Present" ? 1 : 0);
            return acc;
        }, {});

        // Prepare the data for Chart.js
        const labels = Object.keys(attendanceCount); // The dates
        const values = Object.values(attendanceCount); // The number of present students

        // Render the chart
        renderChart(labels, values);
    } catch (error) {
        console.error("Error fetching attendance data:", error);
        alert("There was an error fetching the data. Please try again.");
    }
});

function renderChart(labels, values) {
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    if (window.attendanceChart) {
        window.attendanceChart.destroy(); // Destroy previous chart to avoid overlaps
    }
    window.attendanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels, // Dates
            datasets: [{
                label: 'Number of Students Present',
                data: values, // Attendance counts
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

//

//