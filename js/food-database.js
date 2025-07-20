// Food Database Management
class FoodDatabase {
    static foods = [];
    static initialized = false;

    static async init() {
        try {
            // Try to load from localStorage first (for custom foods)
            const customFoods = StorageManager.get('custom_foods', []);
            
            // Load default foods from JSON file
            const response = await fetch('./data/foods.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const defaultFoods = await response.json();
            
            // Combine default and custom foods
            this.foods = [...defaultFoods, ...customFoods];
            this.initialized = true;
            
            console.log(`Loaded ${this.foods.length} foods into database`);
        } catch (error) {
            console.error('Error loading food database:', error);
            // Fallback to basic foods if JSON fails to load
            this.foods = this.getBasicFoods();
            this.initialized = true;
        }
    }

    static getBasicFoods() {
        return [
            {
                id: 'rice_white',
                name: 'White Rice (cooked)',
                calories: 130,
                protein: 2.7,
                carbs: 28,
                fat: 0.3,
                category: 'grains'
            },
            {
                id: 'chicken_breast',
                name: 'Chicken Breast (cooked)',
                calories: 165,
                protein: 31,
                carbs: 0,
                fat: 3.6,
                category: 'protein'
            },
            {
                id: 'egg_whole',
                name: 'Whole Egg',
                calories: 155,
                protein: 13,
                carbs: 1.1,
                fat: 11,
                category: 'protein'
            },
            {
                id: 'apple',
                name: 'Apple',
                calories: 52,
                protein: 0.3,
                carbs: 14,
                fat: 0.2,
                category: 'fruit'
            },
            {
                id: 'banana',
                name: 'Banana',
                calories: 89,
                protein: 1.1,
                carbs: 23,
                fat: 0.3,
                category: 'fruit'
            },
            {
                id: 'broccoli',
                name: 'Broccoli (cooked)',
                calories: 35,
                protein: 2.8,
                carbs: 7,
                fat: 0.4,
                category: 'vegetable'
            },
            {
                id: 'bread_whole_wheat',
                name: 'Whole Wheat Bread',
                calories: 247,
                protein: 13,
                carbs: 41,
                fat: 4.2,
                category: 'grains'
            },
            {
                id: 'milk_whole',
                name: 'Whole Milk',
                calories: 61,
                protein: 3.2,
                carbs: 4.8,
                fat: 3.3,
                category: 'dairy'
            },
            {
                id: 'salmon',
                name: 'Salmon (cooked)',
                calories: 206,
                protein: 22,
                carbs: 0,
                fat: 12,
                category: 'protein'
            },
            {
                id: 'yogurt_plain',
                name: 'Plain Yogurt',
                calories: 59,
                protein: 10,
                carbs: 3.6,
                fat: 0.4,
                category: 'dairy'
            },
            {
                id: 'oats',
                name: 'Oats (cooked)',
                calories: 68,
                protein: 2.4,
                carbs: 12,
                fat: 1.4,
                category: 'grains'
            },
            {
                id: 'sweet_potato',
                name: 'Sweet Potato (baked)',
                calories: 90,
                protein: 2,
                carbs: 21,
                fat: 0.1,
                category: 'vegetable'
            },
            {
                id: 'olive_oil',
                name: 'Olive Oil',
                calories: 884,
                protein: 0,
                carbs: 0,
                fat: 100,
                category: 'fat'
            },
            {
                id: 'almonds',
                name: 'Almonds',
                calories: 576,
                protein: 21,
                carbs: 22,
                fat: 49,
                category: 'nuts'
            },
            {
                id: 'spinach',
                name: 'Spinach (raw)',
                calories: 23,
                protein: 2.9,
                carbs: 3.6,
                fat: 0.4,
                category: 'vegetable'
            }
        ];
    }

    static getAllFoods() {
        return [...this.foods];
    }

    static getFoodById(id) {
        return this.foods.find(food => food.id === id);
    }

    static searchFoods(query) {
        if (!query || query.trim() === '') {
            return this.getAllFoods();
        }

        const searchTerm = query.toLowerCase().trim();
        
        return this.foods.filter(food => 
            food.name.toLowerCase().includes(searchTerm) ||
            food.category.toLowerCase().includes(searchTerm)
        ).sort((a, b) => {
            // Prioritize exact matches and name starts
            const aNameLower = a.name.toLowerCase();
            const bNameLower = b.name.toLowerCase();
            
            if (aNameLower.startsWith(searchTerm) && !bNameLower.startsWith(searchTerm)) {
                return -1;
            }
            if (!aNameLower.startsWith(searchTerm) && bNameLower.startsWith(searchTerm)) {
                return 1;
            }
            
            return aNameLower.localeCompare(bNameLower);
        });
    }

    static getFoodsByCategory(category) {
        return this.foods.filter(food => food.category === category);
    }

    static getCategories() {
        const categories = new Set(this.foods.map(food => food.category));
        return Array.from(categories).sort();
    }

    static addCustomFood(foodData) {
        // Validate required fields
        const requiredFields = ['name', 'calories', 'protein', 'carbs', 'fat'];
        for (const field of requiredFields) {
            if (!(field in foodData) || foodData[field] === null || foodData[field] === undefined) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        // Generate ID if not provided
        if (!foodData.id) {
            foodData.id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }

        // Set default category if not provided
        if (!foodData.category) {
            foodData.category = 'custom';
        }

        // Add to foods array
        this.foods.push(foodData);

        // Save custom foods to localStorage
        const customFoods = this.foods.filter(food => food.id.startsWith('custom_'));
        StorageManager.set('custom_foods', customFoods);

        return foodData.id;
    }

    static removeCustomFood(id) {
        if (!id.startsWith('custom_')) {
            throw new Error('Can only remove custom foods');
        }

        this.foods = this.foods.filter(food => food.id !== id);

        // Update localStorage
        const customFoods = this.foods.filter(food => food.id.startsWith('custom_'));
        StorageManager.set('custom_foods', customFoods);

        return true;
    }

    static updateCustomFood(id, updates) {
        if (!id.startsWith('custom_')) {
            throw new Error('Can only update custom foods');
        }

        const foodIndex = this.foods.findIndex(food => food.id === id);
        if (foodIndex === -1) {
            throw new Error('Food not found');
        }

        // Update the food
        this.foods[foodIndex] = { ...this.foods[foodIndex], ...updates };

        // Update localStorage
        const customFoods = this.foods.filter(food => food.id.startsWith('custom_'));
        StorageManager.set('custom_foods', customFoods);

        return this.foods[foodIndex];
    }

    static calculateNutrition(foodId, portionGrams) {
        const food = this.getFoodById(foodId);
        if (!food) {
            throw new Error('Food not found');
        }

        const multiplier = portionGrams / 100; // All nutrition values are per 100g

        return {
            calories: Math.round((food.calories || 0) * multiplier * 10) / 10,
            protein: Math.round((food.protein || 0) * multiplier * 10) / 10,
            carbs: Math.round((food.carbs || 0) * multiplier * 10) / 10,
            fat: Math.round((food.fat || 0) * multiplier * 10) / 10
        };
    }

    static exportFoods() {
        return {
            foods: this.getAllFoods(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }

    static importFoods(data) {
        try {
            if (!data.foods || !Array.isArray(data.foods)) {
                throw new Error('Invalid food data format');
            }

            // Validate each food item
            for (const food of data.foods) {
                if (!food.name || !food.id) {
                    throw new Error('Food items must have name and id');
                }
            }

            // Only import custom foods to avoid overriding defaults
            const customFoods = data.foods.filter(food => 
                food.id.startsWith('custom_') || food.category === 'custom'
            );

            // Add to current foods (avoiding duplicates)
            const existingIds = new Set(this.foods.map(f => f.id));
            const newFoods = customFoods.filter(food => !existingIds.has(food.id));

            this.foods.push(...newFoods);

            // Update localStorage
            const allCustomFoods = this.foods.filter(food => 
                food.id.startsWith('custom_') || food.category === 'custom'
            );
            StorageManager.set('custom_foods', allCustomFoods);

            return newFoods.length;
        } catch (error) {
            console.error('Error importing foods:', error);
            throw error;
        }
    }

    static getPopularFoods(limit = 10) {
        // For now, return first foods - could be enhanced with usage tracking
        return this.foods.slice(0, limit);
    }

    static validateFoodData(foodData) {
        const requiredFields = ['name', 'calories', 'protein', 'carbs', 'fat'];
        
        for (const field of requiredFields) {
            if (!(field in foodData)) {
                return { valid: false, error: `Missing field: ${field}` };
            }
            
            if (field !== 'name' && (isNaN(foodData[field]) || foodData[field] < 0)) {
                return { valid: false, error: `Invalid ${field}: must be a non-negative number` };
            }
        }

        if (typeof foodData.name !== 'string' || foodData.name.trim().length === 0) {
            return { valid: false, error: 'Name must be a non-empty string' };
        }

        return { valid: true };
    }
}

// Global food database instance
window.FoodDatabase = FoodDatabase;
