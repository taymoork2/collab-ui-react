
import { MatterState } from './legal-hold.enums';
import { IMatterJsonData } from './legal-hold.interfaces';

export class Matter {
  public releaseDate: Date | null;
  public state: MatterState = MatterState.ACTIVE;
  public userList?: string[];

  public constructor(
    public orgId: string,
    public caseId: string,
    public createdBy: string,
    public creationDate: Date,
    public name: string,
    public description: string,
    releaseDate?: Date,
  ) {
    this.creationDate = creationDate;
    if (releaseDate) {
      this.releaseDate = this.releaseDate;
      this.state = MatterState.RELEASED;
    } else {
      this.state = MatterState.ACTIVE;
    }
  }

  public toJsonData() {
    const data: IMatterJsonData = {
      orgId: this.orgId,
      caseId: this.caseId,
      createdBy: this.createdBy,
      creationDate: this.creationDate,
      releaseDate: this.releaseDate,
      matterName: this.name,
      matterDescription: this.description,
      matterState: this.state,
    };

    if (this.userList) {
      data['usersUUIDList'] = this.userList;
    }
    return data;
  }

  public static matterFromResponseData(data: {}, caseId?: string): Matter {
    const matter = new Matter(data['orgId'],
      caseId || data['caseId'], data['createdBy'], data['creationDate'], data['matterName'],
      data['matterDescription']);
    const userList = data['usersUUIDList'];
    if (!_.isEmpty(userList) && _.isArray(userList)) {
      matter.userList = data['usersUUIDList'];
    }
    return matter;
  }

  public release(releaseDate: Date) {
    this.state = MatterState.RELEASED;
    this.releaseDate = releaseDate;
  }
}
