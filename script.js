class WaterTracker {
    constructor() {
        this.dailyGoal = 8; // glasses
        this.mlPerGlass = 250; // ml per glass
        this.currentGlasses = 0;
        this.history = [];
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateDisplay();
        this.renderHistory();
    }

    setupEventListeners() {
        const addGlassBtn = document.getElementById('add-glass-btn');
        addGlassBtn.addEventListener('click', () => this.addGlass());
    }

    addGlass() {
        if (this.currentGlasses < this.dailyGoal) {
            this.currentGlasses++;
            this.updateDisplay();
            this.saveData();
            this.animateGlassAdd();
        }
    }

    animateGlassAdd() {
        const btn = document.getElementById('add-glass-btn');
        const waterIcon = document.querySelector('.water-icon');
        
        // Button animation
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btn.style.transform = 'scale(1)';
        }, 150);

        // Water drop animation
        waterIcon.style.transform = 'scale(1.2)';
        setTimeout(() => {
            waterIcon.style.transform = 'scale(1)';
        }, 300);
    }

    updateDisplay() {
        // Update glass count
        document.getElementById('current-glasses').textContent = this.currentGlasses;
        
        // Update ml count
        const totalMl = this.currentGlasses * this.mlPerGlass;
        document.getElementById('ml-count').textContent = totalMl.toLocaleString();
        
        // Update percentage
        const percentage = Math.round((this.currentGlasses / this.dailyGoal) * 100);
        document.getElementById('percentage').textContent = percentage;
        
        // Update progress circle
        this.updateProgressCircle(percentage);
        
        // Update button state
        const addBtn = document.getElementById('add-glass-btn');
        if (this.currentGlasses >= this.dailyGoal) {
            addBtn.innerHTML = '<div class="glass-icon">✅</div><span>Goal Reached!</span>';
            addBtn.style.background = 'linear-gradient(135deg, #4caf50, #66bb6a)';
        } else {
            addBtn.innerHTML = '<div class="glass-icon">🥤</div><span>Add Glass</span>';
            addBtn.style.background = 'linear-gradient(135deg, #26a69a, #4fc3f7)';
        }
    }

    updateProgressCircle(percentage) {
        const circle = document.getElementById('progress-circle');
        const circumference = 2 * Math.PI * 85; // radius = 85
        const offset = circumference - (percentage / 100) * circumference;
        
        circle.style.strokeDashoffset = offset;
        
        // Change color based on progress
        if (percentage >= 100) {
            circle.style.stroke = '#4caf50';
        } else if (percentage >= 75) {
            circle.style.stroke = '#26a69a';
        } else if (percentage >= 50) {
            circle.style.stroke = '#29b6f6';
        } else {
            circle.style.stroke = '#42a5f5';
        }
    }

    saveData() {
        const today = new Date().toDateString();
        const data = {
            currentGlasses: this.currentGlasses,
            date: today,
            history: this.history
        };
        
        // Update today's entry in history
        const todayIndex = this.history.findIndex(entry => entry.date === today);
        const todayEntry = {
            date: today,
            glasses: this.currentGlasses,
            percentage: Math.round((this.currentGlasses / this.dailyGoal) * 100)
        };
        
        if (todayIndex >= 0) {
            this.history[todayIndex] = todayEntry;
        } else {
            this.history.unshift(todayEntry);
        }
        
        // Keep only last 30 days
        this.history = this.history.slice(0, 30);
        
        localStorage.setItem('waterTrackerData', JSON.stringify(data));
    }

    loadData() {
        const saved = localStorage.getItem('waterTrackerData');
        if (saved) {
            const data = JSON.parse(saved);
            const today = new Date().toDateString();
            
            // Load history
            this.history = data.history || [];
            
            // Check if saved data is from today
            if (data.date === today) {
                this.currentGlasses = data.currentGlasses || 0;
            } else {
                // New day, reset glasses but keep history
                this.currentGlasses = 0;
            }
        }
    }

    renderHistory() {
        const container = document.getElementById('history-container');
        
        if (this.history.length === 0) {
            container.innerHTML = '<div class="empty-history">No history yet. Start tracking your water intake!</div>';
            return;
        }
        
        const historyHTML = this.history
            .filter(entry => entry.date !== new Date().toDateString()) // Exclude today
            .slice(0, 7) // Show last 7 days
            .map(entry => {
                const date = new Date(entry.date);
                const dateStr = this.formatDate(date);
                const glassesText = entry.glasses === 1 ? '1 glass' : `${entry.glasses} glasses`;
                
                return `
                    <div class="history-item">
                        <span class="history-date">${dateStr}</span>
                        <span class="history-glasses">💧 ${glassesText}</span>
                        <span class="history-percentage">${entry.percentage}%</span>
                    </div>
                `;
            }).join('');
        
        container.innerHTML = historyHTML || '<div class="empty-history">No previous days recorded yet.</div>';
    }

    formatDate(date) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else if (date.getTime() > yesterday.getTime() - 6 * 24 * 60 * 60 * 1000) {
            // Within last week
            return date.toLocaleDateString('en', { weekday: 'long' });
        } else {
            return date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
        }
    }
}

// Initialize the water tracker when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new WaterTracker();
});