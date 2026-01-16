# CSV Data Plotter

A modern web application for uploading CSV files and creating interactive 
2D plots with flexible column selection.

## Features

- **CSV File Upload**: Support for common CSV formats (comma/semicolon separated, German/English number formats)
- **Flexible Column Selection**: Choose X-axis and multiple Y-axis columns
- **Multiple Chart Types**: Line, Bar, and Scatter plots
- **Metadata Display**: Automatic detection and display of comment-style metadata (lines starting with #)
- **Data Preview**: View first 10 rows of uploaded data
- **Download Charts**: Export charts as PNG images
- **Responsive Design**: Modern, user-friendly interface
- **Smart Number Formatting**: Automatic formatting for large numbers (K, 
M)

## Technology Stack

### Backend
- Node.js
- Express.js
- Multer (file upload)
- PapaParse (CSV parsing)

### Frontend
- Angular 17
- Chart.js (visualization)
- TypeScript
- CSS3

## Installation & Setup

### Prerequisites
- Node.js (v20+)
- npm

### Backend Setup
```bash
cd backend
npm install
node server.js
```

Backend runs on `http://localhost:3000`

### Frontend Setup
```bash
cd frontend
npm install
ng serve
```

Frontend runs on `http://localhost:4200`

## Usage

1. Open `http://localhost:4200` in your browser
2. Click "Choose CSV file" and select a CSV file
3. Click "Upload" to process the file
4. Select X-axis column from dropdown
5. Select one or more Y-axis columns from checkboxes
6. View the generated plot
7. Switch between Line, Bar, and Scatter chart types
8. Download chart as PNG if needed

## Supported CSV Formats

- Standard CSV with comma or semicolon separators
- German number format (1.000.000,00)
- English number format (1,000,000.00)
- Files with metadata headers (lines starting with #)

## Test Data

Three test CSV files are included:
- **TestData1.csv**: Engineering data with large numbers
- **TestData2.csv**: Frequency sweep data with metadata
- **TestData3.csv**: Simple mathematical function data

## Project Structure
```
csv-plotter/
├── backend/
│   ├── routes/
│   │   └── csv.routes.js
│   ├── uploads/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── upload/
│   │   │   │   ├── column-selector/
│   │   │   │   ├── chart-display/
│   │   │   │   ├── data-preview/
│   │   │   │   └── metadata-view/
│   │   │   ├── services/
│   │   │   │   └── csv.service.ts
│   │   │   ├── app.component.ts
│   │   │   └── app.config.ts
│   │   └── styles.css
│   └── package.json
└── README.md
```

## Limitations
- Y-axis values must be numeric to be plotted.
- Metadata detection is limited to comment-style lines starting with '#'.

## Assessment Project

This project was developed as an assessment task for a software 
development internship application.

## License

This project is for assessment purposes only.
