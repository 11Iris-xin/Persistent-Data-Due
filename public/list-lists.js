const API_URL = 'http://localhost:3000/api';

const colorSchemes = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
];


const travelIcons = ['', '', '', '', '', '', '', '', '', '', '', ''];

const priorityTags = ['Top', 'Middle', 'Low'];
const priorityClasses = ['tag-top', 'tag-middle', 'tag-low'];

document.addEventListener('DOMContentLoaded', () => {
    loadLists();
    initializeTabs();
});


function initializeTabs() {
    const tabs = document.querySelectorAll('.tab-item');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
    
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

async function loadLists() {
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    const emptyState = document.getElementById('empty-state');
    const currentTripContainer = document.getElementById('current-trip-container');
    const upcomingTripsContainer = document.getElementById('upcoming-trips-container');

    loading.style.display = 'block';
    errorMessage.style.display = 'none';
    emptyState.style.display = 'none';
    currentTripContainer.innerHTML = '';
    upcomingTripsContainer.innerHTML = '';

    try {
        const response = await fetch(`${API_URL}/lists`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch lists');
        }

        const result = await response.json();
        const lists = result.data || result;

        loading.style.display = 'none';

        if (lists.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        const currentTrip = lists[0];
        const upcomingTrips = lists.slice(1);

        renderCurrentTrip(currentTrip, currentTripContainer);

        if (upcomingTrips.length > 0) {
            upcomingTrips.forEach((list, index) => {
                const tripCard = createNotionTripCard(list, index + 1);
                upcomingTripsContainer.appendChild(tripCard);
            });
        } else {
            upcomingTripsContainer.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                    <p style="font-size: 1.1rem;">No upcoming trips</p>
                    <button class="btn btn-primary" onclick="window.location.href='add-list.html'" style="margin-top: 1rem;">Plan Another Trip</button>
                </div>
            `;
        }

    } catch (error) {
        loading.style.display = 'none';
        errorMessage.textContent = `Error: ${error.message}. Make sure the backend server is running.`;
        errorMessage.style.display = 'block';
        console.error('Error loading lists:', error);
    }
}

function renderCurrentTrip(list, container) {
    const card = createNotionTripCard(list, 0, true);
    container.appendChild(card);
}

function createNotionTripCard(list, index, isLarge = false) {
    const card = document.createElement('div');
    card.className = 'trip-card-notion';
    
    const totalItems = list.items.length;
    const packedItems = list.items.filter(item => item.isPacked).length;
    const progress = totalItems > 0 ? Math.round((packedItems / totalItems) * 100) : 0;
    
    const createdDate = new Date(list.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    const colorScheme = colorSchemes[index % colorSchemes.length];
    const icon = travelIcons[index % travelIcons.length];
    const priorityIndex = Math.floor(Math.random() * 3);
    const priority = priorityTags[priorityIndex];
    const priorityClass = priorityClasses[priorityIndex];
    
    const duration = totalItems < 10 ? '1 Week' : totalItems < 20 ? '2 Weeks' : '3+ Weeks';
    
    card.innerHTML = `
        <div class="trip-card-image" style="background: ${colorScheme};">
            <span style="font-size: 4rem; z-index: 1;">${icon}</span>
        </div>
        
        <div class="trip-card-content">
            <div class="trip-card-header-notion">
                <span class="country-flag">🏴</span>
                <h3 class="country-name">${list.title}</h3>
            </div>
            
            <div class="trip-tags">
                <span class="trip-tag ${priorityClass}">${priority}</span>
            </div>
            
            <p class="trip-date">Created: ${createdDate}</p>
            
            <div class="trip-duration">
                <span>⏱️</span>
                <span>${duration}</span>
            </div>
            
            <div class="trip-progress-section">
                <div class="progress-label">
                    <span>Packing Progress</span>
                    <span style="font-weight: 600; color: var(--accent-purple);">${progress}%</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar-fill" style="width: ${progress}%;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; margin-top: 0.5rem; font-size: 0.75rem; color: var(--text-tertiary);">
                    <span>${packedItems} packed</span>
                    <span>${totalItems} total</span>
                </div>
            </div>
            
            <div class="trip-actions-notion">
                <button class="btn btn-secondary" onclick="viewList('${list._id}')">
                    <span>👁️</span> View
                </button>
                <button class="btn btn-primary" onclick="editList('${list._id}')">
                    <span>✏️</span> Edit
                </button>
                <button class="btn btn-danger" onclick="deleteList('${list._id}')">
                    <span>🗑️</span> Delete
                </button>
            </div>
        </div>
    `;
    
    return card;
}

function viewList(id) {
    window.location.href = `view-list.html?id=${id}`;
}

function editList(id) {
    window.location.href = `edit-list.html?id=${id}`;
}

async function deleteList(id) {
    if (!confirm('Are you sure you want to delete this packing list? All items will be deleted.')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/lists/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete list');
        }

        loadLists();
        
    } catch (error) {
        const errorMessage = document.getElementById('error-message');
        errorMessage.textContent = `Error: ${error.message}`;
        errorMessage.style.display = 'block';
        console.error('Error deleting list:', error);
    }
}