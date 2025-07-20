// Main Application Controller
class DietPlannerApp {
    constructor() {
        this.currentDate = new Date();
        this.currentWeekStart = this.getWeekStart(this.currentDate);
        this.currentTab = 'today';
        this.selectedMealType = null;
        
        this.init();
    }

    async init() {
        try {
            // Initialize modules
            await FoodDatabase.init();
            await LanguageManager.init();
            MealTracker.init();
            WeeklyPlanner.init();
            ChartsManager.init();

            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize PWA
            this.initPWA();
            
            // Load initial data
            this.updateDateDisplay();
            this.loadTodayData();
            
            console.log('Diet Planner App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Date navigation
        document.getElementById('prevDay').addEventListener('click', () => {
            this.changeDate(-1);
        });

        document.getElementById('nextDay').addEventListener('click', () => {
            this.changeDate(1);
        });

        // Week navigation
        document.getElementById('prevWeek').addEventListener('click', () => {
            this.changeWeek(-1);
        });

        document.getElementById('nextWeek').addEventListener('click', () => {
            this.changeWeek(1);
        });

        // Add meal buttons
        document.querySelectorAll('.add-meal-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mealType = e.target.closest('button').dataset.meal;
                this.openFoodModal(mealType);
            });
        });

        // Food modal
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeFoodModal();
        });

        document.getElementById('foodModal').addEventListener('click', (e) => {
            if (e.target.id === 'foodModal') {
                this.closeFoodModal();
            }
        });

        // Modal food search
        document.getElementById('modalFoodSearch').addEventListener('input', (e) => {
            this.searchFoods(e.target.value);
        });

        // Portion size change
        document.getElementById('portionSize').addEventListener('input', () => {
            this.updateNutritionPreview();
        });

        // Add food to meal
        document.getElementById('addFoodToMeal').addEventListener('click', () => {
            this.addSelectedFoodToMeal();
        });

        // Food search in foods view
        document.getElementById('foodSearch').addEventListener('input', (e) => {
            this.filterFoodsView(e.target.value);
        });

        // Language toggle
        document.getElementById('languageToggle').addEventListener('click', () => {
            LanguageManager.toggleLanguage();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeFoodModal();
            }
        });
    }

    initPWA() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }

        // Handle install prompt
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            // You could show an install button here
        });
    }

    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Show corresponding content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-view`).classList.add('active');

        this.currentTab = tabName;

        // Load data for the active tab
        switch (tabName) {
            case 'today':
                this.loadTodayData();
                break;
            case 'weekly':
                WeeklyPlanner.loadWeeklyData(this.currentWeekStart);
                break;
            case 'foods':
                this.loadFoodsView();
                break;
            case 'stats':
                ChartsManager.loadCharts();
                break;
        }
    }

    changeDate(days) {
        this.currentDate.setDate(this.currentDate.getDate() + days);
        this.updateDateDisplay();
        this.loadTodayData();
    }

    changeWeek(weeks) {
        this.currentWeekStart.setDate(this.currentWeekStart.getDate() + (weeks * 7));
        this.updateWeekDisplay();
        WeeklyPlanner.loadWeeklyData(this.currentWeekStart);
    }

    updateDateDisplay() {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        document.getElementById('currentDate').textContent = 
            this.currentDate.toLocaleDateString(LanguageManager.currentLanguage, options);
    }

    updateWeekDisplay() {
        const weekEnd = new Date(this.currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const startStr = this.currentWeekStart.toLocaleDateString(LanguageManager.currentLanguage, { 
            month: 'short', 
            day: 'numeric' 
        });
        const endStr = weekEnd.toLocaleDateString(LanguageManager.currentLanguage, { 
            month: 'short', 
            day: 'numeric' 
        });
        
        document.getElementById('currentWeek').textContent = `${startStr} - ${endStr}`;
    }

    loadTodayData() {
        MealTracker.loadMealsForDate(this.currentDate);
        this.updateDailySummary();
    }

    updateDailySummary() {
        const dateKey = this.formatDate(this.currentDate);
        const dayData = MealTracker.getMealsForDate(dateKey);
        
        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;

        Object.values(dayData).forEach(meals => {
            meals.forEach(meal => {
                totalCalories += meal.calories || 0;
                totalProtein += meal.protein || 0;
                totalCarbs += meal.carbs || 0;
                totalFat += meal.fat || 0;
            });
        });

        document.getElementById('totalCalories').textContent = Math.round(totalCalories);
        document.getElementById('totalProtein').textContent = Math.round(totalProtein);
        document.getElementById('totalCarbs').textContent = Math.round(totalCarbs);
        document.getElementById('totalFat').textContent = Math.round(totalFat);
    }

    openFoodModal(mealType) {
        this.selectedMealType = mealType;
        const modal = document.getElementById('foodModal');
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Reset modal state
        document.getElementById('modalFoodSearch').value = '';
        document.getElementById('foodDetails').style.display = 'none';
        document.getElementById('foodResults').innerHTML = '';
        
        // Load all foods initially
        this.searchFoods('');
        
        // Focus search input
        setTimeout(() => {
            document.getElementById('modalFoodSearch').focus();
        }, 100);
    }

    closeFoodModal() {
        const modal = document.getElementById('foodModal');
        modal.classList.remove('show');
        document.body.style.overflow = '';
        this.selectedMealType = null;
        this.selectedFood = null;
    }

    searchFoods(query) {
        const foods = FoodDatabase.searchFoods(query);
        const resultsContainer = document.getElementById('foodResults');
        
        if (foods.length === 0) {
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <p>${LanguageManager.translate('foods.no_results')}</p>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = foods.map(food => `
            <div class="food-result-item" data-food-id="${food.id}">
                <div class="food-name">${food.name}</div>
                <div class="food-brief">${food.calories} kcal per 100g</div>
            </div>
        `).join('');

        // Add click listeners
        resultsContainer.querySelectorAll('.food-result-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectFood(item.dataset.foodId);
            });
        });
    }

    selectFood(foodId) {
        // Remove previous selection
        document.querySelectorAll('.food-result-item').forEach(item => {
            item.classList.remove('selected');
        });

        // Add selection to clicked item
        document.querySelector(`[data-food-id="${foodId}"]`).classList.add('selected');

        this.selectedFood = FoodDatabase.getFoodById(foodId);
        
        if (this.selectedFood) {
            document.getElementById('selectedFoodName').textContent = this.selectedFood.name;
            document.getElementById('portionSize').value = 100;
            document.getElementById('foodDetails').style.display = 'block';
            this.updateNutritionPreview();
        }
    }

    updateNutritionPreview() {
        if (!this.selectedFood) return;

        const portion = parseFloat(document.getElementById('portionSize').value) || 100;
        const multiplier = portion / 100;

        const calories = Math.round((this.selectedFood.calories || 0) * multiplier);
        const protein = Math.round((this.selectedFood.protein || 0) * multiplier * 10) / 10;
        const carbs = Math.round((this.selectedFood.carbs || 0) * multiplier * 10) / 10;
        const fat = Math.round((this.selectedFood.fat || 0) * multiplier * 10) / 10;

        document.getElementById('previewCalories').textContent = calories;
        document.getElementById('previewProtein').textContent = protein;
        document.getElementById('previewCarbs').textContent = carbs;
        document.getElementById('previewFat').textContent = fat;
    }

    addSelectedFoodToMeal() {
        if (!this.selectedFood || !this.selectedMealType) return;

        const portion = parseFloat(document.getElementById('portionSize').value) || 100;
        const multiplier = portion / 100;

        const mealItem = {
            id: Date.now().toString(),
            foodId: this.selectedFood.id,
            name: this.selectedFood.name,
            portion: portion,
            calories: (this.selectedFood.calories || 0) * multiplier,
            protein: (this.selectedFood.protein || 0) * multiplier,
            carbs: (this.selectedFood.carbs || 0) * multiplier,
            fat: (this.selectedFood.fat || 0) * multiplier,
            timestamp: new Date().toISOString()
        };

        const dateKey = this.formatDate(this.currentDate);
        MealTracker.addMealItem(dateKey, this.selectedMealType, mealItem);

        this.closeFoodModal();
        this.loadTodayData();
    }

    loadFoodsView() {
        const foods = FoodDatabase.getAllFoods();
        const container = document.getElementById('foodsGrid');
        
        container.innerHTML = foods.map(food => `
            <div class="food-card">
                <h3>${food.name}</h3>
                <div class="food-nutrition-grid">
                    <div class="nutrition-detail">
                        <span class="nutrition-label">${LanguageManager.translate('summary.calories')}</span>
                        <span class="nutrition-value">${food.calories} kcal</span>
                    </div>
                    <div class="nutrition-detail">
                        <span class="nutrition-label">${LanguageManager.translate('summary.protein')}</span>
                        <span class="nutrition-value">${food.protein}g</span>
                    </div>
                    <div class="nutrition-detail">
                        <span class="nutrition-label">${LanguageManager.translate('summary.carbs')}</span>
                        <span class="nutrition-value">${food.carbs}g</span>
                    </div>
                    <div class="nutrition-detail">
                        <span class="nutrition-label">${LanguageManager.translate('summary.fat')}</span>
                        <span class="nutrition-value">${food.fat}g</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    filterFoodsView(query) {
        const foods = FoodDatabase.searchFoods(query);
        const container = document.getElementById('foodsGrid');
        
        if (foods.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>${LanguageManager.translate('foods.no_results')}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = foods.map(food => `
            <div class="food-card">
                <h3>${food.name}</h3>
                <div class="food-nutrition-grid">
                    <div class="nutrition-detail">
                        <span class="nutrition-label">${LanguageManager.translate('summary.calories')}</span>
                        <span class="nutrition-value">${food.calories} kcal</span>
                    </div>
                    <div class="nutrition-detail">
                        <span class="nutrition-label">${LanguageManager.translate('summary.protein')}</span>
                        <span class="nutrition-value">${food.protein}g</span>
                    </div>
                    <div class="nutrition-detail">
                        <span class="nutrition-label">${LanguageManager.translate('summary.carbs')}</span>
                        <span class="nutrition-value">${food.carbs}g</span>
                    </div>
                    <div class="nutrition-detail">
                        <span class="nutrition-label">${LanguageManager.translate('summary.fat')}</span>
                        <span class="nutrition-value">${food.fat}g</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        return new Date(d.setDate(diff));
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    showError(message) {
        // Simple error display - could be enhanced with toast notifications
        console.error(message);
        alert(message);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dietApp = new DietPlannerApp();
});
