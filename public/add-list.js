const API_URL = "https://packing-organizer-xinyi.onrender.com/api";


const form = document.getElementById('add-list-form');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');

document.getElementById('listTitle').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        form.dispatchEvent(new Event('submit'));
    }
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';

    const title = document.getElementById('listTitle').value.trim();

    if (!title) {
        errorMessage.textContent = 'Please enter a list name.';
        errorMessage.style.display = 'block';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/lists`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title })
        });

        if (!response.ok) {
            throw new Error('Failed to create list');
        }

        const result = await response.json();
        const listData = result.data || result;

        successMessage.textContent = 'List created successfully! Redirecting...';
        successMessage.style.display = 'block';

        setTimeout(() => {
            window.location.href = `view-list.html?id=${listData._id}`;
        }, 1000);

    } catch (error) {
        errorMessage.textContent = `Error: ${error.message}. Make sure the backend server is running.`;
        errorMessage.style.display = 'block';
    }
});
