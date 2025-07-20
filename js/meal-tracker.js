// Meal Tracking and Management
class MealTracker {
    static currentDate = new Date();
    static mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];

    static init() {
        console.log('MealTracker initialized');
    }

    static loadMealsForDate(date) {
        const dateKey = this.formatDate(date);
        const dayMeals = StorageManager.getMealsForDate(dateKey);
        
        this.renderMeals(dayMeals);
    }

    static renderMeals(dayMeals) {
        this.mealTypes.forEach(mealType => {
            const container = document.getElementById(`${mealType}-items`);
            const meals = dayMeals[mealType] || [];
            
            if (meals.length === 0) {
                container.innerHTML = `
                    <div class="empty-meal">
                        <i class="fas fa-plus-circle"></i>
                        <p>${LanguageManager.translate('meals.empty')}</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = meals.map(meal => this.renderMealItem(meal, mealType)).join('');
        });
    }

    static renderMealItem(meal, mealType) {
        return `
            <div class="meal-item" data-meal-id="${meal.id}">
                <div class="food-info">
                    <div class="food-name">${meal.name}</div>
                    <div class="food-details">${meal.portion}g</div>
                    <div class="food-nutrition">
                        <span>${Math.round(meal.calories || 0)} kcal</span>
                        <span>P: ${Math.round((meal.protein || 0) * 10) / 10}g</span>
                        <span>C: ${Math.round((meal.carbs || 0) * 10) / 10}g</span>
                        <span>F: ${Math.round((meal.fat || 0) * 10) / 10}g</span>
                    </div>
                </div>
                <button class="remove-food" onclick="MealTracker.removeMealItem('${meal.id}', '${mealType}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    static addMealItem(dateKey, mealType, mealItem) {
        // Validate meal item
        if (!this.validateMealItem(mealItem)) {
            throw new Error('Invalid meal item data');
        }

        // Add timestamp if not present
        if (!mealItem.timestamp) {
            mealItem.timestamp = new Date().toISOString();
        }

        // Save to storage
        const success = StorageManager.addMealItem(dateKey, mealType, mealItem);
        
        if (success) {
            // Reload current day if it's the same date
            const currentDateKey = this.formatDate(window.dietApp.currentDate);
            if (dateKey === currentDateKey) {
                this.loadMealsForDate(window.dietApp.currentDate);
            }
            
            console.log(`Added ${mealItem.name} to ${mealType} for ${dateKey}`);
        }
        
        return success;
    }

    static removeMealItem(itemId, mealType) {
        const dateKey = this.formatDate(window.dietApp.currentDate);
        const success = StorageManager.removeMealItem(dateKey, mealType, itemId);
        
        if (success) {
            this.loadMealsForDate(window.dietApp.currentDate);
            // Update summary after removal
            window.dietApp.updateDailySummary();
            console.log(`Removed meal item ${itemId} from ${mealType}`);
        }
        
        return success;
    }

    static getMealsForDate(dateKey) {
        return StorageManager.getMealsForDate(dateKey);
    }

    static getDailyTotals(dateKey) {
        const dayMeals = this.getMealsForDate(dateKey);
        
        let totals = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            items: 0
        };

        this.mealTypes.forEach(mealType => {
            const meals = dayMeals[mealType] || [];
            meals.forEach(meal => {
                totals.calories += meal.calories || 0;
                totals.protein += meal.protein || 0;
                totals.carbs += meal.carbs || 0;
                totals.fat += meal.fat || 0;
                totals.items += 1;
            });
        });

        // Round values
        totals.calories = Math.round(totals.calories);
        totals.protein = Math.round(totals.protein * 10) / 10;
        totals.carbs = Math.round(totals.carbs * 10) / 10;
        totals.fat = Math.round(totals.fat * 10) / 10;

        return totals;
    }

    static getWeeklyTotals(weekStartDate) {
        const weeklyData = [];
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStartDate);
            date.setDate(date.getDate() + i);
            const dateKey = this.formatDate(date);
            
            const dayTotals = this.getDailyTotals(dateKey);
            weeklyData.push({
                date: dateKey,
                dateObj: new Date(date),
                ...dayTotals
            });
        }
        
        return weeklyData;
    }

    static getMealTypeDistribution(dateKey) {
        const dayMeals = this.getMealsForDate(dateKey);
        const distribution = {};

        this.mealTypes.forEach(mealType => {
            const meals = dayMeals[mealType] || [];
            let mealCalories = 0;
            
            meals.forEach(meal => {
                mealCalories += meal.calories || 0;
            });
            
            distribution[mealType] = Math.round(mealCalories);
        });

        return distribution;
    }

    static duplicateMeal(fromDateKey, toDateKey, mealType) {
        const fromMeals = this.getMealsForDate(fromDateKey);
        const mealsToClone = fromMeals[mealType] || [];
        
        if (mealsToClone.length === 0) {
            return false;
        }

        const toMeals = this.getMealsForDate(toDateKey);
        
        // Clone meals with new IDs and timestamps
        const clonedMeals = mealsToClone.map(meal => ({
            ...meal,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString()
        }));

        toMeals[mealType] = [...(toMeals[mealType] || []), ...clonedMeals];
        
        return StorageManager.saveMealsForDate(toDateKey, toMeals);
    }

    static copyDay(fromDateKey, toDateKey) {
        const fromMeals = this.getMealsForDate(fromDateKey);
        const copiedMeals = {};

        this.mealTypes.forEach(mealType => {
            const meals = fromMeals[mealType] || [];
            copiedMeals[mealType] = meals.map(meal => ({
                ...meal,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toISOString()
            }));
        });

        return StorageManager.saveMealsForDate(toDateKey, copiedMeals);
    }

    static clearDay(dateKey) {
        const emptyDay = {
            breakfast: [],
            lunch: [],
            dinner: [],
            snacks: []
        };

        return StorageManager.saveMealsForDate(dateKey, emptyDay);
    }

    static clearMealType(dateKey, mealType) {
        const dayMeals = this.getMealsForDate(dateKey);
        dayMeals[mealType] = [];
        
        return StorageManager.saveMealsForDate(dateKey, dayMeals);
    }

    static searchMealHistory(foodName, limit = 10) {
        const allMeals = StorageManager.getMeals();
        const results = [];

        for (const dateKey in allMeals) {
            const dayMeals = allMeals[dateKey];
            
            this.mealTypes.forEach(mealType => {
                const meals = dayMeals[mealType] || [];
                meals.forEach(meal => {
                    if (meal.name.toLowerCase().includes(foodName.toLowerCase())) {
                        results.push({
                            date: dateKey,
                            mealType,
                            ...meal
                        });
                    }
                });
            });
        }

        // Sort by date (newest first) and limit results
        return results
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, limit);
    }

    static getFrequentFoods(limit = 10) {
        const allMeals = StorageManager.getMeals();
        const foodCounts = {};

        for (const dateKey in allMeals) {
            const dayMeals = allMeals[dateKey];
            
            this.mealTypes.forEach(mealType => {
                const meals = dayMeals[mealType] || [];
                meals.forEach(meal => {
                    const key = `${meal.foodId || meal.name}`;
                    if (foodCounts[key]) {
                        foodCounts[key].count++;
                        foodCounts[key].lastUsed = Math.max(foodCounts[key].lastUsed, new Date(meal.timestamp || dateKey).getTime());
                    } else {
                        foodCounts[key] = {
                            name: meal.name,
                            foodId: meal.foodId,
                            count: 1,
                            lastUsed: new Date(meal.timestamp || dateKey).getTime()
                        };
                    }
                });
            });
        }

        return Object.values(foodCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }

    static validateMealItem(mealItem) {
        const requiredFields = ['id', 'name'];
        
        for (const field of requiredFields) {
            if (!(field in mealItem) || !mealItem[field]) {
                return false;
            }
        }

        // Check numeric fields
        const numericFields = ['calories', 'protein', 'carbs', 'fat', 'portion'];
        for (const field of numericFields) {
            if (field in mealItem && (isNaN(mealItem[field]) || mealItem[field] < 0)) {
                return false;
            }
        }

        return true;
    }

    static formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    static exportMealData(startDate, endDate) {
        const allMeals = StorageManager.getMeals();
        const exportData = {};
        
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        for (const dateKey in allMeals) {
            const mealDate = new Date(dateKey);
            if (mealDate >= start && mealDate <= end) {
                exportData[dateKey] = allMeals[dateKey];
            }
        }

        return {
            meals: exportData,
            dateRange: { start: startDate, end: endDate },
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }

    static getStatistics(days = 30) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const stats = {
            totalDays: 0,
            avgCalories: 0,
            avgProtein: 0,
            avgCarbs: 0,
            avgFat: 0,
            totalMeals: 0,
            mealTypeDistribution: {},
            dailyAverages: []
        };

        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;

        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            const dateKey = this.formatDate(date);
            const dayTotals = this.getDailyTotals(dateKey);
            
            if (dayTotals.items > 0) {
                stats.totalDays++;
                totalCalories += dayTotals.calories;
                totalProtein += dayTotals.protein;
                totalCarbs += dayTotals.carbs;
                totalFat += dayTotals.fat;
                stats.totalMeals += dayTotals.items;
                
                stats.dailyAverages.push({
                    date: dateKey,
                    ...dayTotals
                });
            }
        }

        if (stats.totalDays > 0) {
            stats.avgCalories = Math.round(totalCalories / stats.totalDays);
            stats.avgProtein = Math.round((totalProtein / stats.totalDays) * 10) / 10;
            stats.avgCarbs = Math.round((totalCarbs / stats.totalDays) * 10) / 10;
            stats.avgFat = Math.round((totalFat / stats.totalDays) * 10) / 10;
        }

        return stats;
    }
}

// Global meal tracker instance
window.MealTracker = MealTracker;
