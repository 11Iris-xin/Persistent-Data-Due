const API_URL = 'http://localhost:3000/api';
let currentList = null;
let currentFilter = 'all';

const urlParams = new URLSearchParams(window.location.search);
const listId = urlParams.get('id');

const categoryColors = {
    'Clothing': '#3B82F6',
    'Toiletries': '#10B981',
    'Electronics': '#8B5CF6',
    'Documents': '#EF4444',
    'Accessories': '#F59E0B',
    'Other': '#6B7280'
};

document.addEventListener('DOMContentLoaded', () => {
    if (!listId) {
        alert('No list ID provided');
        window.location.href = 'list-lists.html';
        return;
    }
    loadList();
    setupFilterButtons();
    setupSearch();
});

async function loadList() {
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    const mainView = document.getElementById('main-view');

    loading.style.display = 'block';
    errorMessage.style.display = 'none';
    mainView.style.display = 'none';

    try {
        const response = await fetch(`${API_URL}/lists/${listId}`);
        
        if (!response.ok) {
            throw new Error('Failed to load list');
        }

        const result = await response.json();
        currentList = result.data || result;
        
        document.getElementById('list-title').textContent = currentList.title;
        
        loading.style.display = 'none';
        mainView.style.display = 'block';
        
        updateSummary();
        updateProgressDonut();
        renderCategories();
        renderItems();

    } catch (error) {
        loading.style.display = 'none';
        errorMessage.textContent = `Error: ${error.message}. Make sure the backend server is running.`;
        errorMessage.style.display = 'block';
        console.error('Error loading list:', error);
    }
}

function updateSummary() {
    const totalItems = currentList.items.length;
    const packedItems = currentList.items.filter(item => item.isPacked).length;
    
    document.getElementById('summary-items').textContent = `${totalItems} items total`;
    document.getElementById('summary-packed').textContent = `${packedItems} items packed`;
}

function updateProgressDonut() {
    const totalItems = currentList.items.length;
    const packedItems = currentList.items.filter(item => item.isPacked).length;
    const progress = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;
    
    const circle = document.getElementById('progress-circle');
    const circumference = 2 * Math.PI * 65; // 408.41
    const offset = circumference - (progress / 100) * circumference;
    
    circle.style.strokeDashoffset = offset;
    document.getElementById('progress-percent').textContent = `${progress}%`;
}

function renderCategories() {
    const categories = {};
    currentList.items.forEach(item => {
        const cat = item.category || 'Other';
        if (!categories[cat]) {
            categories[cat] = { total: 0, packed: 0 };
        }
        categories[cat].total++;
        if (item.isPacked) categories[cat].packed++;
    });
    
    const categoryList = document.getElementById('category-list');
    categoryList.innerHTML = Object.entries(categories).map(([name, counts]) => {
        const color = categoryColors[name] || categoryColors['Other'];
        return `
        <div class="category-item">
            <span>
                <span class="category-dot" style="background-color: ${color};"></span>
                ${name}
            </span>
            <span style="font-weight: 700; color: ${color};">${counts.packed}/${counts.total}</span>
        </div>
    `;
    }).join('');
}

function renderItems() {
    const container = document.getElementById('items-container');
    const emptyItems = document.getElementById('empty-items');
    
    let filteredItems = currentList.items;
    

    if (currentFilter !== 'all') {
        filteredItems = filteredItems.filter(item => item.category === currentFilter);
    }

    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    if (searchTerm) {
        filteredItems = filteredItems.filter(item => 
            item.itemName.toLowerCase().includes(searchTerm)
        );
    }
    
    if (filteredItems.length === 0) {
        container.style.display = 'none';
        emptyItems.style.display = 'block';
        return;
    }
    
    container.style.display = 'block';
    emptyItems.style.display = 'none';

    const grouped = {};
    filteredItems.forEach(item => {
        const cat = item.category || 'Other';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
    });
    
    container.innerHTML = Object.entries(grouped).map(([category, items]) => {
        const color = categoryColors[category] || categoryColors['Other'];
        return `
        <div class="category-section">
            <div class="category-header">
                <h3>
                    <span class="category-label" style="background-color: ${color};">${category}</span>
                </h3>
                <span class="category-badge" style="background-color: ${color};">${items.filter(i => i.isPacked).length}/${items.length}</span>
            </div>
            ${items.map(item => `
                <div class="item-row ${item.isPacked ? 'packed' : ''}">
                    <input 
                        type="checkbox" 
                        ${item.isPacked ? 'checked' : ''} 
                        onchange="togglePacked('${item._id}')"
                    >
                    <span class="item-name">${item.itemName}</span>
                    <div class="item-actions">
                        <button class="btn-icon" onclick="editItem('${item._id}')">Edit</button>
                        <button class="btn-icon btn-delete" onclick="deleteItem('${item._id}')">Delete</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    }).join('');
}

async function togglePacked(itemId) {
    const item = currentList.items.find(i => i._id === itemId);
    if (!item) return;
    
    try {
        const response = await fetch(`${API_URL}/lists/${listId}/items/${itemId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isPacked: !item.isPacked })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update item');
        }
        
        await loadList();
    } catch (error) {
        console.error('Error updating item:', error);
        document.getElementById('error-message').textContent = `Error: ${error.message}`;
        document.getElementById('error-message').style.display = 'block';
    }
}

function addItem() {
    window.location.href = `add-item.html?listId=${listId}`;
}

function editItem(itemId) {
    window.location.href = `edit-item.html?listId=${listId}&itemId=${itemId}`;
}

async function deleteItem(itemId) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
        const response = await fetch(`${API_URL}/lists/${listId}/items/${itemId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete item');
        }
        
        await loadList();
    } catch (error) {
        console.error('Error deleting item:', error);
        document.getElementById('error-message').textContent = `Error: ${error.message}`;
        document.getElementById('error-message').style.display = 'block';
    }
}

function editListTitle() {
    window.location.href = `edit-list.html?id=${listId}`;
}

function setupFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderItems();
        });
    });
}

function setupSearch() {
    document.getElementById('search-input').addEventListener('input', renderItems);
}