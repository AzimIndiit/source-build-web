import React from 'react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface LabeledSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  showLabels?: boolean;
  onLabel?: string;
  offLabel?: string;
  className?: string;
  disabled?: boolean;
}

const LabeledSwitch: React.FC<LabeledSwitchProps> = ({
  checked,
  onCheckedChange,
  showLabels = false,
  onLabel = 'ON',
  offLabel = 'OFF',
  className = '',
  disabled = false,
}) => {
  if (!showLabels) {
    return (
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={className}
        disabled={disabled}
      />
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span
        className={cn(
          'text-sm font-medium transition-colors',
          !checked ? 'text-gray-700' : 'text-gray-400'
        )}
      >
        {offLabel}
      </span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
      <span
        className={cn(
          'text-sm font-medium transition-colors',
          checked ? 'text-gray-700' : 'text-gray-400'
        )}
      >
        {onLabel}
      </span>
    </div>
  );
};

export default LabeledSwitch;
