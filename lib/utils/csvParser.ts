import { HourlyUsageData } from "@/lib/types/usage";

const EXPECTED_ROWS = 8760; // 24 hours * 365 days

export interface ParseError {
  row?: number;
  message: string;
}

export interface ParseResult {
  success: boolean;
  data?: HourlyUsageData[];
  errors?: ParseError[];
}

/**
 * Parses a CSV file into hourly usage data
 * Expected format: date,kWh (header row optional)
 */
export function parseCSV(csvContent: string): ParseResult {
  const errors: ParseError[] = [];
  const lines = csvContent.trim().split("\n");
  
  // Remove empty lines
  const nonEmptyLines = lines.filter(line => line.trim().length > 0);
  
  // Check if first line is a header (contains "date" or "kwh")
  let startIndex = 0;
  const firstLine = nonEmptyLines[0]?.toLowerCase() || "";
  if (firstLine.includes("date") || firstLine.includes("kwh")) {
    startIndex = 1;
  }
  
  const dataLines = nonEmptyLines.slice(startIndex);
  
  // Validate row count
  if (dataLines.length !== EXPECTED_ROWS) {
    return {
      success: false,
      errors: [{
        message: `Expected ${EXPECTED_ROWS} rows of data, but found ${dataLines.length}`
      }]
    };
  }
  
  const parsedData: HourlyUsageData[] = [];
  
  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i];
    const rowNumber = i + 1 + startIndex;
    
    // Split by comma, handling quoted values
    const columns = line.split(",").map(col => col.trim().replace(/^"|"$/g, ""));
    
    if (columns.length < 2) {
      errors.push({
        row: rowNumber,
        message: `Row ${rowNumber}: Expected at least 2 columns (date, kWh), found ${columns.length}`
      });
      continue;
    }
    
    const dateStr = columns[0];
    const kWhStr = columns[1];
    
    // Validate date
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      errors.push({
        row: rowNumber,
        message: `Row ${rowNumber}: Invalid date format: "${dateStr}"`
      });
      continue;
    }
    
    // Validate kWh
    if (!kWhStr || kWhStr.trim() === "") {
      errors.push({
        row: rowNumber,
        message: `Row ${rowNumber}: Missing kWh value`
      });
      continue;
    }
    
    const kWh = parseFloat(kWhStr);
    if (isNaN(kWh) || kWh < 0) {
      errors.push({
        row: rowNumber,
        message: `Row ${rowNumber}: Invalid kWh value: "${kWhStr}"`
      });
      continue;
    }
    
    parsedData.push({
      date,
      kWh
    });
  }
  
  if (errors.length > 0) {
    return {
      success: false,
      errors
    };
  }
  
  if (parsedData.length !== EXPECTED_ROWS) {
    return {
      success: false,
      errors: [{
        message: `Failed to parse all ${EXPECTED_ROWS} rows. Successfully parsed ${parsedData.length} rows.`
      }]
    };
  }
  
  return {
    success: true,
    data: parsedData
  };
}

/**
 * Validates that a file is a CSV file
 */
export function validateCSVFile(file: File): { valid: boolean; error?: string } {
  if (!file.name.toLowerCase().endsWith(".csv")) {
    return {
      valid: false,
      error: "File must be a CSV file (.csv extension required)"
    };
  }
  
  return { valid: true };
}

