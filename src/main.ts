import * as core from '@actions/core'
import checkQualityGate from './checkQualityGate';

async function run(): Promise<void> {
  try {
    const token = core.getInput('sonarToken');
    const organization = core.getInput('sonarOrganization');

    await checkQualityGate(token, organization);
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()