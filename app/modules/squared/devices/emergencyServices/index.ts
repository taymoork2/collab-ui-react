import { EmergencyServicesComponent } from './emergencyServices.component';
import { EmergencyServicesService } from './emergencyServices.service';

export interface IEmergency {
  emergencyAddress: IEmergencyAddress;
  emergencyNumber: string;
  status: string;
}

export interface IEmergencyServicesData {
  emergency: IEmergency;
  currentDevice: IDevice;
  locationLabel: string;
  zipLabel: string;
  stateOptions: IState[];
  staticNumber: boolean;
}

export interface IEmergencyServicesStateParams {
  currentHuronDevice: IDevice;
  currentAddress: IEmergencyAddress;
  currentNumber: string;
  status: string;
  huronDeviceService: IHuronService;
  staticNumber: boolean;
}

export interface IDevice {
  cisUuid: string;
}

export interface IEmergencyAddress {
  street?: string;
  city?: string;
  state?: IState | string;
  unit?: string;
  streetAddress?: string;
  address1?: string;
  address2?: string;
  zip?: number | string;
}

export interface IHuronService {
  setEmergencyCallback: Function;
}

export interface IState {
  abbreviation: string;
  name: string;
}

export default angular
  .module('Huron')
  .service('EmergencyServicesService', EmergencyServicesService)
  .component('ucEmergencyServices', new EmergencyServicesComponent())
  .name;
