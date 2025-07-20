# Personal Diet & Meal Planner

## Overview

This is a Progressive Web Application (PWA) for personal diet and meal planning with offline capabilities. The application allows users to track daily food intake, plan weekly meals, and monitor nutritional statistics. It's built as a client-side only application with no backend dependencies, using local storage for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Single Page Application (SPA)**: Pure HTML, CSS, and vanilla JavaScript implementation
- **Modular JavaScript**: Object-oriented design with separate classes for different functionalities
- **Progressive Web App**: Includes service worker for offline functionality and app-like experience
- **Responsive Design**: Mobile-first approach with CSS Grid and Flexbox layouts

### Key Technologies
- **HTML5**: Semantic markup with PWA manifest
- **CSS3**: Modern styling with CSS Grid, Flexbox, and CSS custom properties
- **Vanilla JavaScript**: ES6+ classes and modules
- **Chart.js**: Data visualization for nutrition statistics
- **Font Awesome**: Icon library for UI elements
- **Service Worker**: Offline caching and PWA functionality

## Key Components

### 1. Application Controller (`js/app.js`)
- **Purpose**: Main application orchestrator and navigation controller
- **Responsibilities**: Tab switching, date navigation, PWA initialization, error handling
- **Architecture**: Central controller pattern that coordinates all other modules

### 2. Food Database (`js/food-database.js`)
- **Purpose**: Manages food items and nutritional data
- **Data Source**: JSON file with fallback to hardcoded basic foods
- **Features**: Search functionality, custom food support, category organization

### 3. Meal Tracker (`js/meal-tracker.js`)
- **Purpose**: Handles daily meal logging and food item management
- **Features**: Add/remove meals, portion tracking, nutritional calculations
- **Meal Types**: Breakfast, lunch, dinner, and snacks

### 4. Weekly Planner (`js/weekly-planner.js`)
- **Purpose**: Weekly meal planning and overview
- **Features**: Week-by-week navigation, daily summaries, meal planning interface

### 5. Storage Manager (`js/storage.js`)
- **Purpose**: Local storage abstraction and data persistence
- **Storage**: Browser localStorage for all user data
- **Data Types**: Meals, settings, language preferences, custom foods

### 6. Charts Manager (`js/charts.js`)
- **Purpose**: Data visualization and statistics
- **Charts**: Daily meal distribution (doughnut), weekly trends (line)
- **Library**: Chart.js for rendering interactive charts

### 7. Language Manager (`js/language.js`)
- **Purpose**: Internationalization and localization
- **Languages**: English and Arabic with RTL support
- **Features**: Dynamic translation, language persistence

## Data Flow

### User Interaction Flow
1. **Food Selection**: User browses food database or searches for specific items
2. **Meal Addition**: User selects portion size and adds food to specific meal type
3. **Data Storage**: Meal data stored in localStorage with date-based keys
4. **Real-time Updates**: UI updates immediately to reflect changes
5. **Statistics**: Charts and summaries calculated from stored meal data

### Data Storage Pattern
- **Date-based Keys**: Meals stored with YYYY-MM-DD format keys
- **Hierarchical Structure**: Date → Meal Type → Food Items
- **JSON Serialization**: All data stored as JSON strings in localStorage
- **Fallback Handling**: Default values provided when data is missing

## External Dependencies

### CDN Resources
- **Chart.js**: `https://cdn.jsdelivr.net/npm/chart.js` - Chart rendering library
- **Font Awesome**: `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css` - Icon fonts

### Static Data Files
- **Food Database**: `data/foods.json` - Nutritional information for common foods
- **Translations**: `data/translations.json` - Multi-language support data

### Browser APIs
- **localStorage**: Primary data persistence mechanism
- **Service Worker**: Offline functionality and caching
- **Fetch API**: Loading external JSON data files

## Deployment Strategy

### Progressive Web App Features
- **Offline First**: Service worker caches all static assets for offline usage
- **App Manifest**: Installable PWA with proper metadata and icons
- **Responsive**: Works on desktop, tablet, and mobile devices

### Cache Strategy
- **Static Assets**: All CSS, JS, and data files cached on first load
- **Cache Versioning**: Version-based cache invalidation (`diet-planner-v1`)
- **Fallback Strategy**: Network-first with cache fallback for external resources

### No Backend Required
- **Client-Only**: No server dependencies, can be deployed on any static hosting
- **Data Portability**: All user data stored locally, easily exportable
- **Privacy-First**: No data transmitted to external servers

### Hosting Compatibility
- **Static Hosting**: Compatible with GitHub Pages, Netlify, Vercel, or any web server
- **HTTPS Required**: PWA features require secure context
- **Cross-Platform**: Works in all modern browsers with PWA support

The application prioritizes user privacy and offline functionality, making it ideal for personal use without external dependencies or data sharing concerns.