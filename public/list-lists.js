const API_URL = "https://packing-organizer-xinyi.onrender.com/api";



const colorSchemes = [
  "linear-gradient(135deg, rgba(184, 149, 106, 0.6), rgba(160, 114, 78, 0.6)), url('/img/bg_1.jpeg')",
  "linear-gradient(135deg, rgba(206, 183, 179, 0.6), rgba(168, 187, 163, 0.6)), url('/img/bg_2.jpeg')",
  "linear-gradient(135deg, rgba(160, 114, 78, 0.6), rgba(184, 149, 106, 0.6)), url('/img/bg_3.jpeg')"
];


const travelIcons = [];

const priorityTags = ['Top', 'Middle', 'Low'];
const priorityClasses = ['tag-top', 'tag-middle', 'tag-low'];
const getPriorityIndex = (list) => {
    const totalItems = list.items.length;
    if (totalItems > 15) return 0;   
    if (totalItems > 8) return 1;  
    return 2;                     
};

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

function generateInitialIcons(lists) {
    return lists.map(list => {
        if (!list.title || list.title.trim() === '') {
            return '?';
        }
        return list.title.charAt(0).toUpperCase();
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

        travelIcons.length = 0;
        travelIcons.push(...generateInitialIcons(lists));

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
    
    const backgroundImage = colorSchemes[index % colorSchemes.length];
    const icon = travelIcons[index] || '?';

    const priorityIndex = getPriorityIndex(list);
    const priority = priorityTags[priorityIndex];
    const priorityClass = priorityClasses[priorityIndex];
    
    const duration = totalItems < 5 ? '1 Week' : totalItems < 10 ? '2 Weeks' : '3+ Weeks';
    
    card.innerHTML = `
        <div class="trip-card-image" style="background: ${backgroundImage}; background-size: cover; background-position: center; background-repeat: no-repeat;">
            <span style="font-size: 4rem; color: white; text-shadow: 2px 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5);">${icon}</span>
        </div>
        
        <div class="trip-card-content">
            <div class="trip-card-header-notion">
                <span class="country-flag"></span>
                <h3 class="country-name">${list.title}</h3>
            </div>
            
            <div class="trip-tags">
                <span class="trip-tag ${priorityClass}">${priority}</span>
            </div>
            
            <p class="trip-date">Created: ${createdDate}</p>
            
            <div class="trip-duration">
                <span>${duration}</span>
            </div>
            
            <div class="trip-progress-section">
                <div class="progress-label">
                    <span>Packing Progress</span>
                    <span style="font-weight: 600; color: var(--accent-primary);">${progress}%</span>
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
                    View
                </button>
                <button class="btn btn-primary" onclick="editList('${list._id}')">
                    Edit
                </button>
                <button class="btn btn-danger" onclick="deleteList('${list._id}')">
                    Delete
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