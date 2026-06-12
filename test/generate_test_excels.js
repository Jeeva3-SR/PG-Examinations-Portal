#!/usr/bin/env node
/**
 * Generates .xlsx copies of student list CSV samples for upload testing.
 * Run: node test/generate_test_excels.js
 */
const fs = require('fs');
const path = require('path');
const csvFiles = fs.readdirSync(listsDir).filter((f) => f.endsWith('.csv'));

const listsDir = path.join(__dirname, 'student_lists');
const backendXlsx = path.join(__dirname, '../backend/node_modules/xlsx');
const XLSX = require(fs.existsSync(backendXlsx) ? backendXlsx : 'xlsx');

for (const csvFile of csvFiles) {
  const csvPath = path.join(listsDir, csvFile);
  const workbook = XLSX.readFile(csvPath, { type: 'file' });
  const xlsxPath = csvPath.replace(/\.csv$/, '.xlsx');
  XLSX.writeFile(workbook, xlsxPath);
  console.log('Created', path.basename(xlsxPath));
}

// Timetable xlsx sample
const timetableCsv = path.join(__dirname, 'sample_timetable.csv');
const timetableWb = XLSX.readFile(timetableCsv, { type: 'file' });
const timetableXlsx = path.join(__dirname, 'sample_timetable.xlsx');
XLSX.writeFile(timetableWb, timetableXlsx);
console.log('Created sample_timetable.xlsx');
