// Netlify Function: Get ALL Pending Deliverables
const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  try {
    // Path to all deliverables
    const pendingDir = path.join(__dirname, '../public/pending-approval');
    
    // Read all files from pending-approval folder
    const files = fs.readdirSync(pendingDir);
    
    // Load ALL JSON files (all deliverables: sponsors, memberships, artwork, legal, etc.)
    const allFiles = files.filter(f => f.endsWith('.json'));
    
    // Load and parse all JSON files
    const deliverables = allFiles.map(filename => {
      const filePath = path.join(pendingDir, filename);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent);
    });

    // Sort by created date (newest first)
    deliverables.sort((a, b) => new Date(b.created) - new Date(a.created));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        count: deliverables.length,
        deliverables: deliverables
      })
    };

  } catch (error) {
    console.error('Error loading sponsors:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: error.message,
        deliverables: []
      })
    };
  }
};
