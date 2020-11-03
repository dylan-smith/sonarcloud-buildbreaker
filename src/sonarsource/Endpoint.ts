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
    public readonly url: string,
    public readonly token: string,
    public readonly organization: string
  ) {}

  public toSonarProps() {
    return {
      [PROP_NAMES.HOST_URL]: this.url,
      [PROP_NAMES.LOGIN]: this.token,
      [PROP_NAMES.ORG]: this.organization
    }
  }

  public static getEndpoint(token: string, organization: string) {
    return new Endpoint('https://sonarcloud.io', token, organization)
  }
}
