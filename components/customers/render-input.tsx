import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

export function renderInput(fieldName: string, field: any) {
  const numberFields = ['staffFTE', 'annualTurnover', 'grossProfit', 'payrollYear'];
  const dateFields = ['visitDate'];
  const textareaFields = ['description', 'comments'];
  const dropdownFields = {
    legalForm: ['BV', 'NV', 'Eenmanszaak', 'VOF'],
    visitFrequency: ['Weekly', 'Monthly', 'Quarterly', 'Annually'],
    advisor: ['John Doe', 'Jane Smith', 'David Lee'],
  };

  if (numberFields.includes(fieldName)) {
    return <Input type="number" {...field} name={fieldName} />;
  }

  if (dateFields.includes(fieldName)) {
    return <Input type="date" {...field} name={fieldName} />;
  }

  if (textareaFields.includes(fieldName)) {
    return <Textarea {...field} name={fieldName} />;
  }

  if (Object.keys(dropdownFields).includes(fieldName)) {
    return (
      <Select value={field.value} onValueChange={field.onChange} name={fieldName}>
        <SelectTrigger>
          <SelectValue placeholder={`Select ${fieldName}`} />
        </SelectTrigger>
        <SelectContent>
          {dropdownFields[fieldName as keyof typeof dropdownFields].map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return <Input {...field} name={fieldName} />;
}

