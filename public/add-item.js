const API_URL = 'http://localhost:3000/api';

const urlParams = new URLSearchParams(window.location.search);
const listId = urlParams.get('listId');

const form = document.getElementById('add-item-form');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');

if (!listId) {
    errorMessage.textContent = 'No list ID provided.';
    errorMessage.style.display = 'block';
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';

    const itemName = document.getElementById('itemName').value.trim();
    const category = document.getElementById('category').value;
    const isPacked = document.getElementById('isPacked').checked;

    if (!itemName || !category) {
        errorMessage.textContent = 'Please fill in all required fields.';
        errorMessage.style.display = 'block';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/lists/${listId}/items`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                itemName,
                category,
                isPacked
            })
        });

        if (!response.ok) {
            throw new Error('Failed to add item');
        }

        successMessage.textContent = 'Item added successfully! Redirecting...';
        successMessage.style.display = 'block';

        setTimeout(() => {
            window.location.href = `view-list.html?id=${listId}`;
        }, 1000);

    } catch (error) {
        errorMessage.textContent = `Error: ${error.message}. Make sure the backend server is running.`;
        errorMessage.style.display = 'block';
    }
});

function goBack() {
    window.location.href = `view-list.html?id=${listId}`;
}
