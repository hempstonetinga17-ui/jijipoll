const xlsx = require('xlsx');
const path = require('path');
const file = path.join(__dirname, '../public/Copy of Mapping_Analysis_Reportv1(1).xlsx');
const wb = xlsx.readFile(file);
console.log('Sheets:', wb.SheetNames);
