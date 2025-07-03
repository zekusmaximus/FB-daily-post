// Application State
let appState = {
    settings: {},
    status: {},
    isLoading: false
};

// DOM Elements
const elements = {
    settingsForm: document.getElementById('settingsForm'),
    saveBtn: document.getElementById('saveBtn'),
    testBtn: document.getElementById('testBtn'),
    saveSpinner: document.getElementById('saveSpinner'),
    testSpinner: document.getElementById('testSpinner'),
    lastPostTime: document.getElementById('lastPostTime'),
    serverStatus: document.getElementById('serverStatus'),
    configStatus: document.getElementById('configStatus'),
    activityList: document.getElementById('activityList'),
    toastContainer: document.getElementById('toastContainer'),
    loadingOverlay: document.getElementById('loadingOverlay')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadSettings();
    loadStatus();
    
    // Refresh status every 30 seconds
    setInterval(loadStatus, 30000);
});

// Initialize Application
function initializeApp() {
    console.log('Social Media Publisher initialized');
    showToast('Application loaded successfully', 'success');
}

// Setup Event Listeners
function setupEventListeners() {
    // Settings form submission
    elements.settingsForm.addEventListener('submit', handleSettingsSubmit);
    
    // Test button click
    elements.testBtn.addEventListener('click', handleTestPost);
    
    // Form input changes
    const inputs = elements.settingsForm.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', validateForm);
    });
}

// Handle Settings Form Submission
async function handleSettingsSubmit(event) {
    event.preventDefault();
    
    if (appState.isLoading) return;
    
    const formData = new FormData(elements.settingsForm);
    const settings = {
        prompt: formData.get('prompt')
    };
    
    setLoadingState(elements.saveBtn, elements.saveSpinner, true);
    
    try {
        const response = await fetch('/api/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(settings)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showToast('Settings saved successfully!', 'success');
            appState.settings = settings;
            loadStatus(); // Refresh status
        } else {
            throw new Error(result.message || 'Failed to save settings');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        showToast(`Error: ${error.message}`, 'error');
    } finally {
        setLoadingState(elements.saveBtn, elements.saveSpinner, false);
    }
}

// Handle Test Post
async function handleTestPost() {
    if (appState.isLoading) return;
    
    setLoadingState(elements.testBtn, elements.testSpinner, true);
    showLoadingOverlay(true);
    
    try {
        const response = await fetch('/api/test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showToast('Test post completed successfully!', 'success');
            loadStatus(); // Refresh status to show new activity
        } else {
            throw new Error(result.message || 'Test post failed');
        }
    } catch (error) {
        console.error('Error running test post:', error);
        showToast(`Test failed: ${error.message}`, 'error');
    } finally {
        setLoadingState(elements.testBtn, elements.testSpinner, false);
        showLoadingOverlay(false);
    }
}

// Load Settings from Server
async function loadSettings() {
    try {
        const response = await fetch('/api/settings');
        const settings = await response.json();
        
        if (response.ok) {
            // Populate form with existing settings (except sensitive data)
            if (settings.prompt) {
                document.getElementById('prompt').value = settings.prompt;
            }
            appState.settings = settings;
            validateForm();
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        showToast('Failed to load settings', 'error');
    }
}

// Load Status from Server
async function loadStatus() {
    try {
        const response = await fetch('/api/status');
        const status = await response.json();
        
        if (response.ok) {
            updateStatusDisplay(status);
            appState.status = status;
        } else {
            throw new Error('Failed to load status');
        }
    } catch (error) {
        console.error('Error loading status:', error);
        elements.serverStatus.textContent = 'Disconnected';
        elements.serverStatus.parentElement.parentElement.className = 'status-item error';
    }
}

// Update Status Display
function updateStatusDisplay(status) {
    // Update last post time
    if (status.lastSuccessfulPost) {
        const date = new Date(status.lastSuccessfulPost);
        elements.lastPostTime.textContent = formatDateTime(date);
    } else {
        elements.lastPostTime.textContent = 'Never';
    }
    
    // Update server status
    elements.serverStatus.textContent = 'Connected';
    
    // Update configuration status
    elements.configStatus.textContent = 'Protected';
    const configStatusItem = elements.configStatus.parentElement.parentElement;
    configStatusItem.className = 'status-item success';
    
    // Update activity log
    updateActivityLog(status.activityLog);
}

// Update Activity Log
function updateActivityLog(activities) {
    if (!activities || activities.length === 0) {
        elements.activityList.innerHTML = `
            <div class="activity-item placeholder">
                <i class="fas fa-info-circle"></i>
                <span>No activity yet</span>
            </div>
        `;
        return;
    }
    
    elements.activityList.innerHTML = activities.map(activity => {
        const statusClass = activity.status.toLowerCase();
        const icon = getStatusIcon(activity.status);
        const time = formatDateTime(new Date(activity.timestamp));
        
        return `
            <div class="activity-item ${statusClass}">
                <i class="${icon}"></i>
                <span>${activity.message}</span>
                <span class="activity-time">${time}</span>
            </div>
        `;
    }).join('');
}

// Get Status Icon
function getStatusIcon(status) {
    switch (status.toLowerCase()) {
        case 'success':
            return 'fas fa-check-circle';
        case 'error':
            return 'fas fa-exclamation-circle';
        case 'info':
            return 'fas fa-info-circle';
        default:
            return 'fas fa-circle';
    }
}

// Format Date Time
function formatDateTime(date) {
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Validate Form
function validateForm() {
    // No required fields for API keys anymore
    elements.saveBtn.disabled = false;
}

// Set Loading State
function setLoadingState(button, spinner, loading) {
    appState.isLoading = loading;
    
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// Show Loading Overlay
function showLoadingOverlay(show) {
    if (show) {
        elements.loadingOverlay.classList.add('show');
    } else {
        elements.loadingOverlay.classList.remove('show');
    }
}

// Show Toast Notification
function showToast(message, type = 'info', duration = 5000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fas fa-check-circle' :
                 type === 'error' ? 'fas fa-exclamation-circle' :
                 'fas fa-info-circle';
    
    toast.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, duration);
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Error Handler
window.addEventListener('error', function(event) {
    console.error('Application error:', event.error);
    showToast('An unexpected error occurred', 'error');
});

// Handle network errors
window.addEventListener('online', function() {
    showToast('Connection restored', 'success');
    loadStatus();
});

window.addEventListener('offline', function() {
    showToast('Connection lost', 'error');
});

