import parser from '@babel/parser';
import fs from 'fs';

const code = fs.readFileSync('src/pages/patient/PatientCareTimeline.jsx', 'utf8');

try {
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx'],
    errorRecovery: true
  });
  
  console.log("Errors found during recovery parse:");
  for (let err of ast.errors) {
    console.log(`- ${err.message} at line ${err.loc.line}, column ${err.loc.column}`);
  }
} catch (e) {
  console.error("Critical error:", e.message);
}
