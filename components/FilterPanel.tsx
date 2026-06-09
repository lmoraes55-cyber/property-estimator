"use client";

import { useState } from "react";
import { colors } from "@/lib/colors";

export interface FilterState {
  tier: string[];
  locations: string[];
  bedroomTypes: string[];
  commissionRange: [number, number];
  yearsInBusiness: string[];
}

const TIER_OPTIONS = [
  { value: "Tier 1", label: "Tier 1 - Institutional" },
  { value: "Tier 2", label: "Tier 2 - Premium" },
  { value: "Tier 3", label: "Tier 3 - Boutique" },
  { value: "Tier 4+", label: "Tier 4+ - Ultra Luxury" },
];

const LOCATION_OPTIONS = [
  "Dubai Marina",
  "Downtown Dubai",
  "JBR",
  "Business Bay",
  "Arabian Ranches",
  "Palm Jumeirah",
  "DIFC",
  "Deira",
  "Bur Dubai",
  "Al Baraka",
  "Jumeirah",
  "Emirates Hills",
];

const BEDROOM_OPTIONS = [
  "Studio",
  "1BR",
  "2BR",
  "3BR",
  "Penthouse",
  "Luxury Villas",
];

const YEARS_OPTIONS = [
  { value: "10+", label: "10+ Years" },
  { value: "5-9", label: "5-9 Years" },
  { value: "<5", label: "Less than 5 Years" },
];

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  activeFilterCount: number;
  onClearFilters: () => void;
}

export function FilterPanel({
  filters,
  onFilterChange,
  activeFilterCount,
  onClearFilters,
}: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleTierChange = (tier: string) => {
    const updated = filters.tier.includes(tier)
      ? filters.tier.filter(t => t !== tier)
      : [...filters.tier, tier];
    onFilterChange({ ...filters, tier: updated });
  };

  const handleLocationChange = (location: string) => {
    const updated = filters.locations.includes(location)
      ? filters.locations.filter(l => l !== location)
      : [...filters.locations, location];
    onFilterChange({ ...filters, locations: updated });
  };

  const handleBedroomChange = (type: string) => {
    const updated = filters.bedroomTypes.includes(type)
      ? filters.bedroomTypes.filter(t => t !== type)
      : [...filters.bedroomTypes, type];
    onFilterChange({ ...filters, bedroomTypes: updated });
  };

  const handleYearsChange = (years: string) => {
    const updated = filters.yearsInBusiness.includes(years)
      ? filters.yearsInBusiness.filter(y => y !== years)
      : [...filters.yearsInBusiness, years];
    onFilterChange({ ...filters, yearsInBusiness: updated });
  };

  const handleCommissionRangeChange = (type: "min" | "max", value: number) => {
    if (type === "min") {
      onFilterChange({
        ...filters,
        commissionRange: [Math.min(value, filters.commissionRange[1]), filters.commissionRange[1]],
      });
    } else {
      onFilterChange({
        ...filters,
        commissionRange: [filters.commissionRange[0], Math.max(value, filters.commissionRange[0])],
      });
    }
  };

  return (
    <div className="sticky top-24 h-fit">
      <div className="rounded-2xl p-6" style={{ background: colors.bgSection, border: `1px solid ${colors.border}` }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: colors.textMain }}>
            Filters
            {activeFilterCount > 0 && (
              <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ background: colors.primary + "15", color: colors.primary }}>
                {activeFilterCount}
              </span>
            )}
          </h2>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="md:hidden text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: colors.primary }}
          >
            {isExpanded ? "−" : "+"}
          </button>
        </div>

        {/* Clear Filters Button */}
        {activeFilterCount > 0 && (
          <button
            onClick={onClearFilters}
            className="w-full py-2 mb-6 text-xs font-semibold rounded-lg transition-all hover:opacity-80"
            style={{
              background: colors.primary + "10",
              color: colors.primary,
              border: `1px solid ${colors.primary}40`,
            }}
          >
            Clear All Filters
          </button>
        )}

        {/* Filters - Hidden on mobile unless expanded */}
        <div className={`space-y-6 ${!isExpanded ? "hidden md:block" : ""}`}>
          {/* Tier Filter */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: colors.textMain }}>
              Operator Tier
            </label>
            <div className="space-y-2">
              {TIER_OPTIONS.map((option) => (
                <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.tier.includes(option.value)}
                    onChange={() => handleTierChange(option.value)}
                    className="w-4 h-4 rounded transition-all"
                    style={{
                      background: filters.tier.includes(option.value) ? colors.primary : "transparent",
                      border: `1px solid ${colors.border}`,
                      accentColor: colors.primary,
                    }}
                  />
                  <span className="text-sm transition-colors" style={{ color: colors.textMuted }}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: colors.textMain }}>
              Location
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {LOCATION_OPTIONS.map((location) => (
                <label key={location} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.locations.includes(location)}
                    onChange={() => handleLocationChange(location)}
                    className="w-4 h-4 rounded transition-all"
                    style={{
                      background: filters.locations.includes(location) ? colors.primary : "transparent",
                      border: `1px solid ${colors.border}`,
                      accentColor: colors.primary,
                    }}
                  />
                  <span className="text-sm transition-colors" style={{ color: colors.textMuted }}>
                    {location}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Property Type Filter */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: colors.textMain }}>
              Property Type
            </label>
            <div className="space-y-2">
              {BEDROOM_OPTIONS.map((type) => (
                <label key={type} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.bedroomTypes.includes(type)}
                    onChange={() => handleBedroomChange(type)}
                    className="w-4 h-4 rounded transition-all"
                    style={{
                      background: filters.bedroomTypes.includes(type) ? colors.primary : "transparent",
                      border: `1px solid ${colors.border}`,
                      accentColor: colors.primary,
                    }}
                  />
                  <span className="text-sm transition-colors" style={{ color: colors.textMuted }}>
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Commission Range Slider */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: colors.textMain }}>
              Commission Range
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="10"
                  max="35"
                  value={filters.commissionRange[0]}
                  onChange={(e) => handleCommissionRangeChange("min", Number(e.target.value))}
                  className="flex-1"
                  style={{
                    accentColor: colors.primary,
                  }}
                />
                <span className="text-sm font-semibold w-12" style={{ color: colors.primary }}>
                  {filters.commissionRange[0]}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="10"
                  max="35"
                  value={filters.commissionRange[1]}
                  onChange={(e) => handleCommissionRangeChange("max", Number(e.target.value))}
                  className="flex-1"
                  style={{
                    accentColor: colors.primary,
                  }}
                />
                <span className="text-sm font-semibold w-12" style={{ color: colors.primary }}>
                  {filters.commissionRange[1]}%
                </span>
              </div>
              <div className="text-xs text-center" style={{ color: colors.textMuted }}>
                {filters.commissionRange[0]}% — {filters.commissionRange[1]}%
              </div>
            </div>
          </div>

          {/* Years in Business Filter */}
          <div>
            <label className="block text-sm font-semibold mb-3" style={{ color: colors.textMain }}>
              Years in Business
            </label>
            <div className="space-y-2">
              {YEARS_OPTIONS.map((option) => (
                <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.yearsInBusiness.includes(option.value)}
                    onChange={() => handleYearsChange(option.value)}
                    className="w-4 h-4 rounded transition-all"
                    style={{
                      background: filters.yearsInBusiness.includes(option.value) ? colors.primary : "transparent",
                      border: `1px solid ${colors.border}`,
                      accentColor: colors.primary,
                    }}
                  />
                  <span className="text-sm transition-colors" style={{ color: colors.textMuted }}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
