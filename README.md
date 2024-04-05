# Table of Contents

- [TimeTracker Project](#timetracker-project)
  - [Important Notice](#important-notice)
  - [Notion Database Structure](#notion-database-structure)
- [Setup Instructions](#setup-instructions)
  - [Configure Environment](#configure-environment)
  - [Import n8n Workflow](#import-n8n-workflow)
  - [Customize the Workflow](#customize-the-workflow)
  - [Deployment](#deployment)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Pictures](#pictures)
 
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

### Configure Environment

In the root of the `TimeTracker` folder, create a file named `environment.ts` with the following structure:

```typescript
export const ENV = {
  URL: '',       // The base URL of your n8n webhook or API endpoint
  API_KEY: '',   // API key for authentication, if required
  PASSWORD: '',  // Password for authentication, if needed
};
```

Replace the placeholder values with your actual configuration details.

### Import n8n Workflow

Import the `TimeTracking.json` workflow into your n8n instance. This workflow is designed to interact with the Notion API and facilitate the time-tracking process.

- Navigate to your n8n dashboard.
- Choose "Import Workflow" from the menu options.
- Select the `TimeTracking.json` file and import it.

### Customize the Workflow

Given the highly customized nature of this project, you will likely need to adjust the imported n8n workflow to match the structure of your Notion database. This involves mapping the correct fields and ensuring the workflow actions correctly interact with your database pages (`Logs`, `Tasks`, `MainProjects`, `MainTasks`, and `FriendlyProjects`).

### Deployment

After customization, deploy your n8n workflow. Ensure that your n8n instance is correctly set up to receive webhooks and communicate with the Notion API.

## Usage

With the environment configured, the workflow imported and customized, and the application deployed, your TimeTracker system is ready to use. Interact with it through the specified endpoints or UI to manage your tasks and projects within Notion.

## Contributing

Given the specific setup required for this project, contributions that offer general improvements, additional features, or documentation on customization are welcome. Please ensure that any pull requests or issues are clearly described to be understood and integrated by others facing similar use cases.

## License
This README provides a foundation for setting up and using the TimeTracker Project. Adjust the sections as necessary to better fit the project's current state or future developments.

# Pictures
![image](https://github.com/ldehner/TimeTracker/assets/28535268/e587a07d-2e2d-443c-aecb-97b51776c535)
![image](https://github.com/ldehner/TimeTracker/assets/28535268/2f1769ea-909b-473f-939c-6e2183f0e281)
