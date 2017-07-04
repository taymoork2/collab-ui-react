declare var bmmp: BMMP.IBmmpService;

declare module BMMP {
  interface IBmmpService {
    init(subscription_id: string, site_url: string, ci_user_uuid: string, application: string, language: string, application_role: string, base_url: string): string;
    poll(id: string, label: string): void;
    cancelPoll(): void;
    checkEntitlement(name: string, scalar: number): void;
    closeWidget(id: string, callback: Function): void;
    getAccountStatus(callback: Function): void;
    tooltip(display: string): void;
  }
}
