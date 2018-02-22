
import { MatterState } from './legal-hold.enums';
import { IMatterJsonData } from './legal-hold.interfaces';

export class Matter {
  public releaseDate: Date | undefined;
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
      data.usersUUIDList = this.userList;
    }
    return data;
  }

  public static matterFromResponseData(responseData: IMatterJsonData): Matter {
    const { orgId, caseId, createdBy, creationDate, matterName, matterDescription, usersUUIDList } = responseData;
    const matter = new Matter(orgId, caseId, createdBy, creationDate, matterName, matterDescription);
    if (!_.isEmpty(usersUUIDList)) {
      matter.userList = usersUUIDList;
    }
    return matter;
  }

  public releaseMatter(releaseDate: Date) {
    this.state = MatterState.RELEASED;
    this.releaseDate = releaseDate;
  }
}
