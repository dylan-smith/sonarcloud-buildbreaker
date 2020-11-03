import * as path from 'path';
import * as fs from 'fs-extra';
import * as core from '@actions/core';
import * as glob from '@actions/glob';
import Endpoint from './Endpoint';

export const REPORT_TASK_NAME = 'report-task.txt';
export const SONAR_TEMP_DIRECTORY_NAME = 'sonar';

interface ITaskReport {
  ceTaskId: string;
  ceTaskUrl?: string;
  dashboardUrl?: string;
  projectKey: string;
  serverUrl: string;
}

export default class TaskReport {
  private readonly report: ITaskReport;
  constructor(report: Partial<ITaskReport>) {
    for (const field of ['projectKey', 'ceTaskId', 'serverUrl']) {
      if (!report[field as keyof ITaskReport]) {
        throw TaskReport.throwMissingField(field);
      }
    }
    this.report = report as ITaskReport;
  }

  public get projectKey() {
    return this.report.projectKey;
  }

  public get ceTaskId() {
    return this.report.ceTaskId;
  }

  public get serverUrl() {
    return this.report.serverUrl;
  }

  public get dashboardUrl() {
    return this.report.dashboardUrl;
  }

  public static async findTaskFileReport(endpoint: Endpoint): Promise<string[]> {
    let taskReportGlob: string;
    let taskReportGlobResult: string[];

    taskReportGlob = path.join('.sonarqube', 'out', '.sonar', '**', REPORT_TASK_NAME)
    const globber = await glob.create(taskReportGlob);
    taskReportGlobResult = await globber.glob();

    core.debug(`[SQ] Searching for ${taskReportGlob} - found ${taskReportGlobResult.length} file(s)`);
    return taskReportGlobResult;
  }

  public static async createTaskReportsFromFiles(
    endpoint: Endpoint,
    filePaths?: string[]
  ): Promise<TaskReport[]> {
    filePaths = filePaths || await TaskReport.findTaskFileReport(endpoint);
    return await Promise.all(
      filePaths.map(filePath => {
        if (!filePath) {
          return Promise.reject(
            TaskReport.throwInvalidReport(
              `[SQ] Could not find '${REPORT_TASK_NAME}'.` +
                ` Possible cause: the analysis did not complete successfully.`
            )
          );
        }
        core.debug(`[SQ] Read Task report file: ${filePath}`);
        return fs.access(filePath, fs.constants.R_OK).then(
          () => this.parseReportFile(filePath),
          () => {
            return Promise.reject(
              TaskReport.throwInvalidReport(`[SQ] Task report not found at: ${filePath}`)
            );
          }
        );
      })
    );
  }

  private static parseReportFile(filePath: string): Promise<TaskReport> {
    return fs.readFile(filePath, 'utf-8').then(
      fileContent => {
        core.debug(`[SQ] Parse Task report file: ${fileContent}`);
        if (!fileContent || fileContent.length <= 0) {
          return Promise.reject(
            TaskReport.throwInvalidReport(`[SQ] Error reading file: ${fileContent}`)
          );
        }
        try {
          const settings = TaskReport.createTaskReportFromString(fileContent);
          const taskReport = new TaskReport({
            ceTaskId: settings.get('ceTaskId'),
            ceTaskUrl: settings.get('ceTaskUrl'),
            dashboardUrl: settings.get('dashboardUrl'),
            projectKey: settings.get('projectKey'),
            serverUrl: settings.get('serverUrl')
          });
          return Promise.resolve(taskReport);
        } catch (err) {
          if (err && err.message) {
            core.error(`[SQ] Parse Task report error: ${err.message}`);
          } else if (err) {
            core.error(`[SQ] Parse Task report error: ${JSON.stringify(err)}`);
          }
          return Promise.reject(err);
        }
      },
      err =>
        Promise.reject(
          TaskReport.throwInvalidReport(
            `[SQ] Error reading file: ${err.message || JSON.stringify(err)}`
          )
        )
    );
  }

  private static createTaskReportFromString(fileContent: string): Map<string, string> {
    const lines: string[] = fileContent.replace(/\r\n/g, '\n').split('\n'); // proofs against xplat line-ending issues
    const settings = new Map<string, string>();
    lines.forEach((line: string) => {
      const splitLine = line.split('=');
      if (splitLine.length > 1) {
        settings.set(splitLine[0], splitLine.slice(1, splitLine.length).join('='));
      }
    });
    return settings;
  }

  private static throwMissingField(field: string): Error {
    return new Error(`Failed to create TaskReport object. Missing field: ${field}`);
  }

  private static throwInvalidReport(debugMsg: string): Error {
    core.error(debugMsg);
    return new Error(
      'Invalid or missing task report. Check that the analysis finished successfully.'
    );
  }
}
