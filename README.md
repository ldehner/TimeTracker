# TimeTracker Project

The TimeTracker Project integrates n8n webhooks with the Notion API to create a comprehensive time-tracking solution. It's designed to automate and streamline the tracking of tasks and projects directly within a Notion database. This README outlines how to set up and customize the project to fit your specific needs.

## Important Notice

This project is highly customized and requires modifications to work with your Notion database structure. The provided `TimeTracking.json` n8n workflow is a starting point, but expect to make adjustments to ensure compatibility with your database's setup.

## Notion Database Structure

The TimeTracker system is designed around a Notion database consisting of five main pages:

1. **Logs**: Entries are saved here, with relations to `Tasks` and `FriendlyProjects`.
2. **Tasks**: Stores all tasks, related to `FriendlyProjects` and `Logs`. Tasks can be marked with a status (e.g., resolved) to filter out completed tasks in the UI.
3. **MainProjects**: Contains main projects with detailed names and project numbers, related to `MainTasks`.
4. **MainTasks**: Lists main tasks with detailed names and task numbers, related to `MainProjects`.
5. **FriendlyProjects**: Holds the user-friendly names of projects, which can be selected in the UI. Related to `MainTasks`, `Tasks`, and `Logs`.

## Setup Instructions

### 1. Configure Environment

In the root of the `TimeTracker` folder, create a file named `environment.ts` with the following structure:

```typescript
export const ENV = {
  URL: '',       // The base URL of your n8n webhook or API endpoint
  API_KEY: '',   // API key for authentication, if required
  PASSWORD: '',  // Password for authentication, if needed
};
