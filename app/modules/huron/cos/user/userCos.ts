export interface IRestriction {
  url?: string;
  uuid?: string;
  restriction: string;
  blocked: boolean;
}

export interface IUserCos {
  url: string | null;
  user?: Array<IRestriction>;
  place?: Array<IRestriction>;
  customer: Array<IRestriction>;
}

export interface IDialPlan {
  premiumNumbers: Array<string>;
}
