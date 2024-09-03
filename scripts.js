document.getElementById("date-range-form").addEventListener("submit", async function(e) {
    e.preventDefault(); // Prevent form submission from refreshing the page

    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;

    if (!startDate || !endDate) {
        alert("Please select both a start and end date.");
        return;
    }

    try {
        // Construct the URL to fetch attendance data from the Google Apps Script
        const url = `https://script.google.com/macros/s/AKfycbwrx1TDYtzWpSiwTCDF4w1e0MsOxTtc6tVy9p7FbY5qc_Y-nRo36bQ5xHei6S9rZC7Tqg/exec?action=fetchAttendance&startDate=${startDate}&endDate=${endDate}`;
        
        // Fetch the attendance data
        const response = await fetch(url);

        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the response data as JSON
        const data = await response.json();

        // Process the data and group by date
        const attendanceCount = data.reduce((acc, record) => {
            const date = record.date.split("T")[0]; // Keep the date part (YYYY-MM-DD)
            acc[date] = (acc[date] || 0) + (record.status === "Present" ? 1 : 0);
            return acc;
        }, {});

        // Prepare data for Chart.js
        const labels = Object.keys(attendanceCount); // Dates
        const values = Object.values(attendanceCount); // Number of students present

        // Render the chart using the data
        renderChart(labels, values);
        
    } catch (error) {
        console.error("Error fetching attendance data:", error);
        alert("There was an error fetching the data. Please try again.");
    }
});

function renderChart(labels, values) {
    const ctx = document.getElementById('attendanceChart').getContext('2d');

    // Destroy previous chart instance if it exists
    if (window.attendanceChart && window.attendanceChart instanceof Chart) {
        window.attendanceChart.destroy();
    }

    // Create a new Chart.js instance
    window.attendanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels, // The dates
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
                    beginAtZero: true // Ensure the y-axis starts at 0
                }
            }
        }
    });
}
