export interface IRestriction {
  url?: string;
  uuid?: string;
  restriction: string;
  blocked: boolean;
}

export interface IUserCos {
  url: string | null;
  user?: IRestriction[];
  place?: IRestriction[];
  customer: IRestriction[];
}

export interface IDialPlan {
  premiumNumbers: string[];
}
