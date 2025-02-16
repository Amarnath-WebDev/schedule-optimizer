// app.js (Frontend)
function getVideoIdFromUrl(url) {
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('youtube.com')) {
            return urlObj.searchParams.get('v');
        } else if (urlObj.hostname.includes('youtu.be')) {
            return urlObj.pathname.substring(1);
        }
    } catch (e) {
        return null;
    }
    return null;
}

function fetchStats() {
    const videoUrl = document.getElementById('videoUrl').value;
    const videoId = getVideoIdFromUrl(videoUrl);
    
    if (!videoUrl) {
        alert('Please enter a YouTube video URL');
        return;
    }
    
    if (!videoId) {
        alert('Invalid YouTube URL. Please enter a valid YouTube video URL');
        return;
    }

    getVideoStats(videoId);
    updateVideoPreview(videoId);
}

function updateVideoPreview(videoId) {
    const previewHtml = `
        <iframe 
            width="100%" 
            height="315" 
            src="https://www.youtube.com/embed/${videoId}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen
            style="border-radius: 8px; margin: 20px 0;">
        </iframe>
    `;
    document.getElementById('videoPreview').innerHTML = previewHtml;
}

async function getVideoStats(videoId) {
    try {
        console.log('Fetching stats for video ID:', videoId);
        const response = await fetch(`/api/video-stats/${videoId}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${errorData.error} (${errorData.details || 'No details'})`);
        }
        
        const data = await response.json();
        console.log('Received data:', data);

        // Check if we have valid data
        if (!data.items || data.items.length === 0) {
            throw new Error('Video not found');
        }

        const statistics = data.items[0].statistics;
        if (!statistics) {
            throw new Error('No statistics available for this video');
        }

        updateDashboard(data.items[0]);
    } catch (error) {
        console.error('Detailed error:', error);
        alert(`Error: ${error.message}`);
        // Clear previous stats
        clearDashboard();
    }
}

function updateDashboard(videoData) {
    const stats = videoData.statistics;
    document.getElementById('viewCount').innerHTML = 
        `<i class="fas fa-eye"></i> Views: ${Number(stats.viewCount || 0).toLocaleString()}`;
    document.getElementById('likeCount').innerHTML = 
        `<i class="fas fa-thumbs-up"></i> Likes: ${Number(stats.likeCount || 0).toLocaleString()}`;
    document.getElementById('commentCount').innerHTML = 
        `<i class="fas fa-comments"></i> Comments: ${Number(stats.commentCount || 0).toLocaleString()}`;
}

function clearDashboard() {
    document.getElementById('viewCount').innerHTML = '';
    document.getElementById('likeCount').innerHTML = '';
    document.getElementById('commentCount').innerHTML = '';
}

// Add this function to convert 24h to 12h format
function convertTo12Hour(time24h) {
    const [hours, minutes] = time24h.split(':');
    let period = 'AM';
    let hours12 = parseInt(hours);
    
    if (hours12 >= 12) {
        period = 'PM';
        if (hours12 > 12) {
            hours12 -= 12;
        }
    }
    if (hours12 === 0) {
        hours12 = 12;
    }
    
    return `${hours12}:${minutes} ${period}`;
}

// Update the displayAnalytics function
function displayAnalytics(data) {
    // Convert peak hours to 12-hour format
    const peakHours12h = data.peakHours.map(time => convertTo12Hour(time));
    
    // Update Best Time Display
    document.getElementById('bestTimeDisplay').innerHTML = `
        Weekday: ${data.bestTimes.weekday}<br>
        Weekend: ${data.bestTimes.weekend}
    `;

    // Update Peak Hours with 12-hour format
    document.getElementById('peakHoursDisplay').innerHTML = 
        peakHours12h.join('<br>');

    // Update Best Days
    document.getElementById('engagementDisplay').innerHTML = 
        data.bestDays.join('<br>');

    // Update Timezone Analysis
    document.getElementById('timezoneDisplay').innerHTML = `
        ${data.timezones.primary}<br>
        ${data.timezones.secondary}
    `;

    // Generate calendar
    generateScheduleCalendar(data);
}

function generateScheduleCalendar(data) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const calendar = document.getElementById('scheduleCalendar');
    calendar.innerHTML = '';

    // Create day headers
    days.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-header';
        dayHeader.innerHTML = `<strong>${day}</strong>`;
        calendar.appendChild(dayHeader);
    });

    // Create time slots
    days.forEach(day => {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'calendar-slot';
        const isBestDay = data.bestDays.includes(day);
        timeSlot.innerHTML = isBestDay ? 
            `<span class="recommended">✓ ${data.bestTimes.weekday}</span>` : 
            '-';
        calendar.appendChild(timeSlot);
    });
}

// Update sample data to include both formats
const sampleAnalytics = {
    bestTimes: {
        weekday: '3:00 PM - 6:00 PM',
        weekend: '1:00 PM - 4:00 PM'
    },
    peakHours: ['14:00', '15:00', '16:00', '17:00'],
    bestDays: ['Wednesday', 'Saturday', 'Sunday'],
    timezones: {
        primary: 'EST (40% audience)',
        secondary: 'PST (25% audience)'
    }
};

function analyzeChannel() {
    const channelUrl = document.getElementById('channelUrl').value;
    
    if (!channelUrl) {
        alert('Please enter a YouTube channel URL');
        return;
    }

    // Simulate API call and data processing
    setTimeout(() => {
        displayAnalytics(sampleAnalytics);
    }, 1500);
}

// Mobile menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenu = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    
    mobileMenu.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Highlight active nav item on scroll
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 60) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href').slice(1) === current) {
                item.classList.add('active');
            }
        });
    });
});

// Analytics and Schedule Optimization
class ContentScheduler {
    constructor() {
        this.timeSlots = [];
        this.analytics = {};
        this.bestTimes = {};
    }

    analyzeChannel(channelData) {
        return {
            bestTimes: this.calculateBestTimes(channelData),
            audienceMetrics: this.analyzeAudience(channelData),
            engagementPatterns: this.analyzeEngagement(channelData),
            timeZoneDistribution: this.analyzeTimeZones(channelData)
        };
    }

    calculateBestTimes(data) {
        return {
            weekday: {
                morning: '9:00 AM - 11:00 AM',
                afternoon: '2:00 PM - 4:00 PM',
                evening: '7:00 PM - 9:00 PM'
            },
            weekend: {
                morning: '10:00 AM - 12:00 PM',
                afternoon: '3:00 PM - 5:00 PM',
                evening: '8:00 PM - 10:00 PM'
            }
        };
    }

    analyzeAudience(data) {
        return {
            demographics: {
                age: ['18-24', '25-34', '35-44'],
                regions: ['North America', 'Europe', 'Asia'],
                devices: ['Mobile', 'Desktop', 'Tablet']
            },
            engagement: {
                avgWatchTime: '8:45',
                retentionRate: '64%',
                interactionRate: '7.2%'
            }
        };
    }

    analyzeEngagement(data) {
        return {
            likes: '12K',
            comments: '3.2K',
            shares: '2.5K',
            avgViewDuration: '6:45'
        };
    }

    analyzeTimeZones(data) {
        return {
            primary: 'EST (40%)',
            secondary: 'PST (25%)',
            others: 'GMT, IST (35%)'
        };
    }
}

// Initialize scheduler
const scheduler = new ContentScheduler();

function updateDashboard(analysis) {
    // Update Analytics Grid
    const analyticsGrid = document.querySelector('.analytics-grid');
    analyticsGrid.innerHTML = `
        <div class="analytics-card">
            <h4><i class="fas fa-clock"></i> Best Posting Times</h4>
            <div class="card-content">
                <p><strong>Weekdays:</strong></p>
                <p>Morning: ${analysis.bestTimes.weekday.morning}</p>
                <p>Afternoon: ${analysis.bestTimes.weekday.afternoon}</p>
                <p>Evening: ${analysis.bestTimes.weekday.evening}</p>
                <p><strong>Weekends:</strong></p>
                <p>Morning: ${analysis.bestTimes.weekend.morning}</p>
                <p>Afternoon: ${analysis.bestTimes.weekend.afternoon}</p>
                <p>Evening: ${analysis.bestTimes.weekend.evening}</p>
            </div>
        </div>

        <div class="analytics-card">
            <h4><i class="fas fa-users"></i> Audience Demographics</h4>
            <div class="card-content">
                <p><strong>Age Groups:</strong> ${analysis.audienceMetrics.demographics.age.join(', ')}</p>
                <p><strong>Regions:</strong> ${analysis.audienceMetrics.demographics.regions.join(', ')}</p>
                <p><strong>Devices:</strong> ${analysis.audienceMetrics.demographics.devices.join(', ')}</p>
            </div>
        </div>

        <div class="analytics-card">
            <h4><i class="fas fa-chart-line"></i> Engagement Metrics</h4>
            <div class="card-content">
                <p><strong>Avg Watch Time:</strong> ${analysis.audienceMetrics.engagement.avgWatchTime}</p>
                <p><strong>Retention Rate:</strong> ${analysis.audienceMetrics.engagement.retentionRate}</p>
                <p><strong>Interaction Rate:</strong> ${analysis.audienceMetrics.engagement.interactionRate}</p>
            </div>
        </div>

        <div class="analytics-card">
            <h4><i class="fas fa-globe"></i> Time Zone Distribution</h4>
            <div class="card-content">
                <p><strong>Primary:</strong> ${analysis.timeZoneDistribution.primary}</p>
                <p><strong>Secondary:</strong> ${analysis.timeZoneDistribution.secondary}</p>
                <p><strong>Others:</strong> ${analysis.timeZoneDistribution.others}</p>
            </div>
        </div>
    `;
}

function analyzeChannel() {
    const channelUrl = document.getElementById('channelUrl').value;
    if (!channelUrl) {
        showNotification('Please enter a channel URL', 'error');
        return;
    }

    showLoadingState();
    
    // Simulate API call
    setTimeout(() => {
        const analysis = scheduler.analyzeChannel({
            // Sample data for demonstration
            viewership: [],
            engagement: [],
            audience: []
        });

        updateDashboard(analysis);
        hideLoadingState();
        showNotification('Analysis completed successfully', 'success');
    }, 2000);
}

function showLoadingState() {
    const button = document.querySelector('button');
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    button.disabled = true;
}

function hideLoadingState() {
    const button = document.querySelector('button');
    button.innerHTML = '<i class="fas fa-analytics"></i> Analyze Channel';
    button.disabled = false;
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Add show class for animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Add event listeners
    const analyzeButton = document.querySelector('button');
    if (analyzeButton) {
        analyzeButton.addEventListener('click', analyzeChannel);
    }
});

class VideoScheduler {
    constructor() {
        this.scheduledVideos = [];
    }

    addVideo(videoData) {
        this.scheduledVideos.push({
            id: Date.now(),
            ...videoData,
            status: 'scheduled'
        });
        this.updateScheduleDisplay();
        return true;
    }

    removeVideo(id) {
        this.scheduledVideos = this.scheduledVideos.filter(video => video.id !== id);
        this.updateScheduleDisplay();
    }

    updateScheduleDisplay() {
        const scheduleContainer = document.getElementById('scheduleCalendar');
        if (!scheduleContainer) return;

        scheduleContainer.innerHTML = `
            <div class="schedule-header">
                <h3>Scheduled Videos</h3>
                <button onclick="showScheduleForm()" class="add-video-btn">
                    <i class="fas fa-plus"></i> Schedule New Video
                </button>
            </div>
            <div class="scheduled-videos">
                ${this.scheduledVideos.map(video => `
                    <div class="video-card" data-id="${video.id}">
                        <div class="video-info">
                            <h4>${video.title}</h4>
                            <p><i class="far fa-clock"></i> ${video.date} at ${video.time}</p>
                            <p><i class="fas fa-tag"></i> ${video.category}</p>
                            <p class="status ${video.status}">${video.status}</p>
                        </div>
                        <div class="video-actions">
                            <button onclick="editScheduledVideo(${video.id})" class="edit-btn">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="removeScheduledVideo(${video.id})" class="delete-btn">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

const videoScheduler = new VideoScheduler();

function showScheduleForm() {
    const modal = document.createElement('div');
    modal.className = 'schedule-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Schedule New Video</h3>
            <form id="scheduleForm" onsubmit="handleScheduleSubmit(event)">
                <div class="form-group">
                    <label>Video Title</label>
                    <input type="text" name="title" required placeholder="Enter video title">
                </div>
                <div class="form-group">
                    <label>Video Description</label>
                    <textarea name="description" placeholder="Enter video description"></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Upload Date</label>
                        <input type="date" name="date" required min="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="form-group">
                        <label>Upload Time</label>
                        <input type="time" name="time" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Category</label>
                    <select name="category" required>
                        <option value="">Select Category</option>
                        <option value="Education">Education</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Gaming">Gaming</option>
                        <option value="Music">Music</option>
                        <option value="Tech">Tech</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Video File</label>
                    <input type="file" name="videoFile" accept="video/*">
                </div>
                <div class="form-group">
                    <label>Thumbnail</label>
                    <input type="file" name="thumbnail" accept="image/*">
                </div>
                <div class="form-actions">
                    <button type="button" onclick="closeModal()" class="cancel-btn">Cancel</button>
                    <button type="submit" class="submit-btn">Schedule Video</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
}

function closeModal() {
    const modal = document.querySelector('.schedule-modal');
    if (modal) {
        modal.remove();
    }
}

function handleScheduleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const videoData = {
        title: formData.get('title'),
        description: formData.get('description'),
        date: formData.get('date'),
        time: formData.get('time'),
        category: formData.get('category')
    };
    
    videoScheduler.addVideo(videoData);
    closeModal();
    showNotification('Video scheduled successfully!', 'success');
}

function removeScheduledVideo(id) {
    if (confirm('Are you sure you want to remove this scheduled video?')) {
        videoScheduler.removeVideo(id);
        showNotification('Video removed from schedule', 'success');
    }
}

function editScheduledVideo(id) {
    const video = videoScheduler.scheduledVideos.find(v => v.id === id);
    if (!video) return;

    showScheduleForm();
    const form = document.getElementById('scheduleForm');
    if (form) {
        form.title.value = video.title;
        form.description.value = video.description;
        form.date.value = video.date;
        form.time.value = video.time;
        form.category.value = video.category;
    }
}

// Contact Form Handler
class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.apiUrl = 'http://localhost:3000/api/contact'; // Update this with your server URL
        this.initializeForm();
    }

    initializeForm() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            console.log('Contact form initialized');
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        console.log('Form submission started');
        
        // Get form data
        const formData = new FormData(this.form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        };

        // Log the data being sent
        console.log('Sending data:', data);

        // Validate data
        if (!this.validateForm(data)) {
            showNotification('Please fill all fields correctly', 'error');
            return;
        }

        // Show loading state
        this.toggleLoadingState(true);

        try {
            // First, check if server is reachable
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data),
                mode: 'cors' // Enable CORS
            });

            // Log the response for debugging
            console.log('Server response:', response);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Response data:', result);

            if (result.success) {
                showNotification('Message sent successfully!', 'success');
                this.form.reset();
            } else {
                throw new Error(result.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Detailed error:', error);
            
            // More specific error messages
            let errorMessage = 'Failed to send message. ';
            if (error.message.includes('Failed to fetch')) {
                errorMessage += 'Server is not responding. Please check your connection.';
            } else if (error.message.includes('HTTP error')) {
                errorMessage += 'Server error occurred. Please try again later.';
            } else {
                errorMessage += error.message;
            }
            
            showNotification(errorMessage, 'error');
        } finally {
            this.toggleLoadingState(false);
        }
    }

    validateForm(data) {
        // Enhanced validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!data.name || data.name.trim().length < 2) {
            showNotification('Name must be at least 2 characters long', 'error');
            return false;
        }
        
        if (!data.email || !emailRegex.test(data.email)) {
            showNotification('Please enter a valid email address', 'error');
            return false;
        }
        
        if (!data.message || data.message.trim().length < 10) {
            showNotification('Message must be at least 10 characters long', 'error');
            return false;
        }
        
        return true;
    }

    toggleLoadingState(isLoading) {
        const submitBtn = this.form.querySelector('button[type="submit"]');
        if (isLoading) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
        } else {
            submitBtn.innerHTML = 'Send Message';
            submitBtn.disabled = false;
        }
    }
}

// Initialize contact form when document is ready
document.addEventListener('DOMContentLoaded', () => {
    new ContactForm();
    console.log('DOM loaded, initializing contact form');
});

// Authentication Functions
class Auth {
    constructor() {
        this.baseUrl = process.env.NODE_ENV === 'production' 
            ? 'https://your-backend-domain.onrender.com'
            : 'http://localhost:3000';
        this.signupForm = document.getElementById('signupForm');
        this.loginForm = document.getElementById('loginForm');
        this.initializeAuth();
        this.checkAuthStatus();
    }

    initializeAuth() {
        if (this.signupForm) {
            this.signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        }
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password')
        };

        try {
            const response = await fetch(`${this.baseUrl}/api/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Signup failed');
            }

            const result = await response.json();

            if (result.success) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                showNotification('Account created successfully!', 'success');
                window.location.href = '#dashboard';
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            showNotification(error.message || 'Error creating account', 'error');
            console.error('Signup error:', error);
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        try {
            const response = await fetch(`${this.baseUrl}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const result = await response.json();

            if (result.success) {
                localStorage.setItem('token', result.token);
                localStorage.setItem('user', JSON.stringify(result.user));
                showNotification('Logged in successfully!', 'success');
                window.location.href = '#dashboard';
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            showNotification(error.message || 'Error logging in', 'error');
            console.error('Login error:', error);
        }
    }

    checkAuthStatus() {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        const authLinks = document.getElementById('authLinks');
        const userMenu = document.getElementById('userMenu');
        const userUsername = document.getElementById('userUsername');

        if (token && user) {
            // User is logged in
            if (authLinks) authLinks.style.display = 'none';
            if (userMenu) {
                userMenu.style.display = 'flex';
                userUsername.textContent = user.username;
            }
            this.updateNavigation(true);
        } else {
            // User is logged out
            if (authLinks) authLinks.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
            this.updateNavigation(false);
        }
    }

    updateNavigation(isLoggedIn) {
        const dashboardLink = document.querySelector('a[href="#dashboard"]');
        const analyticsLink = document.querySelector('a[href="#analytics"]');
        
        if (dashboardLink) {
            dashboardLink.style.display = isLoggedIn ? 'block' : 'none';
        }
        if (analyticsLink) {
            analyticsLink.style.display = isLoggedIn ? 'block' : 'none';
        }
    }

    async handleLogout() {
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            showNotification('Logged out successfully', 'success');
            this.checkAuthStatus();
            window.location.href = '#home';
        } catch (error) {
            showNotification('Error logging out', 'error');
        }
    }
}

// Global logout handler
function handleLogout() {
    const auth = new Auth();
    auth.handleLogout();
}

// Update toggleAuth function
function toggleAuth(type) {
    const signupBox = document.getElementById('signupBox');
    const loginBox = document.getElementById('loginBox');
    
    if (type === 'login') {
        signupBox.style.display = 'none';
        loginBox.style.display = 'block';
        history.pushState(null, '', '#auth');
    } else {
        signupBox.style.display = 'block';
        loginBox.style.display = 'none';
        history.pushState(null, '', '#auth');
    }
}

// Add route protection
function checkAuth() {
    const token = localStorage.getItem('token');
    const protectedRoutes = ['#dashboard', '#analytics'];
    const currentHash = window.location.hash;

    if (protectedRoutes.includes(currentHash) && !token) {
        showNotification('Please login to access this page', 'error');
        window.location.href = '#auth';
        toggleAuth('login');
        return false;
    }
    return true;
}

// Add hash change listener
window.addEventListener('hashchange', () => {
    checkAuth();
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const auth = new Auth();
    checkAuth();
});