
'use client';

import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { ControllerRenderProps } from 'react-hook-form';

interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'email' | 'url' | 'tel' | 'date' | 'select';
  options?: string[];
  placeholder?: string;
}

// Make sure field can be any to satisfy ControllerRenderProps from different field types
export function renderCustomerInput(fieldConfig: FieldConfig, field: ControllerRenderProps<any, any>, disabled: boolean = false) {
  switch (fieldConfig.type) {
    case 'textarea':
      return <Textarea {...field} placeholder={fieldConfig.placeholder || `Enter ${fieldConfig.label.toLowerCase()}...`} disabled={disabled} rows={3} />;
    case 'select':
      return (
        <Select onValueChange={field.onChange} value={field.value} disabled={disabled}> {/* Removed || '' */}
          <SelectTrigger>
            <SelectValue placeholder={fieldConfig.placeholder || `Select ${fieldConfig.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {(fieldConfig.options || []).map((option) => (
              <SelectItem key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1).replace(/-/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case 'number':
      return (
        <Input
          type="number"
          {...field}
          value={field.value === undefined || field.value === null ? '' : String(field.value)} // Handle undefined/null for number inputs
          onChange={(e) => {
            const numValue = e.target.value === '' ? undefined : parseFloat(e.target.value);
            field.onChange(numValue);
          }}
          placeholder={fieldConfig.placeholder || `Enter ${fieldConfig.label.toLowerCase()}`}
          disabled={disabled}
        />
      );
    case 'date':
      return <Input type="date" {...field} disabled={disabled} />;
    case 'email':
      return <Input type="email" {...field} placeholder={fieldConfig.placeholder || 'name@example.com'} disabled={disabled} />;
    case 'url':
      return <Input type="url" {...field} placeholder={fieldConfig.placeholder || 'https://example.com'} disabled={disabled} />;
    case 'tel':
      return <Input type="tel" {...field} placeholder={fieldConfig.placeholder || '+1 555-123-4567'} disabled={disabled} />;
    default: // 'text'
      return <Input type="text" {...field} placeholder={fieldConfig.placeholder || `Enter ${fieldConfig.label.toLowerCase()}`} disabled={disabled} />;
  }
}

