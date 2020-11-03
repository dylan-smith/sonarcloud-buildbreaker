import * as core from '@actions/core'
import Endpoint from './Endpoint';
import Metrics from './Metrics';
import { getJSON } from './helpers/request';

interface IAnalysis {
  status: string;
  conditions: Condition[];
}

interface Condition {
  status: string;
  metricKey: string;
  actualValue?: string;
  comparator?: string;
  periodIndex?: number;
  errorThreshold?: string;
  warningThreshold?: string;
}

export default class Analysis {
  constructor(
    private readonly analysis: IAnalysis,
    private readonly dashboardUrl?: string,
    private readonly metrics?: Metrics,
    private readonly projectName?: string
  ) {}

  public get status() {
    return this.analysis.status.toUpperCase();
  }

  public static getAnalysis({
    analysisId,
    projectName,
    endpoint,
    metrics,
    dashboardUrl
  }: {
    analysisId: string;
    dashboardUrl?: string;
    endpoint: Endpoint;
    projectName?: string;
    metrics?: Metrics;
  }): Promise<Analysis> {
    core.debug(`[SQ] Retrieve Analysis id '${analysisId}.'`);
    return getJSON(endpoint, '/api/qualitygates/project_status', { analysisId }).then(
      ({ projectStatus }: { projectStatus: IAnalysis }) =>
        new Analysis(projectStatus, dashboardUrl, metrics, projectName),
      err => {
        if (err && err.message) {
          core.error(`[SQ] Error retrieving analysis: ${err.message}`);
        } else if (err) {
          core.error(`[SQ] Error retrieving analysis: ${JSON.stringify(err)}`);
        }
        throw new Error(`[SQ] Could not fetch analysis for ID '${analysisId}'`);
      }
    );
  }
}
