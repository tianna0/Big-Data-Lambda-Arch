document.getElementById('user-form').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent form submission

    const userId = document.getElementById('user_id').value;
    const apiUrl = `/api/user_behavior?user_id=${userId}`;

    try {
        // Fetch user data from the API
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }

        const userData = await response.json();

        // Display the data in the table
        document.getElementById('name').textContent = userData.name || '-';
        document.getElementById('email').textContent = userData.email_address || '-';
        document.getElementById('location').textContent = userData.location || '-';
        document.getElementById('subscription_plan').textContent = userData.subscription_plan || '-';
        document.getElementById('usage_frequency').textContent = userData.usage_frequency || '-';
        document.getElementById('days_to_expiry').textContent = userData.days_to_expiry || '-';
        document.getElementById('risk_level').textContent = userData.risk_level || '-';
        document.getElementById('favorite_genres').textContent = userData.favorite_genres || '-';
        document.getElementById('devices_used').textContent = userData.devices_used || '-';
        document.getElementById('personalized_recommendation').textContent = userData.personalized_recommendation || '-';
        document.getElementById('renew_count').textContent = userData.renew_count || '-';
        document.getElementById('cancel_count').textContent = userData.cancel_count || '-';

        // Show the user data container
        document.getElementById('user-data-container').style.display = 'block';
    } catch (error) {
        alert(error.message);
        console.error(error);
    }
});

document.getElementById('risk-level-form').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent default form submission

    const riskLevel = document.getElementById('risk_level').value;
    const apiUrl = `/api/risk-level-results?risk_level=${encodeURIComponent(riskLevel)}`;

    try {
        // Fetch users by risk level from the API
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }

        const data = await response.json();

        // Populate the results in the UI
        const userList = document.getElementById('user-list');
        userList.innerHTML = '';

        if (data.length > 0) {
            data.forEach(user => {
                const li = document.createElement('li');
                li.textContent = `User ID: ${user.user_id}, Name: ${user.name}, Email: ${user.email_address}`;
                userList.appendChild(li);
            });
        } else {
            userList.innerHTML = '<li>No users found for this risk level.</li>';
        }

        // Show the results container
        document.getElementById('risk-level-results').style.display = 'block';
    } catch (error) {
        alert(error.message);
        console.error(error);
    }
});

