export class TokenMethods {
  public createtoken: Function;
  public createdtoken: Function;
  public edittoken: Function;
  public removetoken: Function;
  constructor(createToken, createdToken, editToken, removeToken) {
    this.createtoken = createToken;
    this.createdtoken = createdToken;
    this.edittoken = editToken;
    this.removetoken = removeToken;
  }
}
