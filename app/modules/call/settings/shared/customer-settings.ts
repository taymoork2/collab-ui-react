import { Customer, Link } from 'modules/huron/customer';

export class CustomerSettings extends Customer {
  public hasVoicemailService: boolean;
  public hasVoiceService: boolean;

  constructor(obj: {
    uuid: string,
    name: string,
    servicePackage: string,
    links: Link[],
    hasVoicemailService: boolean,
    hasVoiceService: boolean,
  }) {
    super({
      uuid: obj.uuid,
      name: obj.name,
      servicePackage: obj.servicePackage,
      links: obj.links,
    });
    this.hasVoicemailService = obj.hasVoicemailService;
    this.hasVoiceService = obj.hasVoiceService;
  }
}
