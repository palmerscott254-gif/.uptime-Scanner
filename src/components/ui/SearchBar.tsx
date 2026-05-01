import type { ChangeEvent } from 'react';
import { Search } from 'lucide-react';
import { Input } from './Input';

interface SearchBarProps {
  value?: string;
  placeholder?: string;
  onChange?: (v: string) => void;
}

export function SearchBar({ value = '', placeholder = 'Search projects', onChange }: SearchBarProps) {
  return (
    <Input
      id="global-search"
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value)}
      placeholder={placeholder}
      leftIcon={<Search className="h-4 w-4 text-gray-400" />}
      className="max-w-md"
    />
  );
}
