const API_URL = 'http://localhost:3000/api';

const urlParams = new URLSearchParams(window.location.search);
const listId = urlParams.get('id');

const form = document.getElementById('edit-list-form');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');

if (!listId) {
    errorMessage.textContent = 'No list ID provided.';
    errorMessage.style.display = 'block';
} else {
    loadList();
}

async function loadList() {
    loading.style.display = 'block';
    errorMessage.style.display = 'none';

    try {
        const response = await fetch(`${API_URL}/lists/${listId}`);

        if (!response.ok) {
            throw new Error('Failed to load list');
        }

        const result = await response.json();
        const list = result.data || result;

        document.getElementById('listTitle').value = list.title;

        loading.style.display = 'none';
        form.style.display = 'block';

    } catch (error) {
        loading.style.display = 'none';
        errorMessage.textContent = `Error: ${error.message}. Make sure the backend server is running.`;
        errorMessage.style.display = 'block';
    }
}

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
        const response = await fetch(`${API_URL}/lists/${listId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title })
        });

        if (!response.ok) {
            throw new Error('Failed to update list');
        }

        successMessage.textContent = 'List updated successfully! Redirecting...';
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
