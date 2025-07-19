
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Settings, KeyRound, Bell, Trash2, Save } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function SettingsPage() {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
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
      </Tabs>
    </div>
  );
}
