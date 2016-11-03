export interface ICardButton {
  name: String;
  buttonClass?: String;
  routerState?: String;
}

export interface ICardStatus {
  status: String | undefined;
  text: String | undefined;
  routerState: String;
}

export enum CardType {
  cloud,
  hybrid
}

export interface ICardParams {
  active?: boolean;
  display?: boolean;
  cardClass?: string;
  cardType?: CardType;
  description: string;
  icon?: string;
  name: string;
  template?: string;
}

export abstract class ServicesOverviewCard {

  protected _active: boolean;
  protected _display: boolean;
  protected _loading = true;
  protected _status: ICardStatus;
  private _cardClass: string;
  private _cardType: CardType;
  private _description: string;
  private _icon: string;
  private _name: string;
  private _template: string;

  get active() {
    return this._active;
  }

  get display() {
    return this._display;
  }

  get loading() {
    return this._loading;
  }

  get status() {
    return this._status;
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

  get icon() {
    return this._icon;
  }

  get name() {
    return this._name;
  }

  get template() {
    return this._template;
  }

  get showStatus() {
    return (!this.loading) && this.active && this.status && this.status.status;
  }

  public abstract getButtons(): Array<ICardButton>;

  public abstract getShowMoreButton(): ICardButton | undefined;

  public constructor({
    template: _template = 'modules/services/card.tpl.html',
    active: _active = true,
    cardClass: _cardClass = 'cs-card',
    cardType: _cardType = CardType.cloud,
    description: _description,
    display: _display = true,
    icon: _icon = '',
    name: _name,
  }: ICardParams) {
    this._template = _template;
    this._active = _active;
    this._cardClass = _cardClass;
    this._cardType = _cardType;
    this._description = _description;
    this._display = _display;
    this._icon = _icon;
    this._name = _name;
  }
}
