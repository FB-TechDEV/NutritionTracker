// Charts and Data Visualization
class ChartsManager {
    static charts = {};
    static chartConfigs = {
        daily: {
            type: 'doughnut',
            responsive: true,
            maintainAspectRatio: true
        },
        weekly: {
            type: 'line',
            responsive: true,
            maintainAspectRatio: true
        }
    };

    static init() {
        console.log('ChartsManager initialized');
    }

    static loadCharts() {
        this.loadDailyChart();
        this.loadWeeklyChart();
    }

    static loadDailyChart() {
        const dateKey = MealTracker.formatDate(window.dietApp.currentDate);
        const mealDistribution = MealTracker.getMealTypeDistribution(dateKey);
        
        const ctx = document.getElementById('dailyChart');
        if (!ctx) return;

        // Destroy existing chart if it exists
        if (this.charts.daily) {
            this.charts.daily.destroy();
        }

        const data = {
            labels: [
                LanguageManager.translate('meals.breakfast'),
                LanguageManager.translate('meals.lunch'), 
                LanguageManager.translate('meals.dinner'),
                LanguageManager.translate('meals.snacks')
            ],
            datasets: [{
                data: [
                    mealDistribution.breakfast || 0,
                    mealDistribution.lunch || 0,
                    mealDistribution.dinner || 0,
                    mealDistribution.snacks || 0
                ],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB', 
                    '#FFCE56',
                    '#4BC0C0'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${value} kcal (${percentage}%)`;
                        }
                    }
                }
            }
        };

        this.charts.daily = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: options
        });
    }

    static loadWeeklyChart() {
        const weekData = this.getWeeklyChartData();
        
        const ctx = document.getElementById('weeklyChart');
        if (!ctx) return;

        // Destroy existing chart if it exists
        if (this.charts.weekly) {
            this.charts.weekly.destroy();
        }

        const data = {
            labels: weekData.labels,
            datasets: [
                {
                    label: LanguageManager.translate('summary.calories'),
                    data: weekData.calories,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: LanguageManager.translate('summary.protein'),
                    data: weekData.protein,
                    borderColor: '#FF6384',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y1'
                },
                {
                    label: LanguageManager.translate('summary.carbs'),
                    data: weekData.carbs,
                    borderColor: '#36A2EB',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y1'
                },
                {
                    label: LanguageManager.translate('summary.fat'),
                    data: weekData.fat,
                    borderColor: '#FFCE56',
                    backgroundColor: 'rgba(255, 206, 86, 0.1)',
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            return weekData.fullLabels[context[0].dataIndex];
                        },
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            const unit = label === LanguageManager.translate('summary.calories') ? 'kcal' : 'g';
                            return `${label}: ${value}${unit}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: LanguageManager.translate('charts.days')
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: LanguageManager.translate('summary.calories')
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: LanguageManager.translate('charts.macros')
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        };

        this.charts.weekly = new Chart(ctx, {
            type: 'line',
            data: data,
            options: options
        });
    }

    static getWeeklyChartData() {
        const weekStart = WeeklyPlanner.currentWeekStart || window.dietApp.getWeekStart(window.dietApp.currentDate);
        const weekData = MealTracker.getWeeklyTotals(weekStart);
        
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const fullDays = [
            'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
            'Friday', 'Saturday', 'Sunday'
        ];

        return {
            labels: days.map(day => LanguageManager.translate(`days.${day.toLowerCase()}`)),
            fullLabels: fullDays.map(day => LanguageManager.translate(`days.${day.toLowerCase()}`)),
            calories: weekData.map(day => day.calories),
            protein: weekData.map(day => day.protein),
            carbs: weekData.map(day => day.carbs),
            fat: weekData.map(day => day.fat),
            dates: weekData.map(day => day.dateObj)
        };
    }

    static createMacroComparisonChart(containerId, dateKey) {
        const dayTotals = MealTracker.getDailyTotals(dateKey);
        
        // Calculate macro percentages
        const totalMacroCalories = (dayTotals.protein * 4) + (dayTotals.carbs * 4) + (dayTotals.fat * 9);
        
        const macroPercentages = {
            protein: totalMacroCalories > 0 ? Math.round((dayTotals.protein * 4 / totalMacroCalories) * 100) : 0,
            carbs: totalMacroCalories > 0 ? Math.round((dayTotals.carbs * 4 / totalMacroCalories) * 100) : 0,
            fat: totalMacroCalories > 0 ? Math.round((dayTotals.fat * 9 / totalMacroCalories) * 100) : 0
        };

        const ctx = document.getElementById(containerId);
        if (!ctx) return null;

        const data = {
            labels: [
                `${LanguageManager.translate('summary.protein')} (${macroPercentages.protein}%)`,
                `${LanguageManager.translate('summary.carbs')} (${macroPercentages.carbs}%)`,
                `${LanguageManager.translate('summary.fat')} (${macroPercentages.fat}%)`
            ],
            datasets: [{
                data: [
                    dayTotals.protein * 4,
                    dayTotals.carbs * 4,
                    dayTotals.fat * 9
                ],
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = Math.round(context.parsed);
                            return `${label}: ${value} kcal`;
                        }
                    }
                }
            }
        };

        return new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: options
        });
    }

    static createCalorieProgressChart(containerId, targetCalories, currentCalories) {
        const ctx = document.getElementById(containerId);
        if (!ctx) return null;

        const remaining = Math.max(0, targetCalories - currentCalories);
        const excess = Math.max(0, currentCalories - targetCalories);

        const data = {
            labels: [
                LanguageManager.translate('charts.consumed'),
                remaining > 0 ? LanguageManager.translate('charts.remaining') : LanguageManager.translate('charts.excess')
            ],
            datasets: [{
                data: remaining > 0 ? [currentCalories, remaining] : [targetCalories, excess],
                backgroundColor: remaining > 0 ? ['#4CAF50', '#E0E0E0'] : ['#4CAF50', '#FF5722'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = Math.round(context.parsed);
                            return `${label}: ${value} kcal`;
                        }
                    }
                }
            }
        };

        return new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: options
        });
    }

    static updateCharts() {
        if (window.dietApp.currentTab === 'stats') {
            this.loadCharts();
        }
    }

    static destroyChart(chartName) {
        if (this.charts[chartName]) {
            this.charts[chartName].destroy();
            delete this.charts[chartName];
        }
    }

    static destroyAllCharts() {
        Object.keys(this.charts).forEach(chartName => {
            this.destroyChart(chartName);
        });
    }

    static exportChartData(chartName) {
        if (!this.charts[chartName]) {
            return null;
        }

        const chart = this.charts[chartName];
        return {
            type: chart.config.type,
            data: chart.config.data,
            options: chart.config.options,
            exportDate: new Date().toISOString()
        };
    }

    static getChartImage(chartName, format = 'png') {
        if (!this.charts[chartName]) {
            return null;
        }

        return this.charts[chartName].toBase64Image(format);
    }

    static createCustomChart(containerId, type, data, options = {}) {
        const ctx = document.getElementById(containerId);
        if (!ctx) return null;

        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                }
            }
        };

        const mergedOptions = this.mergeDeep(defaultOptions, options);

        return new Chart(ctx, {
            type: type,
            data: data,
            options: mergedOptions
        });
    }

    static mergeDeep(target, source) {
        const output = Object.assign({}, target);
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target))
                        Object.assign(output, { [key]: source[key] });
                    else
                        output[key] = this.mergeDeep(target[key], source[key]);
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    }

    static isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    static getChartColors(count) {
        const colors = [
            '#4CAF50', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0'
        ];
        
        return colors.slice(0, count);
    }
}

// Global charts manager instance
window.ChartsManager = ChartsManager;
