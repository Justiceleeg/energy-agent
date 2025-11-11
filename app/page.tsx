"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { CSVUpload } from "@/components/features/CSVUpload";
import { UsageInsights } from "@/components/features/UsageInsights";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HourlyUsageData } from "@/lib/types/usage";
import { calculateUsageStatistics } from "@/lib/utils/usageStatistics";

const SAMPLE_FILES = [
  { name: "Night Owl User", file: "night-owl-user.csv", description: "High evening usage pattern" },
  { name: "Solar Home User", file: "solar-home-user.csv", description: "Low daytime, high evening (solar panels)" },
  { name: "Typical Family", file: "typical-family.csv", description: "Standard 9-5 usage pattern" },
];

export default function Home() {
  const [usageData, setUsageData] = useState<HourlyUsageData[] | null>(null);
  const [statistics, setStatistics] = useState<ReturnType<typeof calculateUsageStatistics> | null>(null);

  const handleUploadSuccess = (data: HourlyUsageData[]) => {
    setUsageData(data);
    const stats = calculateUsageStatistics(data);
    setStatistics(stats);
  };

  const handleDownloadSample = (filename: string) => {
    const link = document.createElement("a");
    link.href = `/sample-csvs/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="container mx-auto px-4 py-8 md:px-8 lg:px-16 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-black dark:text-zinc-50">
            Energy Plan Recommendation Agent
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Upload your hourly energy usage data to get personalized plan recommendations
          </p>
        </div>

        {!usageData ? (
          <div className="space-y-6">
            <CSVUpload onUploadSuccess={handleUploadSuccess} />

            <Card>
              <CardHeader>
                <CardTitle>Try Sample Data</CardTitle>
                <CardDescription>
                  Download sample CSV files to test the application with different usage patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {SAMPLE_FILES.map((sample) => (
                    <div
                      key={sample.file}
                      className="flex flex-col gap-2 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="font-medium">{sample.name}</div>
                      <div className="text-sm text-muted-foreground">{sample.description}</div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadSample(sample.file)}
                        className="mt-2"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold mb-1">Usage Insights</h2>
                <p className="text-muted-foreground">
                  Your energy consumption patterns and statistics
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setUsageData(null);
                  setStatistics(null);
                }}
              >
                Upload New File
              </Button>
            </div>

            {statistics && <UsageInsights statistics={statistics} />}
          </div>
        )}
      </main>
    </div>
  );
}
