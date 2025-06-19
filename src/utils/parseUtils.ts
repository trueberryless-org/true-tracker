import {
  Project,
  Session,
  Settings,
  Task,
  User,
  Version,
  Visit,
} from "@/models";

// Function to convert string dates to Date objects
export const parseDate = (
  dateString: string | undefined | null
): Date | null | undefined => {
  return dateString ? new Date(dateString) : null;
};

// Function to parse a session
export const parseSession = (session: any): Session => ({
  id: session.id,
  description: session.description,
  flow: session.flow,
  start: parseDate(session.start)!,
  end: parseDate(session.end)!,
});

// Function to parse a task
export const parseTask = (task: any): Task => ({
  id: task.id,
  name: task.name,
  description: task.description,
  status: task.status,
  priority: task.priority,
  sessions: task.sessions.map(parseSession),
});

// Function to parse a project
export const parseProject = (project: any): Project => ({
  id: project.id,
  name: project.name,
  description: project.description,
  createdAt: parseDate(project.createdAt)!,
  lastUpdatedAt: parseDate(project.lastUpdatedAt)!,
  archivedAt: parseDate(project.archivedAt),
  status: project.status,
  priority: project.priority,
  tasks: project.tasks.map(parseTask),
});

// Function to parse settings
export const parseSettings = (settings: any): Settings => ({
  theme: settings.theme,
  exportReminder: settings.exportReminder,
  lastExported: parseDate(settings.lastExported)!,
  automation: settings.automation,
});

// Function to parse a visit
export const parseVisit = (visit: any): Visit => ({
  id: visit.id,
  time: parseDate(visit.time)!,
});

// Function to parse a version
export const parseVersion = (version: any): Version => ({
  major: version.major,
  minor: version.minor,
  patch: version.patch,
});

// Main function to parse user data
export const parseUser = (data: any): User => ({
  id: data.id,
  username: data.username,
  profilePicture: data.profilePicture || null,
  settings: parseSettings(data.settings),
  projects: data.projects.map(parseProject),
  visits: data.visits.map(parseVisit),
  version: parseVersion(data.version),
  isCurrentlyInTestMode: data.isCurrentlyInTestMode || false,
});
