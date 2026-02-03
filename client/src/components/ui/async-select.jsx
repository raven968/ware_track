import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AsyncSelect({
  isLoading = false,
  options = [],
  value,
  onValueChange,
  placeholder = "Select an option",
  itemValue = "value",
  itemLabel = "label",
  disabled,
  className,
  ...props
}) {
  if (isLoading) {
    return <Skeleton className={`h-10 w-full rounded-md ${className}`} />;
  }

  // Helper to get value/label whether key string or function
  const getValue = (item) => {
    return typeof itemValue === 'function' ? itemValue(item) : item[itemValue];
  };

  const getLabel = (item) => {
    return typeof itemLabel === 'function' ? itemLabel(item) : item[itemLabel];
  };

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled} {...props}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((item) => {
            const val = getValue(item);
            return (
                <SelectItem key={val} value={val}>
                    {getLabel(item)}
                </SelectItem>
            );
        })}
      </SelectContent>
    </Select>
  );
}
