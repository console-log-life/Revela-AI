"use client";

import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateSettingsSnapshot } from "@/services/api/settings";
import type { SettingsSnapshot } from "@/types/domain";

export function SettingsWorkspace({ settings }: { settings: SettingsSnapshot }) {
  const [form, setForm] = React.useState(settings);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    setForm(settings);
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: updateSettingsSnapshot,
    onSuccess: (data) => {
      setForm(data);
      queryClient.setQueryData(["settings"], data);
    }
  });

  const saveSettings = async (label: string) => {
    try {
      await saveMutation.mutateAsync(form);
      toast.success(`${label} saved.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to save ${label.toLowerCase()}.`);
    }
  };

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="grid h-auto grid-cols-2 gap-2 md:grid-cols-5">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="api">API</TabsTrigger>
        <TabsTrigger value="model">Models</TabsTrigger>
        <TabsTrigger value="memory">Memory</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Profile settings</CardTitle>
            <CardDescription>Workspace operator identity and default hiring context.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.profile.name} onChange={(event) => setForm({ ...form, profile: { ...form.profile, name: event.target.value } })} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={form.profile.email} onChange={(event) => setForm({ ...form, profile: { ...form.profile, email: event.target.value } })} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Role</Label>
              <Input value={form.profile.role} onChange={(event) => setForm({ ...form, profile: { ...form.profile, role: event.target.value } })} />
            </div>
            <div className="md:col-span-2">
              <Button onClick={() => saveSettings("Profile settings")} disabled={saveMutation.isPending}>
                <Save className="h-4 w-4" />
                {saveMutation.isPending ? "Saving..." : "Save profile"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="api">
        <Card>
          <CardHeader>
            <CardTitle>API connectivity</CardTitle>
            <CardDescription>Current environment status for the Groq and Hindsight integrations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <Badge variant={form.api.groqConnected ? "success" : "warning"}>
                Groq {form.api.groqConnected ? "connected" : "missing key"}
              </Badge>
              <Badge variant={form.api.hindsightConnected ? "success" : "warning"}>
                Hindsight {form.api.hindsightConnected ? "connected" : "local mode"}
              </Badge>
            </div>
            <div className="space-y-2">
              <Label>API base URL</Label>
              <Input value={form.api.apiBaseUrl} onChange={(event) => setForm({ ...form, api: { ...form.api, apiBaseUrl: event.target.value } })} />
            </div>
            <Button onClick={() => saveSettings("API settings")} disabled={saveMutation.isPending}>
              <Save className="h-4 w-4" />
              {saveMutation.isPending ? "Saving..." : "Save API settings"}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="model">
        <Card>
          <CardHeader>
            <CardTitle>Model routing</CardTitle>
            <CardDescription>Default model tier and runtime control thresholds.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Default tier</Label>
              <Input
                value={form.model.defaultTier}
                onChange={(event) =>
                  setForm({ ...form, model: { ...form.model, defaultTier: event.target.value as typeof form.model.defaultTier } })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Confidence threshold</Label>
              <Input
                value={form.model.confidenceThreshold.toString()}
                onChange={(event) =>
                  setForm({ ...form, model: { ...form.model, confidenceThreshold: Number(event.target.value || 0) } })
                }
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Max latency (ms)</Label>
              <Input
                value={form.model.maxLatencyMs.toString()}
                onChange={(event) =>
                  setForm({ ...form, model: { ...form.model, maxLatencyMs: Number(event.target.value || 0) } })
                }
              />
            </div>
            <div className="md:col-span-2">
              <Button onClick={() => saveSettings("Model settings")} disabled={saveMutation.isPending}>
                <Save className="h-4 w-4" />
                {saveMutation.isPending ? "Saving..." : "Save model settings"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="memory">
        <Card>
          <CardHeader>
            <CardTitle>Memory behavior</CardTitle>
            <CardDescription>Control reflection retention and Hindsight sync preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between rounded-3xl border border-border/60 bg-background/50 p-4">
              <div>
                <p className="font-medium">Cloud sync</p>
                <p className="text-sm text-muted-foreground">Mirror local memory into Hindsight cloud when available.</p>
              </div>
              <Switch checked={form.memory.cloudSync} onCheckedChange={(value) => setForm({ ...form, memory: { ...form.memory, cloudSync: value } })} />
            </div>
            <div className="flex items-center justify-between rounded-3xl border border-border/60 bg-background/50 p-4">
              <div>
                <p className="font-medium">Retain reflections</p>
                <p className="text-sm text-muted-foreground">Persist session-level talent trajectory reports.</p>
              </div>
              <Switch checked={form.memory.retainReflections} onCheckedChange={(value) => setForm({ ...form, memory: { ...form.memory, retainReflections: value } })} />
            </div>
            <div className="space-y-2">
              <Label>Local storage path</Label>
              <Input
                value={form.memory.localStoragePath}
                onChange={(event) => setForm({ ...form, memory: { ...form.memory, localStoragePath: event.target.value } })}
              />
            </div>
            <Button onClick={() => saveSettings("Memory settings")} disabled={saveMutation.isPending}>
              <Save className="h-4 w-4" />
              {saveMutation.isPending ? "Saving..." : "Save memory settings"}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Choose what kinds of system alerts and summaries reach you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center justify-between rounded-3xl border border-border/60 bg-background/50 p-4">
              <div>
                <p className="font-medium">Daily digest</p>
                <p className="text-sm text-muted-foreground">Receive a summary of candidate activity and spend.</p>
              </div>
              <Switch checked={form.notifications.emailDigest} onCheckedChange={(value) => setForm({ ...form, notifications: { ...form.notifications, emailDigest: value } })} />
            </div>
            <div className="flex items-center justify-between rounded-3xl border border-border/60 bg-background/50 p-4">
              <div>
                <p className="font-medium">Budget alerts</p>
                <p className="text-sm text-muted-foreground">Warn when routing spend approaches the configured threshold.</p>
              </div>
              <Switch checked={form.notifications.budgetAlerts} onCheckedChange={(value) => setForm({ ...form, notifications: { ...form.notifications, budgetAlerts: value } })} />
            </div>
            <div className="flex items-center justify-between rounded-3xl border border-border/60 bg-background/50 p-4">
              <div>
                <p className="font-medium">Candidate alerts</p>
                <p className="text-sm text-muted-foreground">Notify when a candidate's trajectory changes significantly.</p>
              </div>
              <Switch checked={form.notifications.candidateAlerts} onCheckedChange={(value) => setForm({ ...form, notifications: { ...form.notifications, candidateAlerts: value } })} />
            </div>
            <Button onClick={() => saveSettings("Notification settings")} disabled={saveMutation.isPending}>
              <Save className="h-4 w-4" />
              {saveMutation.isPending ? "Saving..." : "Save notification settings"}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
