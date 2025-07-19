
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Settings, KeyRound, Bell, Trash2, Save, Palette, Sun, Moon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const colorPresets = [
    { name: 'Yellow', value: '45 100% 50%' },
    { name: 'Orange', value: '24 95% 53%' },
    { name: 'Green', value: '142 76% 36%' },
    { name: 'Blue', value: '221 83% 53%' },
    { name: 'Purple', value: '262 83% 58%' },
    { name: 'Pink', value: '340 82% 52%' },
];


export default function SettingsPage() {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [theme, setTheme] = useState('light');
  const [activeColor, setActiveColor] = useState(colorPresets[0].value);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please ensure your new password and confirmation match.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 6) {
       toast({
        title: "Password too short",
        description: "Your new password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Password Changed (Simulated)",
      description: "Your password has been successfully updated.",
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };
  
  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    toast({ title: 'Theme Updated', description: `Switched to ${newTheme} mode.` });
  };
  
  const handleColorChange = (colorHsl: string) => {
    setActiveColor(colorHsl);
    document.documentElement.style.setProperty('--primary', colorHsl);
    toast({ title: 'Accent Color Updated' });
  };

  return (
    <div className="container mx-auto py-8">
        <div className="flex items-center gap-4 mb-8">
            <Settings className="h-8 w-8 text-primary" />
            <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your account and notification preferences.</p>
            </div>
        </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Card className="shadow-lg mt-4">
            <CardHeader>
              <CardTitle className="text-xl flex items-center"><KeyRound className="mr-2 h-5 w-5"/> Change Password</CardTitle>
              <CardDescription>
                Update your password here. It's recommended to use a strong, unique password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                </div>
                <div className="flex justify-end">
                    <Button type="submit"><Save className="mr-2 h-4 w-4"/>Save Password</Button>
                </div>
              </form>
            </CardContent>
            <Separator />
            <CardHeader>
               <CardTitle className="text-xl text-destructive flex items-center"><Trash2 className="mr-2 h-5 w-5"/> Deactivate Account</CardTitle>
                <CardDescription>
                    Permanently delete your account and all associated data. This action cannot be undone.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button variant="destructive">Deactivate My Account</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <Card className="shadow-lg mt-4">
            <CardHeader>
              <CardTitle className="text-xl flex items-center"><Bell className="mr-2 h-5 w-5"/> Email Notifications</CardTitle>
              <CardDescription>
                Manage how you receive notifications from ADDISSPARK.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="new-resources" className="font-semibold">New Resources</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new study materials are added.
                  </p>
                </div>
                <Switch id="new-resources" defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="exam-reminders" className="font-semibold">Exam Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive reminders for upcoming model exams.
                  </p>
                </div>
                <Switch id="exam-reminders" />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label htmlFor="platform-updates" className="font-semibold">Platform Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive news and updates about the ADDISSPARK platform.
                  </p>
                </div>
                <Switch id="platform-updates" defaultChecked />
              </div>
               <div className="flex justify-end">
                    <Button><Save className="mr-2 h-4 w-4"/>Save Preferences</Button>
                </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="theme">
            <Card className="shadow-lg mt-4">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center"><Palette className="mr-2 h-5 w-5"/> Theme & Appearance</CardTitle>
                    <CardDescription>
                        Customize the look and feel of your dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Appearance</Label>
                        <div className="flex gap-2">
                            <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => handleThemeChange('light')}>
                                <Sun className="mr-2 h-4 w-4"/> Light
                            </Button>
                            <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => handleThemeChange('dark')}>
                                <Moon className="mr-2 h-4 w-4"/> Dark
                            </Button>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label>Accent Color</Label>
                        <div className="flex flex-wrap gap-2">
                            {colorPresets.map((color) => (
                                <Button
                                    key={color.name}
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleColorChange(color.value)}
                                    className={`h-8 w-8 rounded-full ${activeColor === color.value ? 'ring-2 ring-ring ring-offset-2' : ''}`}
                                    style={{ backgroundColor: `hsl(${color.value})` }}
                                    aria-label={`Set accent color to ${color.name}`}
                                />
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
