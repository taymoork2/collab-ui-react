export interface ISftpServer {
  uuid: string;
  name: string;
  server: string;
  path: string;
  userName: string;
  password: string;
}
export class SftpServer implements ISftpServer {
  public uuid: string;
  public name: string;
  public server: string;
  public path: string;
  public userName: string;
  public password: string;
  constructor (obj: {
    uuid: '',
    name: '',
    server: '',
    path: '',
    userName: '',
    password: '',
  }) {
    this.uuid = obj.uuid;
    this.name = obj.name;
    this.server = obj.server;
    this.path = obj.path;
    this.userName = obj.userName;
    this.password = obj.password;
  }
}
