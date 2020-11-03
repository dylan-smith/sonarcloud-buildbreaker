import { PROP_NAMES } from './helpers/utils';

// export interface EndpointData {
//   url: string;
//   token?: string;
//   username?: string;
//   password?: string;
//   organization?: string;
// }

export default class Endpoint {
  constructor(public readonly url: string, public readonly token: string, public readonly organization: string) {}

//   public get organization() {
//     return this.organization;
//   }

//   public get url() {
//     return this.url;
//   }

//   public get token() {
//       return this.token;
//   }

//   public toJson() {
//     return JSON.stringify({ type: this.type, data: this.data });
//   }

  public toSonarProps() {
    return {
      [PROP_NAMES.HOST_URL]: this.url,
      [PROP_NAMES.LOGIN]: this.token,
      [PROP_NAMES.ORG]: this.organization
    };
  }

  public static getEndpoint(token: string, organization: string)
  {
      return new Endpoint("https://sonarcloud.io", token, organization);
  }
}
