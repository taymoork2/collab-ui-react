export class CmcUserData {
  public mobileNumber: string;
  public cmcEntitled: boolean;

  constructor(mobilenumber: string,
              cmcEntitled: boolean) {
    this.mobileNumber = mobilenumber;
    this.cmcEntitled = cmcEntitled;
  }
}
