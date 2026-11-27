/**
 * Utility for safely exporting prediction history records to RFC 4180-compliant CSV.
 * Includes formula injection mitigation (CWE-1236) against malicious spreadsheet execution.
 */

// Characters that trigger formula execution in spreadsheet applications (Excel, Google Sheets, LibreOffice)
const FORMULA_INJECTION_CHARS = ['=', '+', '-', '@', '\t', '\r'];

/**
 * Sanitizes a single cell value for CSV, preventing spreadsheet formula injection.
 */
function sanitizeCell(value) {
  if (value === null || value === undefined) {
    return '';
  }

  let str = String(value);

  // Neutralize formula injection if first character is dangerous
  if (str.length > 0 && FORMULA_INJECTION_CHARS.includes(str[0])) {
    str = `'${str}`;
  }

  // If string contains commas, quotes, or newlines, escape properly
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    str = `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Converts array of prediction history records into a clean, formatted CSV blob.
 * @param {Array} records - Prediction records from backend /api/history
 * @returns {Blob}
 */
export function generateHistoryCSV(records) {
  const headers = [
    'Record ID',
    'Timestamp (UTC)',
    'Model Type',
    'Age',
    'Sex',
    'BMI',
    'Dependents',
    'Smoking Status',
    'Region',
    'Plan Type',
    'Annual Income ($)',
    'Systolic BP (mmHg)',
    'HbA1c (%)',
    'Visits Last Year',
    'Hospitalizations (3y)',
    'Chronic Conditions Count',
    'Deductible ($)',
    'Predicted Annual Cost ($ USD)',
    'Fitted Intercept ($ USD)'
  ];

  const rows = records.map((record) => {
    const params = record.input_parameters || {};
    return [
      record.id,
      record.timestamp || '',
      record.model_type === 'model_b' ? 'Model B (Clinical)' : 'Model A (Basic)',
      params.age ?? '',
      params.sex ?? '',
      params.bmi ?? '',
      params.dependents ?? '',
      params.smoker ?? '',
      params.region ?? '',
      params.plan_type ?? 'N/A',
      params.income !== undefined ? params.income : 'N/A',
      params.systolic_bp !== undefined ? params.systolic_bp : 'N/A',
      params.hba1c !== undefined ? params.hba1c : 'N/A',
      params.visits_last_year !== undefined ? params.visits_last_year : 'N/A',
      params.hospitalizations_last_3yrs !== undefined ? params.hospitalizations_last_3yrs : 'N/A',
      params.chronic_count !== undefined ? params.chronic_count : 'N/A',
      params.deductible !== undefined ? params.deductible : 'N/A',
      record.predicted_cost?.toFixed(2) ?? '',
      record.intercept !== undefined && record.intercept !== null ? record.intercept?.toFixed(2) : 'N/A'
    ];
  });

  const csvContent = [
    headers.map(sanitizeCell).join(','),
    ...rows.map(row => row.map(sanitizeCell).join(','))
  ].join('\r\n');

  return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Triggers a native browser file download for the CSV.
 * @param {Blob} blob - The CSV Blob
 * @param {string} filename - Desired filename
 */
export function downloadCSV(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
