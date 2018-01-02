export class SunlightConstantsService {
  public notificationSnoozeHours;
  public successStatus;
  public routingLabels;
  public evaOptions;
  public status;

  constructor() {
    this.notificationSnoozeHours = 48;
    this.status = {
      UNKNOWN: 'Unknown',
      PENDING: 'Pending',
      SUCCESS: 'Success',
      FAILURE: 'Failure',
    };
    this.successStatus = 'Success';
    this.routingLabels = {
      AGENT: 'agent',
      EXPERT: 'expert',
      AGENTPLUSEXPERT: 'agentplusexpert',
    };

    this.evaOptions = {
      EXPERT: 'expert',
      AGENTPLUSEXPERT: 'agentplusexpert',
    };
  }
}
