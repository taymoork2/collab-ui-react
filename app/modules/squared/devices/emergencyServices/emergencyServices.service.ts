import { IHuronService, IEmergencyAddress, IEmergency, IState, IEmergencyServicesData, IEmergencyServicesStateParams, IDevice } from './index';
import { MemberService } from 'modules/huron/members';

export class EmergencyServicesService {
  private emergencyDataCopy: IEmergency;
  private currentDevice: IDevice;
  private huronDeviceService: IHuronService;
  private stateOptions: IState[];

  /* @ngInject */
  constructor(
    private $stateParams: IEmergencyServicesStateParams,
    private ExternalNumberService,
    private ServiceSetup,
    private Authinfo,
    private PstnServiceAddressService,
    private TerminusStateService,
    private TerminusUserDeviceE911Service,
    private MemberService: MemberService
  ) {
    this.stateOptions = this.TerminusStateService.query();
  }

  public getInitialData(): IEmergencyServicesData {
    this.currentDevice = this.$stateParams.currentDevice;
    this.huronDeviceService = this.$stateParams.huronDeviceService;
    let emergencyData = {
      emergencyNumber: this.$stateParams.currentNumber,
      emergencyAddress: this.$stateParams.currentAddress,
      status: this.$stateParams.status,
    };
    this.emergencyDataCopy = this.cloneEmergencyData(emergencyData);
    return {
      emergency: emergencyData,
      currentDevice: this.currentDevice,
      stateOptions: this.stateOptions,
    };
  }

  public getCompanyECN() {
    return this.ServiceSetup.listSites().then(() => {
        if (this.ServiceSetup.sites.length !== 0) {
          return this.ServiceSetup.getSite(this.ServiceSetup.sites[0].uuid)
          .then(site => _.get(site, 'emergencyCallBackNumber.pattern'));
        }
    });
  }

  public getOptions(): ng.IPromise<string[]> {
    let voicemailPilotNumber;
    return this.ServiceSetup.getVoicemailPilotNumber().then(voicemail =>
      voicemailPilotNumber = voicemail.pilotNumber).then(() => {
        return this.ExternalNumberService.refreshNumbers(this.Authinfo.getOrgId()).then(() => {
              return _.chain(this.ExternalNumberService.getAssignedNumbers())
                // remove the voicemail number if it exists
                .reject(externalNumber => externalNumber.pattern === voicemailPilotNumber)
                .map(externalNumber => externalNumber.pattern).value();
            });
      });
  }

  public getAddress(): ng.IPromise<IEmergencyAddress> {
    return this.PstnServiceAddressService.getAddress(this.Authinfo.getOrgId()).then((address: IEmergencyAddress) => {
        let emergencyAddress = {
          address1: address.streetAddress,
          address2: address.unit,
          city: address.city,
          state: {
            abbreviation: <string>address.state,
            name: _.find(this.stateOptions, (state: IState) =>
              state.abbreviation === address.state).name,
          },
          zip: address.zip ? parseInt(<string>address.zip, 10) : undefined,
        };
        return emergencyAddress;
    });
  }

  public getAddressForNumber(number: string): ng.IPromise<{e911Address, status}> {
    return this.TerminusUserDeviceE911Service.get({
      customerId: this.Authinfo.getOrgId(),
      number: number,
    }).$promise.then(response => {
      this.emergencyDataCopy.emergencyAddress = _.cloneDeep(response.e911Address);
      return response;
    });
  }

  public getOriginalConfig(): IEmergency {
    return this.cloneEmergencyData(this.emergencyDataCopy);
  }

  public matchesOriginalConfig(emergency: IEmergency): boolean {
    return _.isEqual(emergency, this.emergencyDataCopy);
  }

  private cloneEmergencyData(data: IEmergency): IEmergency {
    return _.cloneDeep(data);
  }

  public save(emergency: IEmergency): ng.IPromise<any> {
    return this.huronDeviceService.setEmergencyCallback(this.currentDevice, emergency.emergencyNumber);
  }

  public validateAddress(address: IEmergencyAddress): ng.IPromise<any> {
    return this.PstnServiceAddressService.lookupAddress(address, true);
  }

  public saveAddress(emergency: IEmergency, address: IEmergencyAddress, useCompanyAddress: boolean): ng.IPromise<any> {
    let response;
    if (useCompanyAddress) {
      response = {
        useCustomE911Address: false,
      };
    } else {
      response = {
        useCustomE911Address: true,
        e911Address: address,
      };
    }
    return this.TerminusUserDeviceE911Service
      .update({
        customerId: this.Authinfo.getOrgId(),
        number: emergency.emergencyNumber,
      }, response).$promise;
  }

  public getImpactedUsers(callback) {
    return this.MemberService.getMemberList(undefined, undefined, callback).then((response) => {
      return response.map((member) => {
        let mem = {};
        member.firstName = member.firstName || '';
        member.lastName = member.lastName || '';
        mem['name'] = member.displayName ? member.displayName : `${member.firstName} ${member.lastName}`;
        return mem;
      });
    });
  }
}
