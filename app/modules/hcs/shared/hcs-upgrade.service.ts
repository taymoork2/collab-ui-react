import { ISftpServer } from '../setup/hcs-setup-sftp';

interface ISftpServerResource extends ng.resource.IResourceClass<ng.resource.IResource<ISftpServer>> {
  update: ng.resource.IResourceMethod<ng.resource.IResource<ISftpServer>>;
}

export class HcsUpgradeService {
  private sftpServerResource: ISftpServerResource;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private HuronConfig,
  ) {
    const updateAction: ng.resource.IActionDescriptor = {
      method: 'PUT',
    };

    this.sftpServerResource = <ISftpServerResource>this.$resource(this.HuronConfig.getUpgradeUrl() + '/partners/{partnerId}/sftpServers/{sftpServerId}', {},
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
    return this.sftpServerResource.save({
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
