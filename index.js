// API endpoint with CORS proxy
const API_URL = 'https://corsproxy.io/?https://echerga.mod.gov.ua/APPVER4/prelim/getWorkDaysFull/bc614fc7-14c1-4bbf-8a71-eb94ebd63eb0/89c431f6-f437-418d-a187-e3833edc518c';

// Fetch data from API
async function fetchData() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if (!data.isSucceeded) {
            throw new Error(data.errors.join(', '));
        }
        
        return data.result;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

// Process and display dates
function processData(dates) {
    // Normalize and sort dates in ascending order
    if (!Array.isArray(dates)) {
        dates = [];
    }
    dates.sort((a, b) => new Date(a.workDaySlot) - new Date(b.workDaySlot));

    // Calculate first/last date only if there are results
    let firstDateFormatted = null;
    let lastDateFormatted = null;
    if (dates.length > 0) {
        const firstDate = new Date(dates[0].workDaySlot);
        firstDateFormatted = firstDate.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const lastDate = new Date(dates[dates.length - 1].workDaySlot);
        lastDateFormatted = lastDate.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    // Create a map of available dates
    const availableDates = {};
    dates.forEach(date => {
        const dateObj = new Date(date.workDaySlot);
        const pad = n => n.toString().padStart(2, '0');
        const dateKey = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`;
        availableDates[dateKey] = date;
    });
    
    // Get current date
    const currentDate = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const currentDateKey = `${currentDate.getFullYear()}-${pad(currentDate.getMonth() + 1)}-${pad(currentDate.getDate())}`;
    
    // Get first date of current month
    const firstDateOfCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    // Get first date of next month
    const firstDateOfNextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    
    // Get first date of month after next
    const firstDateOfMonthAfterNext = new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 1);
    
    // Create container
    const container = document.createElement('div');
    container.className = 'container';
    
    // Create header section
    const headerSection = document.createElement('div');
    headerSection.className = 'header-section';
    
    const title = document.createElement('h1');
    title.textContent = 'Available Appointment Dates';

    headerSection.appendChild(title);

    if (firstDateFormatted && lastDateFormatted) {
        const firstDateDiv = document.createElement('div');
        firstDateDiv.className = 'first-date';
        firstDateDiv.textContent = `First available date: ${firstDateFormatted}`;

        const lastDateDiv = document.createElement('div');
        lastDateDiv.className = 'last-date';
        lastDateDiv.textContent = `Last available date: ${lastDateFormatted}`;

        headerSection.appendChild(firstDateDiv);
        headerSection.appendChild(lastDateDiv);
    } else {
        const noDatesDiv = document.createElement('div');
        noDatesDiv.className = 'no-dates';
        noDatesDiv.textContent = 'No available dates at the moment.';
        headerSection.appendChild(noDatesDiv);
    }

    container.appendChild(headerSection);
    
    // Display three months
    const monthsToShow = [
        firstDateOfCurrentMonth,
        firstDateOfNextMonth,
        firstDateOfMonthAfterNext
    ];
    
    monthsToShow.forEach(monthStart => {
        const monthYear = monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        const lastDate = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
        
        const monthSection = document.createElement('div');
        monthSection.className = 'month-section';
        
        const monthHeader = document.createElement('h2');
        monthHeader.className = 'month-header';
        monthHeader.textContent = monthYear;
        monthSection.appendChild(monthHeader);
        
        // Create calendar header
        const calendarHeader = document.createElement('div');
        calendarHeader.className = 'calendar-header';
        const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        weekdays.forEach(weekday => {
            const weekdayHeader = document.createElement('div');
            weekdayHeader.className = 'weekday-header';
            weekdayHeader.textContent = weekday;
            calendarHeader.appendChild(weekdayHeader);
        });
        monthSection.appendChild(calendarHeader);
        
        // Create calendar grid
        const calendarGrid = document.createElement('div');
        calendarGrid.className = 'calendar-grid';
        
        // Add empty cells for days before the first day of the month
        const firstDayOfWeek = monthStart.getDay();
        const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
        for (let i = 0; i < adjustedFirstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarGrid.appendChild(emptyDay);
        }
        
        // Add all days of the month
        const currentDay = new Date(monthStart);
        while (currentDay <= lastDate) {
            const pad = n => n.toString().padStart(2, '0');
            const dateKey = `${currentDay.getFullYear()}-${pad(currentDay.getMonth() + 1)}-${pad(currentDay.getDate())}`;
            const dayOfWeek = currentDay.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const isPast = currentDay < currentDate;
            const isCurrentDay = dateKey === currentDateKey;
            const isAvailable = availableDates[dateKey];
            
            const dayDiv = document.createElement('div');
            dayDiv.className = 'calendar-day';
            if (isWeekend) dayDiv.classList.add('weekend');
            if (isPast) dayDiv.classList.add('past');
            if (isCurrentDay) {
                dayDiv.classList.add('current');
                dayDiv.id = 'current-date';
            }
            if (isAvailable) dayDiv.classList.add('available');
            if (!isAvailable && !isPast) dayDiv.classList.add('not-available');
            
            const dayNumber = document.createElement('div');
            dayNumber.className = 'day-number';
            dayNumber.textContent = currentDay.getDate();
            dayDiv.appendChild(dayNumber);
            
            if (isAvailable) {
                const timeSlots = availableDates[dateKey].freeTimeSlots;
                const timeSlotsCount = document.createElement('div');
                timeSlotsCount.className = 'time-slots-count';
                timeSlotsCount.textContent = `${timeSlots.length} slots`;
                dayDiv.appendChild(timeSlotsCount);
                
                const slotsDetails = document.createElement('div');
                slotsDetails.className = 'slots-details';
                slotsDetails.style.display = 'none';
                slotsDetails.dataset.slots = JSON.stringify(timeSlots);
                dayDiv.appendChild(slotsDetails);
            } else if (!isPast && !isWeekend) {
                const notAvailableText = document.createElement('div');
                notAvailableText.className = 'not-available-text';
                notAvailableText.textContent = 'Not available';
                dayDiv.appendChild(notAvailableText);
            } else if (isWeekend) {
                const weekendText = document.createElement('div');
                weekendText.className = 'weekend-text';
                weekendText.textContent = 'Weekend';
                dayDiv.appendChild(weekendText);
            }
            
            calendarGrid.appendChild(dayDiv);
            currentDay.setDate(currentDay.getDate() + 1);
        }
        
        monthSection.appendChild(calendarGrid);
        container.appendChild(monthSection);
    });
    
    document.body.appendChild(container);
    
    // Initialize event listeners
    initializeEventListeners();
}

// Initialize event listeners
function initializeEventListeners() {
    // Scroll to current date
    const currentDate = document.getElementById('current-date');
    if (currentDate) {
        currentDate.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Create backdrop for mobile popups
    const backdrop = document.createElement('div');
    backdrop.className = 'popup-backdrop';
    document.body.appendChild(backdrop);
    
    // Add click handlers for available days
    const days = document.querySelectorAll('.calendar-day.available');
    days.forEach(day => {
        day.addEventListener('click', function(e) {
            const slotsDetails = this.querySelector('.slots-details');
            const timeSlots = JSON.parse(slotsDetails.dataset.slots);
            
            // Check if we're on mobile (screen width <= 768px)
            const isMobile = window.innerWidth <= 768;
            
            if (isMobile) {
                // Mobile popup behavior
                showMobilePopup(timeSlots);
            } else {
                // Desktop popup behavior
                // Close any other expanded days
                document.querySelectorAll('.calendar-day.available.expanded').forEach(expandedDay => {
                    if (expandedDay !== this) {
                        expandedDay.classList.remove('expanded');
                        const grid = expandedDay.querySelector('.time-slots-grid');
                        if (grid) grid.innerHTML = '';
                    }
                });
                
                if (!this.classList.contains('expanded')) {
                    // Create time slots grid if it doesn't exist
                    let timeSlotsGrid = this.querySelector('.time-slots-grid');
                    if (!timeSlotsGrid) {
                        timeSlotsGrid = document.createElement('div');
                        timeSlotsGrid.className = 'time-slots-grid';
                        this.appendChild(timeSlotsGrid);
                    }
                    
                    // Add time slots
                    timeSlotsGrid.innerHTML = timeSlots.map(slot => 
                        `<div class="time-slot">${slot}</div>`
                    ).join('');
                    
                    // Calculate position BEFORE showing popup to prevent flash
                    const rect = this.getBoundingClientRect();
                    const viewportHeight = window.innerHeight;
                    const estimatedPopupHeight = 120; // Approximate height of popup
                    
                    // If popup would go below viewport, position it above
                    if (rect.bottom + estimatedPopupHeight > viewportHeight) {
                        timeSlotsGrid.classList.add('bottom-position');
                    }
                    
                    this.classList.add('expanded');
                    
                    // Show the popup after positioning is set
                    setTimeout(() => {
                        timeSlotsGrid.classList.add('show');
                    }, 10);
                } else {
                    this.classList.remove('expanded');
                    const timeSlotsGrid = this.querySelector('.time-slots-grid');
                    if (timeSlotsGrid) {
                        timeSlotsGrid.classList.remove('show', 'bottom-position');
                    }
                }
            }
            
            e.stopPropagation();
        });
    });
    
    // Close expanded day when clicking outside (desktop only)
    document.addEventListener('click', function(e) {
        if (window.innerWidth > 768 && !e.target.closest('.calendar-day.available')) {
            document.querySelectorAll('.calendar-day.available.expanded').forEach(day => {
                day.classList.remove('expanded');
                const grid = day.querySelector('.time-slots-grid');
                if (grid) {
                    grid.innerHTML = '';
                    grid.classList.remove('show', 'bottom-position');
                }
            });
        }
    });
    
    // Close mobile popup when clicking backdrop
    backdrop.addEventListener('click', function(e) {
        if (e.target === backdrop) {
            closeMobilePopup();
        }
    });
}

// Show mobile popup
function showMobilePopup(timeSlots) {
    // Remove any existing mobile popup
    const existingPopup = document.querySelector('.mobile-time-slots-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Create popup container
    const popup = document.createElement('div');
    popup.className = 'time-slots-grid mobile-time-slots-popup';
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'popup-close';
    closeBtn.innerHTML = '×';
    closeBtn.addEventListener('click', closeMobilePopup);
    popup.appendChild(closeBtn);
    
    // Create time slots container with single column layout
    const timeSlotsContainer = document.createElement('div');
    timeSlotsContainer.style.display = 'flex';
    timeSlotsContainer.style.flexDirection = 'column';
    timeSlotsContainer.style.width = '100%';
    timeSlotsContainer.style.alignItems = 'center';
    timeSlotsContainer.style.justifyContent = 'center';
    timeSlotsContainer.style.gap = '0.5rem';
    
    // Add time slots to container
    timeSlots.forEach(slot => {
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.textContent = slot;
        timeSlot.style.textAlign = 'center';
        timeSlot.style.display = 'flex';
        timeSlot.style.alignItems = 'center';
        timeSlot.style.justifyContent = 'center';
        timeSlot.style.width = '100%';
        timeSlotsContainer.appendChild(timeSlot);
    });
    
    // Add time slots container to popup
    popup.appendChild(timeSlotsContainer);
    
    // Add to body
    document.body.appendChild(popup);
    
    // Show backdrop
    const backdrop = document.querySelector('.popup-backdrop');
    backdrop.classList.add('active');
    
    // Show popup with animation
    setTimeout(() => {
        popup.style.opacity = '1';
        popup.style.pointerEvents = 'auto';
    }, 10);
}

// Close mobile popup
function closeMobilePopup() {
    const popup = document.querySelector('.mobile-time-slots-popup');
    const backdrop = document.querySelector('.popup-backdrop');
    
    if (popup) {
        popup.style.opacity = '0';
        popup.style.pointerEvents = 'none';
        setTimeout(() => {
            popup.remove();
        }, 300);
    }
    
    if (backdrop) {
        backdrop.classList.remove('active');
    }
}

// Initialize the application
async function init() {
    try {
        const dates = await fetchData();
        processData(dates);
    } catch (error) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = `Error: ${error.message}`;
        document.body.appendChild(errorDiv);
    }
}

// Start the application
document.addEventListener('DOMContentLoaded', init);

function getLocalDateKey(dateInput) {
    const dateObj = new Date(dateInput);
    const pad = n => n.toString().padStart(2, '0');
    return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`;
} 