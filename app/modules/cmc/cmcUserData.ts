export class CmcUserData {
  public mobileNumber: string;
  public entitled: boolean;

  constructor(mobilenumber: string,
              entitled: boolean) {
    this.mobileNumber = mobilenumber;
    this.entitled = entitled;
  }
}
