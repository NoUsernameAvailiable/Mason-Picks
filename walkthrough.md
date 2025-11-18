# Mason Picks Walkthrough

## Overview
Mason Picks is a React application that helps George Mason University students find courses with high GPAs. It processes a CSV file of course history into a JSON database and provides a fast, searchable interface.

## Features
- **Search**: Filter courses by code, title, or professor.
- **Filtering**: Filter by minimum GPA (e.g., 3.0+, 4.0).
- **Sorting**: Sort by GPA (High to Low / Low to High).
- **Responsive Design**: Works on desktop and mobile.
- **Performance**: Uses a pre-processed JSON database for instant results.

## How to Run
1. **Install Dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Process Data**:
   The app uses a JSON file generated from the CSV. If you need to regenerate it:
   ```bash
   npm run process-data
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Build for Production**:
   ```bash
   npm run build
   ```

## Verification Results
- **Build**: Passed (`npm run build`).
- **Data Processing**: Successfully parsed 99k+ rows and generated 24k+ course entries.
- **UI**: Implemented with Tailwind CSS v4 and React.
