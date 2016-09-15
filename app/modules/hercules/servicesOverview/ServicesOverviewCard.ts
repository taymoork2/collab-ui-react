export interface CardButton {
  name:String;
  buttonClass?:String;
  link:String;
}

export interface CardStatus {
  status:String,
  text:String,
  link:String,
}

export enum CardType {
  cloud,
  hybrid
}

export interface CardParams {
  active?:boolean;
  display?:boolean;
  cardClass?:string;
  cardType?:CardType;
  description:string;
  icon?:string;
  name:string;
  template?:string;
}

export abstract class ServicesOverviewCard {

  protected _status:CardStatus;
  protected _loading = true;
  protected _active:boolean;
  protected _display:boolean;
  private _cardClass:string;
  private _cardType:CardType;
  private _description:string;
  private _icon:string;
  private _template:string;
  private _name:string;

  get active() {
    return this._active;
  }

  get loading() {
    return this._loading;
  }

  get cardClass() {
    return this._cardClass;
  }

  get cardType() {
    return this._cardType;
  }

  get description() {
    return this._description;
  }

  get display() {
    return this._display;
  }

  get icon() {
    return this._icon;
  }

  get name() {
    return this._name;
  }

  get status() {
    return this._status;
  }

  get showStatus() {
    return !this.loading && this.active && this.status && this.status.status;
  }

  get template() {
    return this._template;
  }

  abstract getButtons():Array<CardButton>;

  abstract getShowMoreButton():CardButton;

  public constructor({
    template:_template='modules/hercules/servicesOverview/serviceCard.tpl.html',
    name:_name,
    description:_description,
    icon:_icon='',
    active:_active=true,
    display:_display=true,
    cardClass:_cardClass='cs-card',
    cardType:_cardType = CardType.cloud
  }:CardParams) {
    this._active = _active;
    this._display = _display;
    this._cardClass = _cardClass;
    this._cardType = _cardType;
    this._description = _description;
    this._icon = _icon;
    this._template = _template;
    this._name = _name;
  }
}
