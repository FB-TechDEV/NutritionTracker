// Language Management and Internationalization
class LanguageManager {
    static currentLanguage = 'en';
    static translations = {};
    static supportedLanguages = ['en', 'ar'];
    static initialized = false;

    static async init() {
        try {
            // Load saved language preference
            this.currentLanguage = StorageManager.getLanguage();
            
            // Load translations
            const response = await fetch('./data/translations.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.translations = await response.json();
            this.initialized = true;
            
            // Apply language to UI
            this.applyLanguage();
            
            console.log(`Language manager initialized with ${this.currentLanguage}`);
        } catch (error) {
            console.error('Error loading translations:', error);
            // Fallback to default translations
            this.translations = this.getDefaultTranslations();
            this.initialized = true;
            this.applyLanguage();
        }
    }

    static getDefaultTranslations() {
        return {
            en: {
                'app.title': 'Diet Planner',
                'nav.today': 'Today',
                'nav.weekly': 'Weekly',
                'nav.foods': 'Foods',
                'nav.stats': 'Stats',
                'summary.calories': 'Calories',
                'summary.protein': 'Protein',
                'summary.carbs': 'Carbs',
                'summary.fat': 'Fat',
                'meals.breakfast': 'Breakfast',
                'meals.lunch': 'Lunch',
                'meals.dinner': 'Dinner',
                'meals.snacks': 'Snacks',
                'meals.empty': 'No foods added yet',
                'foods.title': 'Food Database',
                'foods.search': 'Search foods...',
                'foods.no_results': 'No foods found',
                'modal.add_food': 'Add Food',
                'modal.portion': 'Portion (g)',
                'modal.add': 'Add to Meal',
                'stats.title': 'Nutrition Statistics',
                'stats.daily_intake': 'Daily Intake',
                'stats.weekly_trend': 'Weekly Trend',
                'weekly.items': 'items',
                'weekly.no_meals': 'No meals planned',
                'charts.days': 'Days',
                'charts.macros': 'Macros (g)',
                'charts.consumed': 'Consumed',
                'charts.remaining': 'Remaining',
                'charts.excess': 'Excess',
                'days.monday': 'Monday',
                'days.tuesday': 'Tuesday',
                'days.wednesday': 'Wednesday',
                'days.thursday': 'Thursday',
                'days.friday': 'Friday',
                'days.saturday': 'Saturday',
                'days.sunday': 'Sunday',
                'days.mon': 'Mon',
                'days.tue': 'Tue',
                'days.wed': 'Wed',
                'days.thu': 'Thu',
                'days.fri': 'Fri',
                'days.sat': 'Sat',
                'days.sun': 'Sun'
            },
            ar: {
                'app.title': 'مخطط النظام الغذائي',
                'nav.today': 'اليوم',
                'nav.weekly': 'أسبوعي',
                'nav.foods': 'الأطعمة',
                'nav.stats': 'إحصائيات',
                'summary.calories': 'السعرات',
                'summary.protein': 'البروتين',
                'summary.carbs': 'الكربوهيدرات',
                'summary.fat': 'الدهون',
                'meals.breakfast': 'الإفطار',
                'meals.lunch': 'الغداء',
                'meals.dinner': 'العشاء',
                'meals.snacks': 'الوجبات الخفيفة',
                'meals.empty': 'لم تتم إضافة أطعمة بعد',
                'foods.title': 'قاعدة بيانات الطعام',
                'foods.search': 'البحث عن الأطعمة...',
                'foods.no_results': 'لم يتم العثور على أطعمة',
                'modal.add_food': 'إضافة طعام',
                'modal.portion': 'الحصة (غرام)',
                'modal.add': 'إضافة للوجبة',
                'stats.title': 'إحصائيات التغذية',
                'stats.daily_intake': 'الاستهلاك اليومي',
                'stats.weekly_trend': 'الاتجاه الأسبوعي',
                'weekly.items': 'عناصر',
                'weekly.no_meals': 'لا توجد وجبات مخططة',
                'charts.days': 'الأيام',
                'charts.macros': 'المغذيات الكبرى (غ)',
                'charts.consumed': 'مستهلك',
                'charts.remaining': 'متبقي',
                'charts.excess': 'فائض',
                'days.monday': 'الاثنين',
                'days.tuesday': 'الثلاثاء',
                'days.wednesday': 'الأربعاء',
                'days.thursday': 'الخميس',
                'days.friday': 'الجمعة',
                'days.saturday': 'السبت',
                'days.sunday': 'الأحد',
                'days.mon': 'الاثنين',
                'days.tue': 'الثلاثاء',
                'days.wed': 'الأربعاء',
                'days.thu': 'الخميس',
                'days.fri': 'الجمعة',
                'days.sat': 'السبت',
                'days.sun': 'الأحد'
            }
        };
    }

    static translate(key, fallback = key) {
        if (!this.initialized) {
            return fallback;
        }

        const languageTranslations = this.translations[this.currentLanguage];
        if (!languageTranslations) {
            return fallback;
        }

        return languageTranslations[key] || fallback;
    }

    static applyLanguage() {
        // Set document direction for RTL languages
        document.documentElement.dir = this.currentLanguage === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = this.currentLanguage;
        
        // Update current language display
        const languageDisplay = document.getElementById('currentLanguage');
        if (languageDisplay) {
            languageDisplay.textContent = this.currentLanguage.toUpperCase();
        }

        // Apply translations to all elements with data-translate attribute
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.translate(key);
            element.textContent = translation;
        });

        // Apply translations to placeholder attributes
        document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
            const key = element.getAttribute('data-translate-placeholder');
            const translation = this.translate(key);
            element.placeholder = translation;
        });

        // Apply RTL specific styles
        this.applyRTLStyles();

        // Update charts if they exist
        if (window.ChartsManager && window.ChartsManager.updateCharts) {
            setTimeout(() => {
                window.ChartsManager.updateCharts();
            }, 100);
        }

        console.log(`Applied ${this.currentLanguage} language to UI`);
    }

    static applyRTLStyles() {
        if (this.currentLanguage === 'ar') {
            document.body.classList.add('rtl');
            
            // Add RTL specific CSS
            if (!document.getElementById('rtl-styles')) {
                const rtlStyles = document.createElement('style');
                rtlStyles.id = 'rtl-styles';
                rtlStyles.textContent = `
                    .rtl .meal-header {
                        flex-direction: row-reverse;
                    }
                    .rtl .summary-card {
                        direction: rtl;
                    }
                    .rtl .food-nutrition {
                        direction: rtl;
                    }
                    .rtl .date-selector,
                    .rtl .week-selector {
                        flex-direction: row-reverse;
                    }
                    .rtl .modal-header {
                        flex-direction: row-reverse;
                    }
                    .rtl .food-search i,
                    .rtl .food-search-modal i {
                        right: auto;
                        left: 1rem;
                    }
                    .rtl .food-search input,
                    .rtl .food-search-modal input {
                        padding: 0.75rem 1rem 0.75rem 2.5rem;
                    }
                    .rtl .nav-tabs {
                        flex-direction: row-reverse;
                    }
                `;
                document.head.appendChild(rtlStyles);
            }
        } else {
            document.body.classList.remove('rtl');
            
            // Remove RTL styles
            const rtlStyles = document.getElementById('rtl-styles');
            if (rtlStyles) {
                rtlStyles.remove();
            }
        }
    }

    static toggleLanguage() {
        const currentIndex = this.supportedLanguages.indexOf(this.currentLanguage);
        const nextIndex = (currentIndex + 1) % this.supportedLanguages.length;
        this.setLanguage(this.supportedLanguages[nextIndex]);
    }

    static setLanguage(language) {
        if (!this.supportedLanguages.includes(language)) {
            console.warn(`Unsupported language: ${language}`);
            return false;
        }

        this.currentLanguage = language;
        StorageManager.saveLanguage(language);
        this.applyLanguage();
        
        // Trigger custom event for language change
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language: language }
        }));

        return true;
    }

    static getCurrentLanguage() {
        return this.currentLanguage;
    }

    static getSupportedLanguages() {
        return [...this.supportedLanguages];
    }

    static isRTL() {
        return this.currentLanguage === 'ar';
    }

    static formatNumber(number, options = {}) {
        const defaults = {
            minimumFractionDigits: 0,
            maximumFractionDigits: 1
        };
        
        const formatOptions = { ...defaults, ...options };
        
        try {
            return new Intl.NumberFormat(this.currentLanguage, formatOptions).format(number);
        } catch (error) {
            // Fallback to simple formatting
            return number.toFixed(formatOptions.maximumFractionDigits);
        }
    }

    static formatDate(date, options = {}) {
        const defaults = {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        
        const formatOptions = { ...defaults, ...options };
        
        try {
            return new Intl.DateTimeFormat(this.currentLanguage, formatOptions).format(date);
        } catch (error) {
            // Fallback to simple formatting
            return date.toLocaleDateString();
        }
    }

    static addTranslation(language, key, value) {
        if (!this.translations[language]) {
            this.translations[language] = {};
        }
        
        this.translations[language][key] = value;
    }

    static addTranslations(language, translations) {
        if (!this.translations[language]) {
            this.translations[language] = {};
        }
        
        Object.assign(this.translations[language], translations);
    }

    static exportTranslations() {
        return {
            translations: this.translations,
            currentLanguage: this.currentLanguage,
            supportedLanguages: this.supportedLanguages,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }

    static importTranslations(data) {
        try {
            if (data.translations) {
                this.translations = { ...this.translations, ...data.translations };
            }
            
            if (data.supportedLanguages) {
                this.supportedLanguages = [...new Set([...this.supportedLanguages, ...data.supportedLanguages])];
            }
            
            this.applyLanguage();
            return true;
        } catch (error) {
            console.error('Error importing translations:', error);
            return false;
        }
    }

    static validateTranslations() {
        const issues = [];
        const baseLanguage = 'en';
        
        if (!this.translations[baseLanguage]) {
            issues.push(`Base language '${baseLanguage}' not found`);
            return issues;
        }

        const baseKeys = Object.keys(this.translations[baseLanguage]);
        
        this.supportedLanguages.forEach(lang => {
            if (lang === baseLanguage) return;
            
            if (!this.translations[lang]) {
                issues.push(`Language '${lang}' not found`);
                return;
            }
            
            const langKeys = Object.keys(this.translations[lang]);
            
            // Check for missing keys
            baseKeys.forEach(key => {
                if (!langKeys.includes(key)) {
                    issues.push(`Missing translation for '${key}' in language '${lang}'`);
                }
            });
            
            // Check for extra keys
            langKeys.forEach(key => {
                if (!baseKeys.includes(key)) {
                    issues.push(`Extra translation key '${key}' in language '${lang}'`);
                }
            });
        });
        
        return issues;
    }

    static getTranslationProgress() {
        const baseLanguage = 'en';
        const progress = {};
        
        if (!this.translations[baseLanguage]) {
            return progress;
        }

        const totalKeys = Object.keys(this.translations[baseLanguage]).length;
        
        this.supportedLanguages.forEach(lang => {
            if (!this.translations[lang]) {
                progress[lang] = 0;
                return;
            }
            
            const translatedKeys = Object.keys(this.translations[lang]).length;
            progress[lang] = Math.round((translatedKeys / totalKeys) * 100);
        });
        
        return progress;
    }

    // Handle dynamic content translation
    static translateElement(element, key, fallback = null) {
        const translation = this.translate(key, fallback);
        element.textContent = translation;
        return translation;
    }

    static translateAttribute(element, attribute, key, fallback = null) {
        const translation = this.translate(key, fallback);
        element.setAttribute(attribute, translation);
        return translation;
    }

    // Handle pluralization for languages that need it
    static pluralize(key, count, fallback = null) {
        // Simple pluralization - can be enhanced for more complex rules
        if (count === 1) {
            return this.translate(key + '_singular', fallback);
        } else {
            return this.translate(key + '_plural', fallback || this.translate(key, fallback));
        }
    }
}

// Global language manager instance
window.LanguageManager = LanguageManager;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (!LanguageManager.initialized) {
        LanguageManager.init();
    }
});
