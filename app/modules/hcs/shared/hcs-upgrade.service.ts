import { ISftpServer } from '../setup/hcs-setup-sftp';

interface ISftpServerResource extends ng.resource.IResourceClass<ng.resource.IResource<ISftpServer>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<ISftpServer>>;
}
const UPGRADE_DEV_URL = 'http://rch-ads-165:9090/hcs-upgrade-service/api/v1'; //TBD-- FOR  local testing only

export class HcsUpgradeService {
  private sftpServerResource: ISftpServerResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
  ) {
    const updateAction: ng.resource.IActionDescriptor = {
      method: 'PUT',
    };

    this.sftpServerResource = <ISftpServerResource>this.$resource(UPGRADE_DEV_URL + '/partners/:partnerId/sftpServers/:sftpServerId', {},
      {
        update: updateAction,
      });
  }

  public createSftpServer(sftpServer: ISftpServer): ng.IPromise<any> {
    return this.sftpServerResource.save({
      partnerId: this.Authinfo.getOrgId(),
    }, sftpServer).$promise;
  }

  public getSftpServer(_sftpServerId: string): ng.IPromise<ISftpServer> {
    return this.sftpServerResource.get({
      partnerId: this.Authinfo.getOrgId(),
      sftpServerId: _sftpServerId,
    }).$promise;
  }

  public updateSftpServer(_sftpServerId: string, sftpServer: ISftpServer) {
    return this.sftpServerResource.update({
      partnerId: this.Authinfo.getOrgId(),
      sftpServerId: _sftpServerId,
    }, sftpServer).$promise;
  }

  public listSftpServers() {
    return this.sftpServerResource.query({
      partnerId: this.Authinfo.getOrgId(),
    }).$promise;
  }
}
