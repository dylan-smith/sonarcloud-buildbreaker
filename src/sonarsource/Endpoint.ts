export const PROP_NAMES = {
  HOST_URL: 'sonar.host.url',
  LOGIN: 'sonar.login',
  PASSSWORD: 'sonar.password',
  ORG: 'sonar.organization',
  PROJECTKEY: 'sonar.projectKey',
  PROJECTNAME: 'sonar.projectName',
  PROJECTVERSION: 'sonar.projectVersion',
  PROJECTSOURCES: 'sonar.sources',
  PROJECTSETTINGS: 'project.settings'
}

export default class Endpoint {
  constructor(
    readonly url: string,
    readonly token: string,
    readonly organization: string
  ) {}

  toSonarProps(): {[prop: string]: string} {
    return {
      [PROP_NAMES.HOST_URL]: this.url,
      [PROP_NAMES.LOGIN]: this.token,
      [PROP_NAMES.ORG]: this.organization
    }
  }

  static getEndpoint(token: string, organization: string): Endpoint {
    return new Endpoint('https://sonarcloud.io', token, organization)
  }
}
