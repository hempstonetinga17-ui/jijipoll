const xlsx = require('xlsx');
const path = require('path');
const file = path.join(__dirname, '../public/Copy of Mapping_Analysis_Reportv1(1).xlsx');
const wb = xlsx.readFile(file);
console.log('--- Clean Data ---');
console.log(xlsx.utils.sheet_to_json(wb.Sheets['Clean Data'], { header: 1 }).slice(0, 2));
console.log('--- Raw Data ---');
console.log(xlsx.utils.sheet_to_json(wb.Sheets['Raw Data'], { header: 1 }).slice(0, 2));
