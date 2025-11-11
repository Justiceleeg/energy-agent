/**
 * Represents a single hour of energy usage data
 */
export interface HourlyUsageData {
  /** Date and time of the hour (ISO 8601 format) */
  date: Date;
  /** Energy consumption in kilowatt-hours (kWh) for this hour */
  kWh: number;
}

/**
 * Statistics calculated from hourly usage data
 */
export interface UsageStatistics {
  /** Total annual energy consumption in kWh */
  totalAnnualKWh: number;
  /** Average daily energy consumption in kWh */
  averageDailyKWh: number;
  /** Peak usage hour with highest consumption */
  peakUsageHour: {
    date: Date;
    kWh: number;
  };
  /** Minimum monthly consumption in kWh */
  minMonthlyKWh: number;
  /** Maximum monthly consumption in kWh */
  maxMonthlyKWh: number;
  /** Monthly breakdown of consumption */
  monthlyBreakdown: {
    month: number; // 0-11 (January = 0)
    monthName: string;
    totalKWh: number;
  }[];
}

