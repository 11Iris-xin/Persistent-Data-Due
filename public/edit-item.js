const API_URL = "https://packing-organizer-xinyi.onrender.com/api";


const urlParams = new URLSearchParams(window.location.search);
const listId = urlParams.get('listId');
const itemId = urlParams.get('itemId');

const form = document.getElementById('edit-item-form');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const successMessage = document.getElementById('success-message');

if (!listId || !itemId) {
    errorMessage.textContent = 'Missing parameters.';
    errorMessage.style.display = 'block';
} else {
    loadItem();
}

async function loadItem() {
    loading.style.display = 'block';
    errorMessage.style.display = 'none';

    try {
        const response = await fetch(`${API_URL}/lists/${listId}`);

        if (!response.ok) {
            throw new Error('Failed to load item');
        }

        const result = await response.json();
        const list = result.data || result;
        
        const item = list.items.find(i => i._id === itemId);
        if (!item) {
            throw new Error('Item not found');
        }

        document.getElementById('itemName').value = item.itemName;
        document.getElementById('category').value = item.category;
        document.getElementById('isPacked').checked = item.isPacked;

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

    const itemName = document.getElementById('itemName').value.trim();
    const category = document.getElementById('category').value;
    const isPacked = document.getElementById('isPacked').checked;

    if (!itemName || !category) {
        errorMessage.textContent = 'Please fill in all required fields.';
        errorMessage.style.display = 'block';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/lists/${listId}/items/${itemId}`, {
            method: 'PATCH',
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
            throw new Error('Failed to update item');
        }

        successMessage.textContent = 'Item updated successfully! Redirecting...';
        successMessage.style.display = 'block';

        setTimeout(() => {
            window.location.href = `view-list.html?id=${listId}`;
        }, 1000);

    } catch (error) {
        errorMessage.textContent = `Error: ${error.message}. Make sure the backend server is running.`;
        errorMessage.style.display = 'block';
    }
});

async function deleteItem() {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/lists/${listId}/items/${itemId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete item');
        }

        successMessage.textContent = 'Item deleted successfully! Redirecting...';
        successMessage.style.display = 'block';

        setTimeout(() => {
            window.location.href = `view-list.html?id=${listId}`;
        }, 1000);

    } catch (error) {
        errorMessage.textContent = `Error: ${error.message}. Make sure the backend server is running.`;
        errorMessage.style.display = 'block';
    }
}

function goBack() {
    window.location.href = `view-list.html?id=${listId}`;
}
