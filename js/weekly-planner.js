// Weekly Meal Planning
class WeeklyPlanner {
    static currentWeekStart = null;
    static weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    static init() {
        console.log('WeeklyPlanner initialized');
    }

    static loadWeeklyData(weekStartDate) {
        this.currentWeekStart = new Date(weekStartDate);
        this.renderWeeklyGrid();
    }

    static renderWeeklyGrid() {
        const container = document.getElementById('weeklyGrid');
        const weeklyData = this.getWeeklyData();
        
        container.innerHTML = weeklyData.map((day, index) => 
            this.renderDayCard(day, index)
        ).join('');

        // Add click listeners to day cards
        container.querySelectorAll('.day-card').forEach((card, index) => {
            card.addEventListener('click', () => {
                this.goToDay(index);
            });
        });
    }

    static renderDayCard(dayData, dayIndex) {
        const isToday = this.isToday(dayData.date);
        const dayName = LanguageManager.translate(`days.${this.weekDays[dayIndex].toLowerCase()}`);
        
        return `
            <div class="day-card ${isToday ? 'today' : ''}" data-day-index="${dayIndex}">
                <div class="day-header">
                    <div class="day-name">${dayName}</div>
                    <div class="day-date">${this.formatDate(dayData.date)}</div>
                </div>
                
                <div class="day-meals">
                    ${this.renderDayMeals(dayData.meals)}
                </div>
                
                <div class="day-nutrition">
                    <div class="nutrition-summary">
                        <span>${dayData.totals.calories} kcal</span>
                        <span>P: ${dayData.totals.protein}g</span>
                        <span>C: ${dayData.totals.carbs}g</span>
                        <span>F: ${dayData.totals.fat}g</span>
                    </div>
                    ${dayData.totals.items > 0 ? 
                        `<div class="meal-count">${dayData.totals.items} ${LanguageManager.translate('weekly.items')}</div>` : 
                        `<div class="empty-day">${LanguageManager.translate('weekly.no_meals')}</div>`
                    }
                </div>
            </div>
        `;
    }

    static renderDayMeals(meals) {
        const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
        let html = '';

        mealTypes.forEach(mealType => {
            const mealItems = meals[mealType] || [];
            if (mealItems.length > 0) {
                const mealName = LanguageManager.translate(`meals.${mealType}`);
                html += `<div class="day-meal">
                    <strong>${mealName}:</strong> ${mealItems.length} ${LanguageManager.translate('weekly.items')}
                </div>`;
            }
        });

        return html || `<div class="day-meal empty">${LanguageManager.translate('weekly.no_meals')}</div>`;
    }

    static getWeeklyData() {
        const weekData = [];
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(this.currentWeekStart);
            date.setDate(date.getDate() + i);
            const dateKey = MealTracker.formatDate(date);
            
            const meals = MealTracker.getMealsForDate(dateKey);
            const totals = MealTracker.getDailyTotals(dateKey);
            
            weekData.push({
                date: new Date(date),
                dateKey,
                meals,
                totals
            });
        }
        
        return weekData;
    }

    static goToDay(dayIndex) {
        const targetDate = new Date(this.currentWeekStart);
        targetDate.setDate(targetDate.getDate() + dayIndex);
        
        // Update app's current date and switch to today view
        window.dietApp.currentDate = targetDate;
        window.dietApp.switchTab('today');
    }

    static isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    static formatDate(date) {
        const options = { month: 'short', day: 'numeric' };
        return date.toLocaleDateString(LanguageManager.currentLanguage, options);
    }

    static getWeeklyStats() {
        const weekData = this.getWeeklyData();
        
        const stats = {
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFat: 0,
            totalMeals: 0,
            daysWithMeals: 0,
            averageCalories: 0,
            averageProtein: 0,
            averageCarbs: 0,
            averageFat: 0,
            dailyBreakdown: []
        };

        weekData.forEach(day => {
            stats.totalCalories += day.totals.calories;
            stats.totalProtein += day.totals.protein;
            stats.totalCarbs += day.totals.carbs;
            stats.totalFat += day.totals.fat;
            stats.totalMeals += day.totals.items;
            
            if (day.totals.items > 0) {
                stats.daysWithMeals++;
            }
            
            stats.dailyBreakdown.push({
                date: day.dateKey,
                dayName: this.weekDays[day.date.getDay() === 0 ? 6 : day.date.getDay() - 1],
                ...day.totals
            });
        });

        // Calculate averages
        if (stats.daysWithMeals > 0) {
            stats.averageCalories = Math.round(stats.totalCalories / stats.daysWithMeals);
            stats.averageProtein = Math.round((stats.totalProtein / stats.daysWithMeals) * 10) / 10;
            stats.averageCarbs = Math.round((stats.totalCarbs / stats.daysWithMeals) * 10) / 10;
            stats.averageFat = Math.round((stats.totalFat / stats.daysWithMeals) * 10) / 10;
        }

        return stats;
    }

    static planMeal(dayIndex, mealType, foodItems) {
        const targetDate = new Date(this.currentWeekStart);
        targetDate.setDate(targetDate.getDate() + dayIndex);
        const dateKey = MealTracker.formatDate(targetDate);

        // Add each food item to the specified meal
        foodItems.forEach(foodItem => {
            const mealItem = {
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                ...foodItem,
                timestamp: new Date().toISOString(),
                planned: true // Mark as planned rather than consumed
            };

            MealTracker.addMealItem(dateKey, mealType, mealItem);
        });

        // Refresh the weekly view
        this.renderWeeklyGrid();
        
        return true;
    }

    static copyMealToDay(fromDayIndex, toDayIndex, mealType) {
        const fromDate = new Date(this.currentWeekStart);
        fromDate.setDate(fromDate.getDate() + fromDayIndex);
        const fromDateKey = MealTracker.formatDate(fromDate);

        const toDate = new Date(this.currentWeekStart);
        toDate.setDate(toDate.getDate() + toDayIndex);
        const toDateKey = MealTracker.formatDate(toDate);

        const success = MealTracker.duplicateMeal(fromDateKey, toDateKey, mealType);
        
        if (success) {
            this.renderWeeklyGrid();
        }
        
        return success;
    }

    static clearWeeklyPlan() {
        const weekData = this.getWeeklyData();
        
        weekData.forEach(day => {
            MealTracker.clearDay(day.dateKey);
        });

        this.renderWeeklyGrid();
        return true;
    }

    static generateMealPlan(preferences = {}) {
        // Basic meal plan generation
        // This could be enhanced with more sophisticated algorithms
        
        const {
            targetCalories = 2000,
            targetProtein = 150,
            targetCarbs = 250,
            targetFat = 80,
            restrictions = [],
            preferredFoods = []
        } = preferences;

        const weekPlan = {};
        const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
        
        // Get available foods (excluding restrictions)
        let availableFoods = FoodDatabase.getAllFoods().filter(food => 
            !restrictions.includes(food.category) && 
            !restrictions.includes(food.id)
        );

        // Prioritize preferred foods
        if (preferredFoods.length > 0) {
            const preferred = availableFoods.filter(food => 
                preferredFoods.includes(food.id) || preferredFoods.includes(food.category)
            );
            const others = availableFoods.filter(food => 
                !preferredFoods.includes(food.id) && !preferredFoods.includes(food.category)
            );
            availableFoods = [...preferred, ...others];
        }

        // Generate plan for each day
        for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
            const targetDate = new Date(this.currentWeekStart);
            targetDate.setDate(targetDate.getDate() + dayIndex);
            const dateKey = MealTracker.formatDate(targetDate);

            weekPlan[dateKey] = this.generateDayPlan(
                availableFoods, 
                targetCalories, 
                targetProtein, 
                targetCarbs, 
                targetFat
            );
        }

        // Apply the generated plan
        this.applyWeeklyPlan(weekPlan);
        
        return weekPlan;
    }

    static generateDayPlan(availableFoods, targetCalories, targetProtein, targetCarbs, targetFat) {
        const dayPlan = {
            breakfast: [],
            lunch: [],
            dinner: [],
            snacks: []
        };

        // Simple distribution: breakfast 25%, lunch 35%, dinner 35%, snacks 5%
        const calorieDistribution = {
            breakfast: targetCalories * 0.25,
            lunch: targetCalories * 0.35,
            dinner: targetCalories * 0.35,
            snacks: targetCalories * 0.05
        };

        Object.keys(calorieDistribution).forEach(mealType => {
            const targetMealCalories = calorieDistribution[mealType];
            let currentCalories = 0;
            let attempts = 0;
            const maxAttempts = 10;

            while (currentCalories < targetMealCalories * 0.8 && attempts < maxAttempts) {
                const randomFood = availableFoods[Math.floor(Math.random() * availableFoods.length)];
                const remainingCalories = targetMealCalories - currentCalories;
                
                // Calculate portion size to meet remaining calories
                const portionSize = Math.min(200, Math.max(50, 
                    (remainingCalories / randomFood.calories) * 100
                ));

                const nutrition = FoodDatabase.calculateNutrition(randomFood.id, portionSize);

                dayPlan[mealType].push({
                    foodId: randomFood.id,
                    name: randomFood.name,
                    portion: Math.round(portionSize),
                    ...nutrition
                });

                currentCalories += nutrition.calories;
                attempts++;
            }
        });

        return dayPlan;
    }

    static applyWeeklyPlan(weekPlan) {
        // Clear existing plans first
        this.clearWeeklyPlan();

        // Apply new plan
        Object.keys(weekPlan).forEach(dateKey => {
            const dayPlan = weekPlan[dateKey];
            
            Object.keys(dayPlan).forEach(mealType => {
                const meals = dayPlan[mealType];
                
                meals.forEach(meal => {
                    const mealItem = {
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        ...meal,
                        timestamp: new Date().toISOString(),
                        planned: true
                    };

                    MealTracker.addMealItem(dateKey, mealType, mealItem);
                });
            });
        });

        // Refresh the view
        this.renderWeeklyGrid();
    }

    static exportWeeklyPlan() {
        const weekData = this.getWeeklyData();
        const weekStats = this.getWeeklyStats();
        
        return {
            weekStart: MealTracker.formatDate(this.currentWeekStart),
            weekEnd: MealTracker.formatDate(new Date(this.currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000)),
            days: weekData.map(day => ({
                date: day.dateKey,
                meals: day.meals,
                totals: day.totals
            })),
            weekStats,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }

    static getWeekRange(weekStart) {
        const start = new Date(weekStart);
        const end = new Date(weekStart);
        end.setDate(end.getDate() + 6);
        
        return {
            start: MealTracker.formatDate(start),
            end: MealTracker.formatDate(end),
            startObj: start,
            endObj: end
        };
    }
}

// Global weekly planner instance
window.WeeklyPlanner = WeeklyPlanner;
