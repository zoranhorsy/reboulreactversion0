import { Dispatch, SetStateAction } from "react";
import { DateRange as DateRangeType } from "react-day-picker";

export type { DateRangeType };

export interface DatePickerProps {
  mode: "single" | "range";
  selected: Date | DateRangeType | undefined;
  onSelect: Dispatch<SetStateAction<Date | DateRangeType | undefined>>;
  numberOfMonths?: number;
  locale?: Locale;
}
