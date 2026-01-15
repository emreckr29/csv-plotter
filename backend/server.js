const express = require('express');
const cors = require('cors');
const csvRoutes = require('./routes/csv.routes');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', csvRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'CSV Plotter API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});