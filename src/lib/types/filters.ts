export type FilterState = {
  page: string;
  limit: string;
  category_id: string;
  brand: string;
  brand_id: string;
  search: string;
  sort: string;
  color: string;
  size: string;
  minPrice: string;
  maxPrice: string;
  store_type: string;
  featured: string;
  view?: string;
  [key: string]: string | undefined;
};

export type FilterChangeHandler = (newFilters: Partial<FilterState>) => void;

export interface FiltersProps {
  filters: FilterState;
  categories: Array<{ id: number; name: string }>;
  brands: Array<{ id: number; name: string }>;
  colors?: string[];
  sizes?: string[];
  storeTypes?: string[];
  availableColors?: string[];
  availableSizes?: string[];
  onFilterChange: FilterChangeHandler;
}
