import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@radix-ui/react-separator";
import { AlertCircle } from "lucide-react";
import { useTheme as useNextTheme } from "next-themes";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { AutomationSettings, automationSettings } from "@/models/settings";

import { formatDateTime } from "@/utils/dateUtils";
import { clearLocalStorage } from "@/utils/localStorage";
import { getCurrentTheme, setTheme as setColorTheme } from "@/utils/themes";

import { useUser } from "@/components/UserContext";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { User } from "../models";
import { exportData } from "../utils/export";
import { importData } from "../utils/import";
import { loadData } from "../utils/load";
import { saveData } from "../utils/save";
import {
  getSessionStorageItem,
  setSessionStorageItem,
} from "../utils/sessionStorage";

const FormSchemaUsername = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
});

const FormSchemaExportReminder = z.object({
  type: z.enum(["daily", "weekly", "monthly"], {
    required_error: "You need to select a notification frequency.",
  }),
});

export default function Settings() {
  const { user, setUser } = useUser();
  const { theme, setTheme } = useNextTheme();
  const [currentTheme, setCurrentTheme] = useState("default");

  const [fileData, setFileData] = useState<any>(null);
  const [pictureData, setPictureData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("General");

  const [exportedNow, setExportedNow] = React.useState<boolean>(false);

  useEffect(() => {
    const storedTab = getSessionStorageItem("activeTab");
    if (storedTab) {
      setActiveTab(storedTab.toString());
    }

    const initialTheme = user?.settings.theme || getCurrentTheme();
    setColorTheme(initialTheme);
    setCurrentTheme(initialTheme);
  }, [user?.settings.theme]);

  const handleThemeChange = useCallback(
    (theme: any) => {
      setColorTheme(theme);
      setCurrentTheme(theme);

      if (user) {
        user.settings.theme = theme;
        saveData(user);
      }
    },
    [user]
  );

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
    setSessionStorageItem("activeTab", tabName);
  };

  const formUsername = useForm<z.infer<typeof FormSchemaUsername>>({
    resolver: zodResolver(FormSchemaUsername),
    defaultValues: {
      username: user?.username || "",
    },
  });

  function onSubmitUsername(data: z.infer<typeof FormSchemaUsername>) {
    if (data && user) {
      user.username = data.username;
      setUser(user);
      saveData(user);
      toast('You changed your username to "' + data.username + '".');
    }
  }

  const formExportReminder = useForm<z.infer<typeof FormSchemaExportReminder>>({
    resolver: zodResolver(FormSchemaExportReminder),
    defaultValues: {
      type: user?.settings.exportReminder || "weekly",
    },
  });

  function onSubmitExportReminder(
    data: z.infer<typeof FormSchemaExportReminder>
  ) {
    if (data && user) {
      user.settings.exportReminder = data.type;
      setUser(user);
      saveData(user);
      toast('You changed your notification frequency to "' + data.type + '".');
    }
  }

  const saveFileTemp = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const file = event.target.files[0];
      setFileData(file);
    }
  };

  const importNow = () => {
    if (fileData) {
      try {
        importData(fileData)
          .then((importedUser: User) => {
            setUser(importedUser);
          })
          .catch((error) => console.error("Error importing data", error));
      } catch (error) {
        console.error("Error parsing JSON file", error);
        toast("Error importing data. Please try again.");
      }
    } else {
      console.error("No file data to import");
    }
  };

  const savePictureTemp = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result?.toString(); // Convert to Base64 string
        setPictureData(base64String); // Set in state or save to 'pictureData'
      };

      reader.readAsDataURL(file);
    }
  };

  const setPictureNow = () => {
    if (pictureData && user) {
      user.profilePicture = pictureData;
      setUser(user);
      saveData(user);
      toast("Profile picture updated successfully.");
    } else {
      console.error("No picture data to set");
      toast("No picture selected. Please choose a picture.");
    }
  };

  const removeProfilePicture = () => {
    if (user) {
      user.profilePicture = null;
      setUser(user);
      saveData(user);
      toast("Profile picture removed successfully.");
    }
  };

  const [settingsState, setSettingsState] = useState<any>({});

  useEffect(() => {
    const initialSettingsState: any = {};
    automationSettings.forEach((setting) => {
      initialSettingsState[setting.key] =
        user?.settings.automation[setting.key];
    });
    setSettingsState(initialSettingsState);
  }, [user]);

  const handleChange = (key: string, checked: any) => {
    if (user) {
      const updatedSettings = { ...settingsState, [key]: checked };
      setSettingsState(updatedSettings);
      user.settings.automation[key] = checked;
      setUser(user);
      saveData(user);
      const setting = automationSettings.find((setting) => setting.key === key);
      if (setting)
        toast(checked ? setting.toastActivate : setting.toastDeactivate);
    }
  };

  const deleteAllProjects = () => {
    if (user) {
      user.projects = [];
      setUser(user);
      saveData(user);
      toast("All projects deleted successfully.");
    }
  };

  const clearAllUserData = () => {
    clearLocalStorage();
    setUser(null);
    toast("All data cleared successfully.");
  };

  if (!user) {
    return (
      <div className="flex w-full flex-col">
        <main className="flex min-h-[calc(100vh-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
          <Alert variant="default">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Loading...</AlertTitle>
            <AlertDescription>
              We are currently trying to fetch your data from your local
              storage.
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  const exportNow = () => {
    user.settings.lastExported = new Date();
    setUser(user);
    saveData(user);
    exportData();
    setExportedNow(true);
  };

  const groupedSettings = automationSettings.reduce(
    (groups: any, setting: AutomationSettings) => {
      const group = setting.group;
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(setting);
      return groups;
    },
    {}
  );

  return (
    <div className="flex w-full flex-col">
      <main className="flex min-h-[calc(100vh-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        <div className="mx-auto grid w-full max-w-6xl gap-2">
          <h1 className="text-3xl font-semibold">Settings</h1>
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
          <nav
            className="grid gap-4 text-sm text-muted-foreground"
            x-chunk="dashboard-04-chunk-0"
          >
            <a
              className={` ${activeTab === "General" ? "font-semibold text-primary" : ""}`}
              onClick={() => handleTabClick("General")}
            >
              General
            </a>
            <a
              className={` ${activeTab === "Themes" ? "font-semibold text-primary" : ""}`}
              onClick={() => handleTabClick("Themes")}
            >
              Themes
            </a>
            <a
              className={` ${activeTab === "Automation" ? "font-semibold text-primary" : ""}`}
              onClick={() => handleTabClick("Automation")}
            >
              Automation
            </a>
            <a
              className={` ${activeTab === "Export / Import" ? "font-semibold text-primary" : ""}`}
              onClick={() => handleTabClick("Export / Import")}
            >
              Export / Import
            </a>
            <a
              className={` ${activeTab === "Danger Zone" ? "font-semibold text-primary" : ""}`}
              onClick={() => handleTabClick("Danger Zone")}
            >
              Danger Zone
            </a>
          </nav>
          {/* Render content based on activeTab */}
          {activeTab === "General" && (
            <div className="grid gap-6">
              <Form {...formUsername}>
                <form
                  onSubmit={formUsername.handleSubmit(onSubmitUsername)}
                  className="space-y-6"
                >
                  <Card x-chunk="dashboard-04-chunk-1">
                    <CardHeader>
                      <CardTitle>Username</CardTitle>
                      <CardDescription>
                        This is your display name.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={formUsername.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder={user?.username} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                      <Button type="submit">Save</Button>
                    </CardFooter>
                  </Card>
                </form>
              </Form>
              <Card x-chunk="dashboard-04-chunk-1">
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription>
                    Upload, update or remove your profile picture here.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={savePictureTemp}
                  />
                </CardContent>
                <CardFooter className="border-t px-6 py-4 flex gap-4">
                  <Button onClick={setPictureNow}>Set Profile Picture</Button>
                  <Button onClick={removeProfilePicture} variant="destructive">
                    Remove Profile Picture
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
          {activeTab === "Themes" && (
            <div className="grid gap-6">
              <Card x-chunk="dashboard-04-chunk-1">
                <CardHeader>
                  <CardTitle>Light / Dark Mode</CardTitle>
                  <CardDescription>
                    Choose the lightness / darkness of your interface here.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup defaultValue={theme}>
                    <div
                      className="flex items-center space-x-2"
                      onClick={() => setTheme("light")}
                    >
                      <RadioGroupItem value="light" id="r1" />
                      <Label htmlFor="r1">Light</Label>
                    </div>
                    <div
                      className="flex items-center space-x-2"
                      onClick={() => setTheme("dark")}
                    >
                      <RadioGroupItem value="dark" id="r2" />
                      <Label htmlFor="r2">Dark</Label>
                    </div>
                    <div
                      className="flex items-center space-x-2"
                      onClick={() => setTheme("system")}
                    >
                      <RadioGroupItem value="system" id="r3" />
                      <Label htmlFor="r3">System</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
              <Card x-chunk="dashboard-04-chunk-1">
                <CardHeader>
                  <CardTitle>Color Modes</CardTitle>
                  <CardDescription>
                    Choose the color theme which you like most.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup defaultValue={currentTheme}>
                    <div
                      className="flex items-center space-x-2"
                      onClick={() => handleThemeChange("default")}
                    >
                      <RadioGroupItem value="default" id="r4" />
                      <Label htmlFor="r4">Default</Label>
                    </div>
                    <div
                      className="flex items-center space-x-2"
                      onClick={() => handleThemeChange("palette")}
                    >
                      <RadioGroupItem value="palette" id="r5" />
                      <Label htmlFor="r5">Palette</Label>
                    </div>
                    <div
                      className="flex items-center space-x-2"
                      onClick={() => handleThemeChange("amethyst")}
                    >
                      <RadioGroupItem value="amethyst" id="r6" />
                      <Label htmlFor="r6">Amethyst</Label>
                    </div>
                    <div
                      className="flex items-center space-x-2"
                      onClick={() => handleThemeChange("sapphire")}
                    >
                      <RadioGroupItem value="sapphire" id="r7" />
                      <Label htmlFor="r7">Sapphire</Label>
                    </div>
                    <div
                      className="flex items-center space-x-2"
                      onClick={() => handleThemeChange("emerald")}
                    >
                      <RadioGroupItem value="emerald" id="r8" />
                      <Label htmlFor="r8">Emerald</Label>
                    </div>
                    <div
                      className="flex items-center space-x-2"
                      onClick={() => handleThemeChange("ruby")}
                    >
                      <RadioGroupItem value="ruby" id="r9" />
                      <Label htmlFor="r9">Ruby</Label>
                    </div>
                    <div
                      className="flex items-center space-x-2"
                      onClick={() => handleThemeChange("coral")}
                    >
                      <RadioGroupItem value="coral" id="r10" />
                      <Label htmlFor="r10">Coral</Label>
                    </div>
                    <div
                      className="flex items-center space-x-2"
                      onClick={() => handleThemeChange("amber")}
                    >
                      <RadioGroupItem value="amber" id="r11" />
                      <Label htmlFor="r11">Amber</Label>
                    </div>
                    <div
                      className="flex items-center space-x-2"
                      onClick={() => handleThemeChange("daylight")}
                    >
                      <RadioGroupItem value="daylight" id="r12" />
                      <Label htmlFor="r12">Daylight</Label>
                    </div>
                    <div
                      className="flex items-center space-x-2"
                      onClick={() => handleThemeChange("midnight")}
                    >
                      <RadioGroupItem value="midnight" id="r13" />
                      <Label htmlFor="r13">Midnight</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>
          )}
          {activeTab === "Automation" && (
            <div className="grid gap-6">
              {Object.keys(groupedSettings).map((group) => (
                <Card key={group} x-chunk="dashboard-04-chunk-1">
                  <CardHeader>
                    <CardTitle>{group}</CardTitle>
                    <CardDescription>
                      Here you can see options for automating your workflow
                      within the app.
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="border-t flex-col p-0">
                    <Table>
                      <TableBody>
                        {groupedSettings[group].map(
                          (setting: AutomationSettings) => (
                            <TableRow key={setting.key}>
                              <TableCell className="font-medium px-6">
                                <Label
                                  htmlFor={`automation-${setting.key}`}
                                  className="space-y-0"
                                >
                                  <div className="text-base">
                                    {setting.label}
                                  </div>
                                  <div className="text-muted-foreground">
                                    {setting.description}
                                  </div>
                                </Label>
                              </TableCell>
                              <TableCell className="text-right px-6">
                                <Switch
                                  id={`automation-${setting.key}`}
                                  checked={settingsState[setting.key]}
                                  onCheckedChange={(checked: any) =>
                                    handleChange(setting.key, checked)
                                  }
                                />
                              </TableCell>
                            </TableRow>
                          )
                        )}
                      </TableBody>
                    </Table>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          {activeTab === "Export / Import" && (
            <div className="grid gap-6">
              <Card x-chunk="dashboard-04-chunk-1">
                <CardHeader>
                  <CardTitle>Export Data</CardTitle>
                  <CardDescription>
                    This will generate a JSON with your data, so you can import
                    it again later.
                    <br />
                    {user.settings.lastExported !== null && (
                      <div>
                        The last time you exported your data was{" "}
                        {exportedNow
                          ? "now"
                          : new Date(user.settings.lastExported).getDay() ===
                              new Date().getDay()
                            ? "at "
                            : "on "}
                        {!exportedNow &&
                          formatDateTime(new Date(user.settings.lastExported))}
                        .
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="border-t px-6 py-4">
                  <Button onClick={exportNow}>Export</Button>
                </CardFooter>
              </Card>
              <Card x-chunk="dashboard-04-chunk-1">
                <CardHeader>
                  <CardTitle>Import Data</CardTitle>
                  <CardDescription>
                    Import you recently exported data here.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    type="file"
                    accept="application/json"
                    onChange={saveFileTemp}
                  />
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button onClick={importNow}>Import</Button>
                </CardFooter>
              </Card>
              <Form {...formExportReminder}>
                <form
                  onSubmit={formExportReminder.handleSubmit(
                    onSubmitExportReminder
                  )}
                  className="space-y-6"
                >
                  <Card x-chunk="dashboard-04-chunk-1">
                    <CardHeader>
                      <CardTitle>Export Notification Frequency</CardTitle>
                      <CardDescription>
                        How often do you want to be reminded to export data?
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={formExportReminder.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>Notify me...</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                              >
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="daily" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Daily
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="weekly" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Weekly
                                  </FormLabel>
                                </FormItem>
                                <FormItem className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value="monthly" />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    Monthly
                                  </FormLabel>
                                </FormItem>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                      <Button type="submit">Save</Button>
                    </CardFooter>
                  </Card>
                </form>
              </Form>
            </div>
          )}
          {activeTab === "Danger Zone" && (
            <div className="grid gap-6">
              <Card x-chunk="dashboard-04-chunk-1">
                <CardHeader>
                  <CardTitle>Delete All Projects</CardTitle>
                  <CardDescription>
                    This will delete all projects with their time entries.{" "}
                    <br />
                    Please consider exporting before proceeding.
                  </CardDescription>
                </CardHeader>
                <CardFooter className="border-t px-6 py-4">
                  <Dialog>
                    <DialogTrigger>
                      <Button variant={"destructive"}>Delete</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently
                          delete all your projects and remove this data from
                          your local storage.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button onClick={deleteAllProjects}>Confirm</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
              <Card x-chunk="dashboard-04-chunk-1">
                <CardHeader>
                  <CardTitle>Delete All Data</CardTitle>
                  <CardDescription>
                    All your projects, time entries and everything else will be
                    completely erased from existence. <br />
                    Please consider exporting before proceeding.
                  </CardDescription>
                </CardHeader>
                <CardFooter className="border-t px-6 py-4">
                  <Dialog>
                    <DialogTrigger>
                      <Button variant={"destructive"}>Delete</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently
                          delete your account and remove your data from your
                          local storage.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button onClick={clearAllUserData}>Confirm</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
