"use client";

import { useCallback, useState } from "react";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { parseCSV, validateCSVFile, type ParseResult } from "@/lib/utils/csvParser";
import { HourlyUsageData } from "@/lib/types/usage";
import { cn } from "@/lib/utils";

interface CSVUploadProps {
  onUploadSuccess: (data: HourlyUsageData[]) => void;
}

export function CSVUpload({ onUploadSuccess }: CSVUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setFileName(file.name);
      setIsProcessing(true);

      // Validate file type
      const validation = validateCSVFile(file);
      if (!validation.valid) {
        setError(validation.error || "Invalid file type");
        setIsProcessing(false);
        return;
      }

      try {
        // Read file content
        const text = await file.text();
        
        // Parse CSV
        const result: ParseResult = parseCSV(text);
        
        if (!result.success || !result.data) {
          const errorMessage = result.errors?.[0]?.message || "Failed to parse CSV file";
          setError(errorMessage);
          setIsProcessing(false);
          return;
        }

        // Success - pass data to parent
        onUploadSuccess(result.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while processing the file");
      } finally {
        setIsProcessing(false);
      }
    },
    [onUploadSuccess]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleClear = useCallback(() => {
    setError(null);
    setFileName(null);
    setIsProcessing(false);
  }, []);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Upload Your Energy Usage Data</h2>
            <p className="text-sm text-muted-foreground">
              Upload a CSV file with 8,760 rows of hourly energy usage data (one year).
            </p>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50",
              isProcessing && "opacity-50 pointer-events-none"
            )}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
              id="csv-upload-input"
              disabled={isProcessing}
            />

            {!fileName && !error && (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Upload className="h-12 w-12 text-muted-foreground" />
                </div>
                <div>
                  <label htmlFor="csv-upload-input">
                    <Button asChild variant="outline" className="cursor-pointer">
                      <span>Choose CSV File</span>
                    </Button>
                  </label>
                </div>
                <p className="text-sm text-muted-foreground">
                  or drag and drop your CSV file here
                </p>
              </div>
            )}

            {fileName && !error && (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="font-medium">{fileName}</span>
                </div>
                {isProcessing && (
                  <p className="text-sm text-muted-foreground">Processing...</p>
                )}
              </div>
            )}

            {error && (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Upload Failed</span>
                </div>
                <p className="text-sm text-destructive">{error}</p>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                  <label htmlFor="csv-upload-input">
                    <Button asChild variant="default" size="sm" className="cursor-pointer">
                      <span>Try Again</span>
                    </Button>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

