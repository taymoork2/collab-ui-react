export class SunlightConstantsService {
  public notificationSnoozeHours;
  public status;

  constructor() {
    this.notificationSnoozeHours = 48;
    this.status = {
      UNKNOWN: 'Unknown',
      PENDING: 'Pending',
      SUCCESS: 'Success',
      FAILURE: 'Failure',
    };
  }
}
