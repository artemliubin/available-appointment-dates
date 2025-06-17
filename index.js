// API endpoint with CORS proxy
const API_URL = 'https://corsproxy.io/?https://echerga.mod.gov.ua/APPVER4/prelim/getWorkDaysFull/bc614fc7-14c1-4bbf-8a71-eb94ebd63eb0/1f7210a8-242f-4729-97f1-d70122cbd401/89c431f6-f437-418d-a187-e3833edc518c';

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
    // Sort dates in ascending order
    dates.sort((a, b) => new Date(a.workDaySlot) - new Date(b.workDaySlot));
    
    // Get first available date
    const firstDate = new Date(dates[0].workDaySlot);
    const firstDateFormatted = firstDate.toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
    
    // Create a map of available dates
    const availableDates = {};
    dates.forEach(date => {
        const dateObj = new Date(date.workDaySlot);
        const dateKey = dateObj.toISOString().split('T')[0];
        availableDates[dateKey] = date;
    });
    
    // Get current date
    const currentDate = new Date();
    const currentDateKey = currentDate.toISOString().split('T')[0];
    
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
    
    const firstDateDiv = document.createElement('div');
    firstDateDiv.className = 'first-date';
    firstDateDiv.textContent = `First available date: ${firstDateFormatted}`;
    
    headerSection.appendChild(title);
    headerSection.appendChild(firstDateDiv);
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
            const dateKey = currentDay.toISOString().split('T')[0];
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
    
    // Add click handlers for available days
    const days = document.querySelectorAll('.calendar-day.available');
    days.forEach(day => {
        day.addEventListener('click', function(e) {
            const slotsDetails = this.querySelector('.slots-details');
            const timeSlots = JSON.parse(slotsDetails.dataset.slots);
            
            // Close any other expanded days
            document.querySelectorAll('.calendar-day.available.expanded').forEach(expandedDay => {
                if (expandedDay !== this) {
                    expandedDay.classList.remove('expanded');
                    expandedDay.querySelector('.time-slots-grid').innerHTML = '';
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
                
                this.classList.add('expanded');
            } else {
                this.classList.remove('expanded');
            }
            
            e.stopPropagation();
        });
    });
    
    // Close expanded day when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.calendar-day.available')) {
            document.querySelectorAll('.calendar-day.available.expanded').forEach(day => {
                day.classList.remove('expanded');
                day.querySelector('.time-slots-grid').innerHTML = '';
            });
        }
    });
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