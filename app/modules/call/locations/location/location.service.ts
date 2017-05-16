class Location {
  public name: string = '';
  public timeZone: string = '';
  public preferredLanguage: string;
  public tone: string;
  public dateFormat: string;
  public timeFormat: string;
  public routingPrefix: string;
  public steeringDigit: string;
  public defaultLocation: boolean;
  public allowExternalTransfer: boolean;
  public voicemailPilotNumber: {
    number: string;
    generated: boolean;
  };
  public regionCodeDialing: {
    simplifiedNationalDialing: boolean;
  };
  public callerIdNumber: string;
}
export class LocationService {
  public get() {
    return new Location();
  }
}
