export interface ISftpServer {
  serverName: string;
  directory: string;
  userName: string;
  password: string;
}
export class SftpServer implements ISftpServer {
  public serverName: string;
  public directory: string;
  public userName: string;
  public password: string;
  constructor (obj: {
    serverName: '',
    directory: '',
    userName: '',
    password: '',
  }) {
    this.serverName = obj.serverName;
    this.directory = obj.directory;
    this.userName = obj.userName;
    this.password = obj.password;
  }
}
