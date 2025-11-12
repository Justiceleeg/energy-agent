"use client";

import { UserPreference } from "@/lib/types/ai";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PreferenceSelectorProps {
  preference: UserPreference;
  onPreferenceChange: (preference: UserPreference) => void;
  disabled?: boolean;
}

const PREFERENCE_OPTIONS: Array<{ value: UserPreference; label: string }> = [
  { value: "cost", label: "Cost" },
  { value: "flexibility", label: "Flexibility" },
  { value: "renewable", label: "Renewable" },
];

export function PreferenceSelector({
  preference,
  onPreferenceChange,
  disabled = false,
}: PreferenceSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Prioritize:</span>
      <div className="flex gap-2">
        {PREFERENCE_OPTIONS.map((option) => (
          <Button
            key={option.value}
            variant={preference === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => onPreferenceChange(option.value)}
            disabled={disabled}
            className={cn(
              "transition-all",
              preference === option.value && "shadow-sm"
            )}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}


