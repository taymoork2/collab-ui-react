export interface IDialPlan {
  name: string;
  countryCode: string;
  regionCodeRequired: boolean;
  supportsSiteSteeringDigit: boolean;
  steeringDigitRequired: boolean;
  supportsSiteCode: boolean;
  extentionsGenerated: boolean;
  supportsLocalDialing: boolean;
  supportsSimplifiedNationalDialing: boolean;
  premiumNumbers: Array<string>;
}
