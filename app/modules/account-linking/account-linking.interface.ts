
export interface IACSiteInfo {
  linkedSiteUrl: string;
  accountLinkingStatus: string;
  usersLinked: number | undefined;
  totalUsers?: number;
  isSiteAdmin?: boolean;
}

export enum LinkingOriginator {
  Banner = 'Banner',
  Menu = 'Menu',
}

export enum LinkingOperation {
  New = 'New',
  Modify = 'Modify',
}

export interface IGotoWebex {
  siteUrl: string;
  toSiteListPage: boolean;
}
