import { IHuronService, IEmergencyAddress, IEmergency, IState, IEmergencyServicesData, IEmergencyServicesStateParams, IDevice } from './index';
import { MemberService } from 'modules/huron/members';
import { FeatureMemberService } from 'modules/huron/features/featureMember.service';
import { HuronCompassService } from 'modules/huron/compass/compass.service';

export class EmergencyServicesService {
  private emergencyDataCopy: IEmergency;
  private currentDevice: IDevice;
  private huronDeviceService: IHuronService;
  private stateOptions: IState[];
  private locationLabel: string;
  private zipLabel: string;

  /* @ngInject */
  constructor(
    private $stateParams: IEmergencyServicesStateParams,
    private ExternalNumberService,
    private ServiceSetup,
    private Authinfo,
    private PstnServiceAddressService,
    private PstnSetupStatesService,
    private PstnSetup,
    private PstnSetupService,
    private TerminusUserDeviceE911Service,
    private MemberService: MemberService,
    private FeatureMemberService: FeatureMemberService,
    private HuronCompassService: HuronCompassService,
  ) {
    this.PstnSetupStatesService.getLocation(this.HuronCompassService.getCountryCode()).then((location) => {
      this.zipLabel = location.zip;
      this.locationLabel = location.type;
      this.stateOptions = location.areas;
    });
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
      locationLabel: this.locationLabel,
      zipLabel: this.zipLabel,
      stateOptions: this.stateOptions,
      staticNumber: this.$stateParams.staticNumber,
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

  public getOptions(filter?): ng.IPromise<string[]> {
    let voicemailPilotNumber;
    return this.ServiceSetup.getVoicemailPilotNumber().then(voicemail =>
      voicemailPilotNumber = voicemail.pilotNumber).then(() => {
        return this.ExternalNumberService.refreshNumbers(this.Authinfo.getOrgId(), undefined, filter).then(() => {
          return _.chain(this.ExternalNumberService.getAssignedNumbers())
            // remove the voicemail number if it exists
            .reject(externalNumber => externalNumber.pattern === voicemailPilotNumber)
            .map(externalNumber => externalNumber.pattern).value();
        });
      }).catch(() => {
        return this.ExternalNumberService.refreshNumbers(this.Authinfo.getOrgId()).then(() => {
          return _.chain(this.ExternalNumberService.getAssignedNumbers())
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
    //Make a request if we can't get the carrierId from the model
    if (this.PstnSetup.getProviderId() === undefined) {
      return this.PstnSetupService.getCustomer(this.Authinfo.getOrgId()).then((customer) => {
        // update our model
        this.PstnSetup.setCustomerId(customer.uuid);
        this.PstnSetup.setCustomerName(customer.name);
        this.PstnSetup.setCustomerFirstName(customer.firstName);
        this.PstnSetup.setCustomerLastName(customer.lastName);
        this.PstnSetup.setCustomerEmail(customer.email);
        return this.PstnServiceAddressService.lookupAddressV2(address, customer.pstnCarrierId, true);
      });
    } else {
      return this.PstnServiceAddressService.lookupAddressV2(address, this.PstnSetup.getProviderId(), true);
    }
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
        return this.FeatureMemberService.getFullNameFromMember(member);
      });
    });
  }
}
