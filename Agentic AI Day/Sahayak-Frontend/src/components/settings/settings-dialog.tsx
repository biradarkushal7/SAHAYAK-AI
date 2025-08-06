
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useChatSettings, ChatSettings, indianLanguages } from '@/hooks/use-chat-settings';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", 
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { settings, updateSettings, isSettingsLoaded } = useChatSettings();

  if (!isSettingsLoaded) {
    return null; // Or a loading indicator
  }
  
  const handleGradeChange = (grade: number, checked: boolean) => {
    const newGrades = checked
      ? [...settings.targetGrades, grade]
      : settings.targetGrades.filter(g => g !== grade);
    updateSettings({ targetGrades: newGrades.sort((a,b) => a - b) });
  };
  
  const handleSettingChange = (key: keyof ChatSettings, value: any) => {
      updateSettings({ [key]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Global Chat Settings</DialogTitle>
          <DialogDescription>
            These settings apply to all your chat sessions.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="state-information">State Information</Label>
              <Select
                value={settings.state}
                onValueChange={value => handleSettingChange('state', value)}
              >
                <SelectTrigger id="state-information">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {indianStates.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={settings.language}
                onValueChange={value => handleSettingChange('language', value)}
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {indianLanguages.map(lang => (
                      <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground -mt-4">
              Your language is auto-detected from your state, but you can override it.
          </p>

          <div className="space-y-3">
            <Label>Target Grade</Label>
            <div className="grid grid-cols-4 gap-x-4 gap-y-2">
              {Array.from({ length: 10 }, (_, i) => i + 1).map(grade => (
                <div key={grade} className="flex items-center space-x-2">
                  <Checkbox
                    id={`grade-${grade}`}
                    checked={settings.targetGrades.includes(grade)}
                    onCheckedChange={checked =>
                      handleGradeChange(grade, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`grade-${grade}`}
                    className="text-sm font-normal"
                  >
                    Grade {grade}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="response-tone">Response Tone</Label>
              <Select
                value={settings.tone}
                onValueChange={value => handleSettingChange('tone', value)}
              >
                <SelectTrigger id="response-tone">
                  <SelectValue placeholder="Select a tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="informal">Informal</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="complexity">Complexity</Label>
              <Select
                value={settings.complexity}
                onValueChange={value => handleSettingChange('complexity', value)}
              >
                <SelectTrigger id="complexity">
                  <SelectValue placeholder="Select complexity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simple">Simple</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between space-y-2 pt-2">
            <Label htmlFor="voice-output" className="font-medium">Voice Output</Label>
            <Switch
              id="voice-output"
              checked={settings.voiceOutput}
              onCheckedChange={checked => handleSettingChange('voiceOutput', checked)}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
