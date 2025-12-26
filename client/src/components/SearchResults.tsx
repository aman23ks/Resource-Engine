import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import {
  ChevronDown,
  ChevronLeft,
  Filter,
  MapPin,
  Phone,
  Search,
  X,
  ArrowRight,
  Check,
  Loader2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getServiceInfo as getServiceInfoFromLib } from "@/lib/facility-data";
import { searchFacilities } from "@/lib/api";
import { mentalHealthFilters, substanceAbuseFilters } from "@/lib/filter-data";
import type { Facility } from "@shared/types";

const STATE_OPTIONS = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
  { value: "DC", label: "District of Columbia" },
];

function StateDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = STATE_OPTIONS.find(opt => opt.value === value);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-all duration-200 flex items-center justify-between group"
        data-testid="select-state"
      >
        <span className="text-sm font-medium text-primary">{selectedOption?.label || "Select state"}</span>
        <ChevronDown className={`h-4 w-4 text-primary transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg py-2 max-h-64 overflow-auto">
          {STATE_OPTIONS.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between hover:bg-gray-50 ${
                  isSelected ? "bg-gray-50 text-primary font-medium" : "text-gray-700"
                }`}
              >
                <span>{option.label}</span>
                {isSelected && <Check className="h-4 w-4 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
    </TooltipProvider>
  );
}

function MultiSelectDropdown({
  label,
  options,
  selected,
  onToggle,
  categoryColor,
}: {
  label: string;
  options: { code: string; name: string }[];
  selected: string[];
  onToggle: (code: string) => void;
  categoryColor: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCount = options.filter((opt) => selected.includes(opt.code)).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-center justify-between group ${
          selectedCount > 0 ? "border-primary bg-primary/5" : "border-gray-200 bg-white hover:border-gray-300"
        }`}
      >
        <div>
          <span className={`block text-sm font-medium ${selectedCount > 0 ? "text-primary" : "text-gray-700"}`}>
            Select options
          </span>
          {selectedCount > 0 && <span className="text-xs text-primary mt-0.5">{selectedCount} selected</span>}
        </div>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${
            selectedCount > 0 ? "text-primary" : "text-gray-400 group-hover:text-gray-600"
          } ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-80 overflow-y-auto p-2 animate-in fade-in zoom-in-95 duration-200">
          {options.map((option) => {
            const isSelected = selected.includes(option.code);
            return (
              <button
                key={option.code}
                type="button"
                onClick={() => onToggle(option.code)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-start gap-3 hover:bg-gray-50 ${
                  isSelected ? "bg-gray-50" : ""
                }`}
              >
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    isSelected ? "bg-primary border-primary" : "border-gray-300 bg-white"
                  }`}
                >
                  {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                </div>
                <span className={isSelected ? "text-gray-900 font-medium" : "text-gray-600"}>{option.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ResultCard({
  result,
  getServiceInfo,
  backUrl,
}: {
  result: Facility;
  getServiceInfo: (code: string) => { code: string; name: string; category: string; color: string };
  backUrl: string;
}) {
  const facilityLink = `/facility/${result.id}?from=${encodeURIComponent(backUrl)}`;
  
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300 group">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                <Link href={facilityLink}>{result.name1}</Link>
              </h3>
              {result.name2 && <p className="text-gray-500 font-medium">{result.name2}</p>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600 mb-6">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-gray-400" />
              <span>
                {result.street1}
                {result.street2 && `, ${result.street2}`}, {result.city}, {result.state} {result.zip}
              </span>
            </div>
            <div className="hidden sm:block text-gray-300">|</div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <a href={`tel:${result.phone}`} className="hover:text-primary hover:underline">
                {result.phone}
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Key Services</p>
            <div className="flex flex-wrap gap-2">
              {result.services.slice(0, 8).map((code: string) => {
                const info = getServiceInfo(code);
                return (
                  <span
                    key={code}
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${info.color}`}
                  >
                    {info.name}
                  </span>
                );
              })}
              {result.services.length > 8 && (
                <Link 
                  href={facilityLink}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  +{result.services.length - 8} more
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-3 md:w-48 md:border-l md:border-gray-100 md:pl-6">
          <Link href={facilityLink}>
            <Button className="w-full rounded-xl" size="lg">
              View Details
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <Button variant="outline" className="w-full rounded-xl bg-white" asChild>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(
                `${result.street1} ${result.city} ${result.state} ${result.zip}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Directions
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}


const CATEGORY_HELP: Record<string, string> = {
  "Age Groups": "Who the program serves by age (e.g., adolescents, adults, seniors).",
  "Ancillary Services": "Extra supports beyond therapy (case management, transportation, housing help, etc.).",
  "Assessment": "Screening, evaluation, and intake assessment services.",
  "Detoxification Services": "Withdrawal management options (e.g., alcohol, opioids, stimulants).",
  "Emergency Services": "Urgent/crisis services (walk-in, hotline, mobile crisis, etc.).",
  "Education Services": "Education and training offered (health education, substance use education, etc.).",
  "Facility Type": "What kind of provider this is (clinic, hospital, community center, etc.).",
  "Facility Operation": "Operational details (hours, 24/7 availability, weekend services, etc.).",
  "Language Services": "Languages supported and interpretation options.",
  "Licenses/Certs": "Accreditations, licenses, and certifications.",
  "Opioid Medications": "Medications related to opioid treatment/withdrawal (e.g., buprenorphine, methadone, naltrexone).",
  "Payment Accepted": "Payment types accepted (insurance, Medicaid/Medicare, self-pay, etc.).",
  "Payment Assistance": "Financial help options (sliding scale, assistance programs).",
  "Pharmacotherapies": "Medication-based treatments offered.",
  "Smoking Policy": "Smoking/vaping policy at the facility.",
  "Special Programs": "Programs for specific groups (veterans, adolescents, LGBTQ+, etc.).",
  "Service Setting": "Where care is delivered (outpatient, inpatient, residential, telehealth, etc.).",
  "Testing": "Testing services available (drug testing, HIV/hepatitis screening, etc.).",
  "Treatment Approaches": "Therapies and treatment models used (CBT, DBT, group therapy, etc.).",
  "Type of Care": "The primary type of treatment offered (substance use, mental health, or both).",
  "Hospitals": "Hospital-based services available at this provider.",
};

function getCategoryHelpText(categoryName: string) {
  return CATEGORY_HELP[categoryName] || `Filter facilities by ${categoryName.toLowerCase()} options.`;
}

const CATEGORY_COLORS: Record<string, string> = {
  "Type of Care": "bg-blue-50 text-blue-700 border-blue-200",
  "Service Setting": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Facility Type": "bg-purple-50 text-purple-700 border-purple-200",
  "Treatment Approaches": "bg-amber-50 text-amber-700 border-amber-200",
  Pharmacotherapies: "bg-rose-50 text-rose-700 border-rose-200",
  "Emergency Services": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Facility Operation": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "Licenses/Certs": "bg-teal-50 text-teal-700 border-teal-200",
  "Payment Accepted": "bg-sky-50 text-sky-700 border-sky-200",
  "Payment Assistance": "bg-lime-50 text-lime-700 border-lime-200",
  "Special Programs": "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  Assessment: "bg-violet-50 text-violet-700 border-violet-200",
  Testing: "bg-orange-50 text-orange-700 border-orange-200",
  "Ancillary Services": "bg-slate-50 text-slate-700 border-slate-200",
  "Age Groups": "bg-pink-50 text-pink-700 border-pink-200",
  "Language Services": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Smoking Policy": "bg-gray-50 text-gray-700 border-gray-200",
  "Detoxification Services": "bg-red-50 text-red-700 border-red-200",
  "Opioid Medications": "bg-orange-50 text-orange-700 border-orange-200",
  Hospitals: "bg-green-50 text-green-700 border-green-200",
  "Education Services": "bg-indigo-50 text-indigo-700 border-indigo-200",
};

interface SearchResultsProps {
  directory: "mental" | "substance";
}

export function SearchResults({ directory }: SearchResultsProps) {
  const [location, setLocation] = useLocation();
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [state, setState] = useState("AZ");
  const [results, setResults] = useState<Facility[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const resultsPerPage = 10;

  const categoriesForDisplay = directory === "mental" ? mentalHealthFilters : substanceAbuseFilters;

  const updateUrlWithState = useCallback((newState: string, newQuery: string, newFilters: string[], newPage: number) => {
    const params = new URLSearchParams();
    if (newState) params.set('state', newState);
    if (newQuery) params.set('q', newQuery);
    if (newFilters.length > 0) params.set('filters', newFilters.join(','));
    if (newPage > 1) params.set('page', newPage.toString());
    const basePath = directory === "mental" ? "/search/mental-health" : "/search/substance-abuse";
    const newUrl = params.toString() ? `${basePath}?${params.toString()}` : basePath;
    window.history.replaceState(null, '', newUrl);
  }, [directory]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlState = params.get('state');
    const urlQuery = params.get('q');
    const urlFilters = params.get('filters');
    const urlPage = params.get('page');

    if (urlState) setState(urlState);
    if (urlQuery) setSearchQuery(urlQuery);
    if (urlFilters) setSelectedFilters(urlFilters.split(',').filter(Boolean));
    if (urlPage) setCurrentPage(parseInt(urlPage, 10));

    if (urlState || urlFilters) {
      setHasSearched(true);
      setInitialLoadDone(true);
    } else {
      setInitialLoadDone(true);
    }
  }, []);

  useEffect(() => {
    if (!initialLoadDone) return;
    if (!hasSearched) return;

    const performSearch = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await searchFacilities({
          state,
          searchQuery: searchQuery || undefined,
          services: selectedFilters.length > 0 ? selectedFilters : undefined,
          directory,
          limit: resultsPerPage,
          offset: (currentPage - 1) * resultsPerPage,
        });

        setResults(result.facilities);
        setTotalResults(result.total);
        updateUrlWithState(state, searchQuery, selectedFilters, currentPage);
      } catch (err) {
        console.error("Error searching facilities:", err);
        setError("Failed to search facilities. Please try again.");
        setResults([]);
        setTotalResults(0);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [initialLoadDone, hasSearched, currentPage]);

  const toggleFilter = (code: string) => {
    setSelectedFilters((prev) =>
      prev.includes(code) ? prev.filter((f) => f !== code) : [...prev, code]
    );
  };

  const removeFilter = (code: string) => {
    setSelectedFilters((prev) => prev.filter((f) => f !== code));
  };

  const getServiceInfo = (code: string): { code: string; name: string; category: string; color: string } => {
    const serviceInfo = getServiceInfoFromLib(code, directory);
    if (serviceInfo) return serviceInfo;
    return { code, name: code, category: "Unknown", color: "bg-gray-50 text-gray-700 border-gray-200" };
  };

  const handleSearch = async () => {
    setCurrentPage(1);
    setHasSearched(true);
    setIsLoading(true);
    setError(null);

    try {
      const result = await searchFacilities({
        state,
        searchQuery: searchQuery || undefined,
        services: selectedFilters.length > 0 ? selectedFilters : undefined,
        directory,
        limit: resultsPerPage,
        offset: 0,
      });

      setResults(result.facilities);
      setTotalResults(result.total);
      updateUrlWithState(state, searchQuery, selectedFilters, 1);
    } catch (err) {
      console.error("Error searching facilities:", err);
      setError("Failed to search facilities. Please try again.");
      setResults([]);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  };

  const resetFilters = () => {
    setSelectedFilters([]);
    const basePath = directory === "mental" ? "/search/mental-health" : "/search/substance-abuse";
    window.history.replaceState(null, '', basePath);
    setSearchQuery("");
    setCurrentPage(1);
    setResults([]);
    setTotalResults(0);
    setHasSearched(false);
  };

  const categoryEntries = Object.entries(categoriesForDisplay).sort((a, b) => a[0].localeCompare(b[0]));
  const visibleCategories = showAllFilters ? categoryEntries : categoryEntries.slice(0, 4);

  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const startIndex = (currentPage - 1) * resultsPerPage;

  const basePath = directory === "mental" ? "/search/mental-health" : "/search/substance-abuse";
  const currentUrlParams = new URLSearchParams();
  currentUrlParams.set("state", state);
  if (searchQuery) currentUrlParams.set("q", searchQuery);
  if (selectedFilters.length > 0) currentUrlParams.set("filters", selectedFilters.join(","));
  if (currentPage > 1) currentUrlParams.set("page", currentPage.toString());
  const currentUrl = `${basePath}?${currentUrlParams.toString()}`;

  return (
    <div className="max-w-6xl mx-auto px-8 lg:px-12">
      <Link
        href="/search"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        data-testid="link-back-directory"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Back to Directory Selection</span>
      </Link>

      <div className="mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {directory === "mental"
            ? "National Directory of Mental Health Services"
            : "National Directory of Substance Abuse and Alcohol Treatment"}
        </h1>
        <p className="text-gray-600 text-lg">Search verified treatment facilities in your area</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-10 mb-12 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
          <div className="lg:col-span-3">
            <label className="block text-sm font-semibold text-gray-700 mb-3">State</label>
            <StateDropdown value={state} onChange={setState} />
          </div>
          <div className="lg:col-span-9">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Name or City</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by facility name or city..."
                className="w-full h-12 pl-12 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
                data-testid="input-search"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-gray-900">Filter by Category & Services</span>
            </div>
            {categoryEntries.length > 4 && (
              <button
                type="button"
                onClick={() => setShowAllFilters(!showAllFilters)}
                className="text-sm text-primary font-medium hover:underline"
                data-testid="button-toggle-filters"
              >
                {showAllFilters ? "Show less" : `Show all ${categoryEntries.length} categories`}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {visibleCategories.map(([categoryName, services]) => (
              <div key={categoryName}>
                <div className="mb-3 flex items-center gap-2">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {categoryName}
                  </label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        aria-label={`About ${categoryName}`}
                        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Info className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm leading-snug">{getCategoryHelpText(categoryName)}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <MultiSelectDropdown
                  label={categoryName}
                  options={services}
                  selected={selectedFilters}
                  onToggle={toggleFilter}
                  categoryColor={CATEGORY_COLORS[categoryName] || "bg-gray-50 text-gray-700 border-gray-200"}
                />
              </div>
            ))}
          </div>
        </div>

        {selectedFilters.length > 0 && (
          <div className="border-t border-gray-100 pt-8 mt-10">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Active Filters</p>
            <div className="flex flex-wrap gap-3">
              {selectedFilters.map((code) => {
                const info = getServiceInfo(code);
                return (
                  <span
                    key={code}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border ${info.color}`}
                  >
                    <span className="font-semibold">{info.name}</span>
                    <span className="opacity-60">·</span>
                    <span className="opacity-70 text-xs">{info.category}</span>
                    <button
                      type="button"
                      onClick={() => removeFilter(code)}
                      className="ml-1 hover:opacity-70 transition-opacity"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="border-t border-gray-100 pt-8 mt-10 flex items-center justify-between">
          <p className="text-sm text-gray-500">Data sourced from SAMHSA Treatment Locator</p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={resetFilters}
              className="text-sm text-gray-600 font-medium hover:text-gray-900 transition-colors"
              data-testid="button-reset-filters"
            >
              Reset filters
            </button>
            <button
              type="button"
              onClick={handleSearch}
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
              data-testid="button-search"
            >
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>
        </div>
      </div>

      {hasSearched && (
        <div className="mb-16">
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-gray-600">Searching facilities...</span>
            </div>
          )}

          {error && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-700">{error}</p>
              <Button onClick={handleSearch} className="mt-4">
                Try Again
              </Button>
            </div>
          )}

          {!isLoading && !error && (
            <>
              <p className="text-gray-600 mb-10 text-lg">
                Found <span className="font-bold text-gray-900">{totalResults}</span> results
                {totalResults > resultsPerPage && (
                  <span className="text-gray-500">
                    {" "}
                    (showing {startIndex + 1}-{Math.min(startIndex + resultsPerPage, totalResults)})
                  </span>
                )}
              </p>
              {results.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No facilities found matching your criteria.</p>
                  <p className="text-gray-400 mt-2">Try adjusting your filters or search query.</p>
                </div>
              )}
              <div className="flex flex-col gap-6">
                {results.map((result) => (
                  <ResultCard key={result.id} result={result} getServiceInfo={getServiceInfo} backUrl={currentUrl} />
                ))}
              </div>
            </>
          )}

          {totalPages > 1 && !isLoading && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === page
                        ? "bg-primary text-white"
                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {!hasSearched && (
        <div className="text-center py-24">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-8">
            <Search className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">Ready to search</h3>
          <p className="text-gray-600 max-w-lg mx-auto text-lg">
            Use the filters above to find treatment facilities that match your criteria, then click Search to view
            results.
          </p>
        </div>
      )}
    </div>
  );
}
