const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

async function seed() {
  console.log("Parsing Excel to JSON...");
  const fileName = 'Copy of Mapping_Analysis_Reportv1(1).xlsx';
  const file = path.join(__dirname, '../public', fileName);
  console.log(`\nReading file: ${file}`);
  try {
    const wb = xlsx.readFile(file);
    const sheet = wb.Sheets['Clean Data']; // Explicitly load 'Clean Data' sheet
    if (!sheet) {
      console.log("Sheet 'Clean Data' not found!");
      return;
    }
    const data = xlsx.utils.sheet_to_json(sheet);
    
    if (data.length === 0) {
      console.log("No data found.");
      return;
    }

    console.log(`Loaded ${data.length} rows from 'Clean Data' sheet.`);
    
    const headers = Object.keys(data[0]);
    const lowerHeaders = headers.map(h => h.toLowerCase());
    
    const findHeader = (keywords) => {
      const idx = lowerHeaders.findIndex(h => keywords.some(k => h.includes(k)));
      return idx >= 0 ? headers[idx] : "";
    };
    
    // Hardcode the mapping since we saw the exact headers
    const mapping = {
      name: 'Name of the outlet',
      phone: 'What is the customers phone number?',
      lat: '_Take the geo-location of the outlet_latitude',
      lng: '_Take the geo-location of the outlet_longitude',
      type: 'Sub - Channel of the outlet',
      owner: 'Name of shop owner',
      agent: 'Agent Name'
    };

    console.log("Column Mapping:", mapping);
    
    console.log("Preparing data for DB insertion...");
    
    const batchSize = 5000;
    let records = [];
    let totalInserted = 0;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      let latVal = parseFloat(row[mapping.lat]);
      let lngVal = parseFloat(row[mapping.lng]);
      
      // Skip invalid coordinates
      if (isNaN(latVal) || isNaN(lngVal)) continue;
      // Skip (0,0) points
      if (latVal === 0 && lngVal === 0) continue;

      // Simply collect all records
      records.push({
        id: `imp-${i}`,
        name: row[mapping.name] ? String(row[mapping.name]) : `Imported Account ${i}`,
        latitude: latVal,
        longitude: lngVal,
        salesYTD: 0,
        customFields: {
          phone: row[mapping.phone] ? String(row[mapping.phone]) : "",
          businessType: row[mapping.type] ? String(row[mapping.type]) : "Imported",
          owner: row[mapping.owner] ? String(row[mapping.owner]) : "",
          agent: row[mapping.agent] ? String(row[mapping.agent]) : ""
        },
        status: "PROSPECT",
        salesStage: "NEW",
        priority: "Medium",
        nextStep: "follow up",
        daysSinceVisit: 0,
        createdAt: new Date().toISOString()
      });
    }

    const outDir = path.join(__dirname, '../public/data');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    const outPath = path.join(outDir, 'accounts.json');
    fs.writeFileSync(outPath, JSON.stringify(records));
    console.log(`Successfully wrote ${records.length} records to ${outPath}`);
    
  } catch (e) {
    console.error(`Error processing ${fileName}:`, e);
  }

  console.log("Seeding complete.");
}

seed();
