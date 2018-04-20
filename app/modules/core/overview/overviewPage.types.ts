export type BadgeType = 'success' | 'warning' | 'alert';

export interface IOverviewPageNotification {
  badgeText: string;
  badgeType: BadgeType;
  canDismiss: boolean;
  dismiss: Function;
  link: Function;
  linkText: string;
  textValues?: {};
  name: string;
  text: string;
  extendedText?: string;
}
