const xlsx = require('xlsx');
const path = require('path');
const file = path.join(__dirname, '../public/Copy of Mapping_Analysis_Reportv1(1).xlsx');
console.log('Reading file:', file);
try {
  const wb = xlsx.readFile(file);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  console.log('Headers:', data[0]);
  console.log('Sample row:', data[1]);
} catch (e) {
  console.error(e);
}
