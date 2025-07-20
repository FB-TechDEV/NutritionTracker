// Local Storage Management
class StorageManager {
    static KEYS = {
        MEALS: 'diet_planner_meals',
        SETTINGS: 'diet_planner_settings',
        LANGUAGE: 'diet_planner_language'
    };

    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error(`Error getting ${key} from localStorage:`, error);
            return defaultValue;
        }
    }

    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error setting ${key} in localStorage:`, error);
            return false;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Error removing ${key} from localStorage:`, error);
            return false;
        }
    }

    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }

    // Meals specific methods
    static getMeals() {
        return this.get(this.KEYS.MEALS, {});
    }

    static saveMeals(meals) {
        return this.set(this.KEYS.MEALS, meals);
    }

    static getMealsForDate(dateKey) {
        const allMeals = this.getMeals();
        return allMeals[dateKey] || {
            breakfast: [],
            lunch: [],
            dinner: [],
            snacks: []
        };
    }

    static saveMealsForDate(dateKey, meals) {
        const allMeals = this.getMeals();
        allMeals[dateKey] = meals;
        return this.saveMeals(allMeals);
    }

    static addMealItem(dateKey, mealType, mealItem) {
        const dayMeals = this.getMealsForDate(dateKey);
        
        if (!dayMeals[mealType]) {
            dayMeals[mealType] = [];
        }
        
        dayMeals[mealType].push(mealItem);
        return this.saveMealsForDate(dateKey, dayMeals);
    }

    static removeMealItem(dateKey, mealType, itemId) {
        const dayMeals = this.getMealsForDate(dateKey);
        
        if (dayMeals[mealType]) {
            dayMeals[mealType] = dayMeals[mealType].filter(item => item.id !== itemId);
            return this.saveMealsForDate(dateKey, dayMeals);
        }
        
        return false;
    }

    // Settings methods
    static getSettings() {
        return this.get(this.KEYS.SETTINGS, {
            language: 'en',
            theme: 'light',
            units: 'metric'
        });
    }

    static saveSettings(settings) {
        return this.set(this.KEYS.SETTINGS, settings);
    }

    static updateSetting(key, value) {
        const settings = this.getSettings();
        settings[key] = value;
        return this.saveSettings(settings);
    }

    // Language specific methods
    static getLanguage() {
        return this.get(this.KEYS.LANGUAGE, 'en');
    }

    static saveLanguage(language) {
        return this.set(this.KEYS.LANGUAGE, language);
    }

    // Data export/import
    static exportData() {
        try {
            const data = {
                meals: this.getMeals(),
                settings: this.getSettings(),
                language: this.getLanguage(),
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            
            return JSON.stringify(data, null, 2);
        } catch (error) {
            console.error('Error exporting data:', error);
            return null;
        }
    }

    static importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.meals) {
                this.saveMeals(data.meals);
            }
            
            if (data.settings) {
                this.saveSettings(data.settings);
            }
            
            if (data.language) {
                this.saveLanguage(data.language);
            }
            
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Storage space management
    static getStorageUsage() {
        try {
            let totalSize = 0;
            
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalSize += localStorage[key].length;
                }
            }
            
            return {
                used: totalSize,
                usedKB: Math.round(totalSize / 1024 * 100) / 100,
                available: 5 * 1024 * 1024 - totalSize // Assuming 5MB limit
            };
        } catch (error) {
            console.error('Error calculating storage usage:', error);
            return null;
        }
    }

    // Data cleanup
    static cleanupOldData(daysToKeep = 30) {
        try {
            const allMeals = this.getMeals();
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
            
            const cleanedMeals = {};
            
            for (const dateKey in allMeals) {
                const mealDate = new Date(dateKey);
                if (mealDate >= cutoffDate) {
                    cleanedMeals[dateKey] = allMeals[dateKey];
                }
            }
            
            this.saveMeals(cleanedMeals);
            return true;
        } catch (error) {
            console.error('Error cleaning up old data:', error);
            return false;
        }
    }

    // Data validation
    static validateMealData(mealData) {
        if (!mealData || typeof mealData !== 'object') {
            return false;
        }

        const requiredMealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
        
        for (const mealType of requiredMealTypes) {
            if (!Array.isArray(mealData[mealType])) {
                return false;
            }
        }

        return true;
    }

    static validateMealItem(mealItem) {
        if (!mealItem || typeof mealItem !== 'object') {
            return false;
        }

        const requiredFields = ['id', 'name', 'calories'];
        
        for (const field of requiredFields) {
            if (!(field in mealItem)) {
                return false;
            }
        }

        return true;
    }
}

// Global storage instance
window.StorageManager = StorageManager;
