const express = require('express');
const router = express.Router();
const multer = require('multer');
const Papa = require('papaparse');
const fs = require('fs');
const path = require('path');

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed!'));
    }
  }
});

// Helper function to parse CSV files
function parseCSV(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  // Check for metadata (for files like TestData2)
  const lines = fileContent.split('\n');
  let metadata = [];
  let headerLine = null;
  let dataStartIndex = 0;
  let hasMetadata = false;

  // Detect metadata and header
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('#')) {
      // Count separators (semicolons or commas)
      const separatorCount = (line.match(/[;,]/g) || []).length;
      
      // If line has 2+ separators AND looks like a header
      // (e.g., contains words like "Point", "Freq", column names)
      if (separatorCount >= 2) {
        // Check if it looks like a header (not just random metadata with semicolons)
        const withoutHash = line.substring(1).trim();
        const parts = withoutHash.split(/[;,]/).map(p => p.trim());
        
        // If parts are short and look like column names (not sentences)
        const looksLikeHeader = parts.every(part => 
          part.length > 0 && part.length < 50 && !part.includes(':')
        );
        
        if (looksLikeHeader) {
          // This is the header line
          headerLine = withoutHash;
          dataStartIndex = i + 1;
          break;
        } else {
          // Metadata with semicolons
          hasMetadata = true;
          metadata.push(line);
        }
      } else {
        // Regular metadata line
        hasMetadata = true;
        metadata.push(line);
      }
    } else if (line !== '') {
      // First non-# line is the start of data
      dataStartIndex = i;
      break;
    }
  }

  // If we found a header in metadata, use it. Otherwise, let Papa Parse detect it
  let dataContent;
  if (headerLine) {
    // Prepend the header line to the data
    dataContent = headerLine + '\n' + lines.slice(dataStartIndex).join('\n');
  } else {
    dataContent = lines.slice(dataStartIndex).join('\n');
  }

  // Parse CSV using Papa Parse
  const result = Papa.parse(dataContent, {
    header: true,
    dynamicTyping: false,
    skipEmptyLines: true,
    delimiter: '', // Auto-detect delimiter (comma or semicolon)
    transformHeader: (header) => {
      return header.trim();
    }
  });

  // Post-process: Convert number strings to actual numbers
  const processedData = result.data.map(row => {
    const processedRow = {};
    for (let key in row) {
      processedRow[key] = parseNumber(row[key]);
    }
    return processedRow;
  });

  return {
    data: processedData,
    columns: result.meta.fields,
    metadata: hasMetadata ? metadata : null,
    hasMetadata: hasMetadata
  };
}

// Helper function to parse numbers in different formats
function parseNumber(value) {
  if (typeof value !== 'string') return value;
  
  value = value.trim();
  
  // If it's not a number-like string, return as is
  if (!/^-?[\d.,]+$/.test(value)) {
    return value;
  }
  
  // Count dots and commas
  const dotCount = (value.match(/\./g) || []).length;
  const commaCount = (value.match(/,/g) || []).length;
  
  let cleanValue = value;
  
  // Case 1: Has both dots and commas
  if (dotCount > 0 && commaCount > 0) {
    const lastDotIndex = value.lastIndexOf('.');
    const lastCommaIndex = value.lastIndexOf(',');
    
    // If comma comes after dot -> European format (1.000,00)
    if (lastCommaIndex > lastDotIndex) {
      cleanValue = value.replace(/\./g, '').replace(',', '.');
    }
    // If dot comes after comma -> US format (1,000.00)
    else {
      cleanValue = value.replace(/,/g, '');
    }
  }
  // Case 2: Only dots
  else if (dotCount > 0 && commaCount === 0) {
    // Multiple dots -> thousands separator (1.000.000)
    if (dotCount > 1) {
      cleanValue = value.replace(/\./g, '');
    }
    // Single dot -> decimal point (1000.50) - keep as is
  }
  // Case 3: Only commas
  else if (commaCount > 0 && dotCount === 0) {
    // Multiple commas -> thousands separator (1,000,000)
    if (commaCount > 1) {
      cleanValue = value.replace(/,/g, '');
    }
    // Single comma -> could be decimal (1000,50) or thousands (1,000)
    else {
      // Check position: if comma is in last 3 positions -> likely decimal
      const parts = value.split(',');
      if (parts[1] && parts[1].length <= 2) {
        // Decimal separator
        cleanValue = value.replace(',', '.');
      } else {
        // Thousands separator
        cleanValue = value.replace(',', '');
      }
    }
  }
  
  const num = parseFloat(cleanValue);
  return isNaN(num) ? value : num;
}

// POST /api/upload - Upload and parse CSV file
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded!' });
    }

    const filePath = req.file.path;
    const parsed = parseCSV(filePath);

    res.json({
      success: true,
      fileName: req.file.originalname,
      filePath: filePath,
      columns: parsed.columns,
      rowCount: parsed.data.length,
      hasMetadata: parsed.hasMetadata,
      metadata: parsed.metadata,
      preview: parsed.data.slice(0, 10) // First 10 rows preview
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to parse CSV file!', 
      details: error.message 
    });
  }
});

// POST /api/plot-data - Return plot data for selected columns
router.post('/plot-data', (req, res) => {
  try {
    const { filePath, xColumn, yColumns } = req.body;

    if (!filePath || !xColumn || !yColumns || yColumns.length === 0) {
      return res.status(400).json({ 
        error: 'filePath, xColumn and yColumns are required!' 
      });
    }

    const parsed = parseCSV(filePath);
    const data = parsed.data;

    // Prepare data for plotting
    const plotData = {
      labels: data.map(row => row[xColumn]),
      datasets: yColumns.map((yCol, index) => ({
        label: yCol,
        data: data.map(row => row[yCol]),
        borderColor: getColor(index),
        backgroundColor: getColor(index, 0.2),
        fill: false
      }))
    };

    res.json({
      success: true,
      plotData: plotData,
      xColumn: xColumn,
      yColumns: yColumns
    });

  } catch (error) {
    console.error('Plot data error:', error);
    res.status(500).json({ 
      error: 'Failed to generate plot data!', 
      details: error.message 
    });
  }
});

// Color palette - different color for each Y-axis
function getColor(index, alpha = 1) {
  const colors = [
    `rgba(54, 162, 235, ${alpha})`,   // Blue
    `rgba(255, 99, 132, ${alpha})`,   // Red
    `rgba(75, 192, 192, ${alpha})`,   // Green
    `rgba(255, 206, 86, ${alpha})`,   // Yellow
    `rgba(153, 102, 255, ${alpha})`,  // Purple
    `rgba(255, 159, 64, ${alpha})`,   // Orange
  ];
  return colors[index % colors.length];
}

module.exports = router;