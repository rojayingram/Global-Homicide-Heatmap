# Global Homicide Rate Dashboard

A modern, interactive web application for visualizing global homicide rates with country-level details and historical data trends.

🔗 **Live Demo**: [https://rojayingram.github.io/Global-Homicide-Heatmap/](https://rojayingram.github.io/Global-Homicide-Heatmap/)

![Dashboard Preview](https://img.shields.io/badge/Status-Live-success)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [APIs Used](#apis-used)
- [Data Coverage](#data-coverage)
- [Limitations & Assumptions](#limitations--assumptions)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### Global Dashboard (`/`)
- **Interactive heatmap table** with color-coded homicide rates (green = low, red = high)
- **Real-time search** - Filter countries by name
- **Region filtering** - View specific continents/regions
- **Sortable columns** - Click headers to sort by country, region, population, or homicide rate
- **Year selector** - View historical data from 2010-2022
- **Responsive design** - Works on desktop, tablet, and mobile
- **Beautiful animated background** - Modern gradient design with floating elements

### Country Detail View (`/country/:code`)
- **Large flag display**
- **Official country name**
- **Region & subregion information**
- **Population statistics**
- **Capital city**
- **Homicide rate with color-coded visualization**
- **ISO country code**
- **Graceful handling of missing data**


---

## 🚀 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/rojayingram/Global-Homicide-Heatmap.git
   cd Global-Homicide-Heatmap
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```



### Build for Production

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist/` directory, ready for deployment.

---

## 💻 Usage

### Viewing the Global Dashboard
1. Open the application at the root URL (`/`)
2. Browse the table of countries with their homicide rates
3. Use the search bar to find specific countries
4. Filter by region using the dropdown menu
5. Change the year to view historical data
6. Click on any column header to sort the data

### Viewing Country Details
1. Click on any country row in the table
2. View detailed information about that country
3. Click "Back to Dashboard" to return to the main view
4. Use browser back/forward buttons for navigation

### Sharing
- Copy the URL to share specific views
- Example: Share `/country/USA` to show United States details
- Bookmarks work for both dashboard and country pages

---

## 🌐 APIs Used

### 1. World Bank API - Intentional Homicides
**Endpoint**: `https://api.worldbank.org/v2/country/all/indicator/VC.IHR.PSRC.P5`

**Indicator**: `VC.IHR.PSRC.P5` - Intentional homicides (per 100,000 people)

**Documentation**: [World Bank Data API](https://datahelpdesk.worldbank.org/knowledgebase/articles/889392-about-the-indicators-api-documentation)

**What it provides**:
- Homicide rates per 100,000 people
- Historical data from 2010-2022
- Country-level statistics
- ISO country codes for matching

**Example Request**:
```
https://api.worldbank.org/v2/country/all/indicator/VC.IHR.PSRC.P5?format=json&per_page=300&date=2022
```

### 2. REST Countries API
**Endpoint**: `https://restcountries.com/v3.1/all`

**Documentation**: [REST Countries](https://restcountries.com/)

**What it provides**:
- Country names (common and official)
- ISO country codes (cca3)
- Regional classifications
- Population data
- Capital cities
- Flag images (SVG/PNG)
- Subregion information

**Example Request**:
```
https://restcountries.com/v3.1/alpha/USA?fields=name,cca3,region,subregion,population,capital,flags
```

---

## 📊 Data Coverage

### Years Available
- **Primary Range**: 2010-2022
- **Default Year**: 2022 (most recent)
- **Note**: Not all countries have data for all years

### Geographic Coverage
- **Total Countries**: ~150+ countries with population > 1M
- **Regions Covered**: 
  - Africa
  - Americas
  - Asia
  - Europe
  - Oceania

### Data Frequency
- **Update Cycle**: World Bank data is typically updated annually
- **Last Update**: Most recent data is from 2022
- **Historical Data**: Available back to 2010 for most countries

---

## ⚠️ Limitations & Assumptions

### Data Limitations

1. **Missing Data**
   - Not all countries report homicide data every year
   - Some countries have no recent data available
   - The app gracefully shows "No data available" for missing values

2. **Population Filter**
   - Only countries with population > 1 million are shown in the main table
   - This excludes small island nations and territories
   - Reduces clutter and focuses on major countries

3. **Data Accuracy**
   - Homicide data depends on national reporting standards
   - Different countries may have different definitions or collection methods
   - Data represents reported intentional homicides only

4. **Timeliness**
   - World Bank data may lag by 1-2 years
   - Most recent data is from 2022 (as of this build)
   - Check World Bank website for latest updates

### Technical Assumptions

1. **API Availability**
   - Assumes both APIs (World Bank and REST Countries) are accessible
   - No offline mode or cached data
   - Requires active internet connection

2. **Browser Compatibility**
   - Assumes modern browser with ES6+ support
   - Best viewed on Chrome, Firefox, Safari, or Edge
   - Requires JavaScript enabled

3. **Client-Side Routing**
   - Uses browser History API for routing
   - Deep links require proper server configuration for SPAs
   - GitHub Pages configuration included for deployment

4. **Color Scale**
   - Homicide rates use a diverging color scale (green-yellow-red)
   - Scale adjusts automatically based on data range
   - Higher rates = redder colors, lower rates = greener colors

5. **Country Matching**
   - Countries are matched between APIs using ISO 3-letter codes (cca3)
   - Some territories may not match if codes differ
   - Manual verification done for major countries

### Known Issues

1. **Year Selection**
   - Changing year refreshes all data
   - Number of countries may vary by year based on data availability

2. **Mobile Experience**
   - Table scrolls horizontally on small screens
   - Detail view is optimized for mobile but best on desktop

3. **Search Performance**
   - Search filters client-side (all data already loaded)
   - Very fast but requires initial data fetch

---

## 🛠️ Technologies

### Core
- **React 18.2.0** - UI framework
- **D3.js 7.8.5** - Color scales and data visualization
- **Tailwind CSS** - Styling and responsive design
- **Lucide React** - Icons

### Build Tools
- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting
- **PostCSS** - CSS processing

### APIs
- World Bank Data API (Homicide indicators)
- REST Countries API (Country metadata)

### Deployment
- GitHub Pages (Static hosting)
- Custom domain support
