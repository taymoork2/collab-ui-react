import './_timeline.scss';
import * as d3 from 'd3';
import * as moment from 'moment';

class TimeLine implements ng.IComponentController {

  private tip;
  private svg;
  private option;
  private legendInfo;
  private time2line;
  private coordinate;
  private data: any = {};
  private sourceData: any;

  /* @ngInject */
  public constructor(
    private $element: ng.IRootElementService,
  ) {
    this.data = {
      ticks: 0,
      domain: [],
      endTime: 0,
      startTime: 0,
      joinsLine: {},
      xAxisFormat: '%I:%M %p',
      gridVerticalLineNum: 12,
      gridHorizontalLineNum: 7,
    };
    this.option = { width: 960, paddingRight: 25, paddingLeft: 160.5, paddingButtom: 50.5, paddingTop: 0.5, gridHeight: 35.5 };
  }

  public $onInit() {
    this.initParameters();

    this.axis();
    this.gridVerticalLine();
    this.gridHorizontalLine();
    this.timeLine();
    this.showUser();
    this.legend();
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const { lineColor, circleColor } = changes;
    const color = lineColor ? lineColor : circleColor;
    this.setColor(_.get(color, 'currentValue'));
  }

  private initParameters(): void {
    this.option.width = this.getCanvasWidth();
    this.data.endTime = this.sourceData.endTime;
    this.data.startTime = this.sourceData.startTime;
    this.data.gridHorizontalLineNum = this.getGridHorizontalLineHum();
    this.option.height = this.getCanvasHeight();

    this.coordinate = {
      x: this.option.paddingLeft,
      y: this.option.height - this.option.paddingButtom,
      endX: this.option.width - this.option.paddingRight,
    };
    this.option.gridWidth = (this.coordinate.endX - this.coordinate.x) / this.data.gridVerticalLineNum;

    this.setDomain();
    this.svg = d3.select('.timelineSvg')
      .append('svg:svg')
      .attr('width', this.option.width)
      .attr('height', this.option.height);
    this.tip = d3.select('body').append('div')
      .attr('class', 'timelineTooltip')
      .style('opacity', 0);

    this.legendInfo = {
      line: ['Good', 'Bad', 'N/A'],
      circle: ['Good', 'Fair', 'Poor', 'N/A'],
    };
  }

  private getGridHorizontalLineHum(): number {
    return this.sourceData.lines.length + 2 > this.data.gridHorizontalLineNum ? this.sourceData.lines.length + 2 : this.data.gridHorizontalLineNum;
  }


  private getCanvasWidth(): number {
    const width = this.$element.find('.timelineSvg').width();
    return width ? width : this.option.width;
  }

  private getCanvasHeight(): number {
    return (this.data.gridHorizontalLineNum * this.option.gridHeight) + this.option.paddingButtom + this.option.paddingTop;
  }

  private setDomain(): void {
    const duration = this.data.endTime - this.data.startTime;
    const ruler: number = this.setRuler(duration / 1000) * 1000;
    const tickNum = _.ceil(duration / ruler);

    this.data.ruler = ruler;
    this.data.ticks = this.setTicks(tickNum);

    const startTime = _.floor(this.data.startTime / ruler) * ruler;
    const endTime = startTime + (ruler * this.data.ticks);
    this.data.domain = [this.timestampToDate(startTime), this.timestampToDate(endTime)];
  }

  private gridHorizontalLine(): void {
    const data: Object[] = [];
    let y = this.coordinate.y + this.option.gridHeight;
    while (y > 0) {
      y  -= this.option.gridHeight;
      data.push({ x1: this.coordinate.x, y1: y, x2: this.coordinate.endX, y2: y });
    }
    this.dataToline({ data: data, append: 'svg:line', class: 'gridHorizontalLine' });
  }

  private gridVerticalLine(): void {
    const data: Object[] = [];
    let x = this.coordinate.x - this.option.gridWidth;
    while ( x < this.coordinate.endX) {
      x += this.option.gridWidth;
      data.push({ x1: x, y1: 0, x2: x, y2: this.coordinate.y });
    }
    this.dataToline({ data: data, append: 'svg:line', class: 'gridVerticalLine' });
  }

  private axis(): void {
    const timeRange = d3.time.scale()
      .domain(this.data.domain)
      .range([0, this.coordinate.endX - this.coordinate.x]);
    this.time2line = timeRange;
    this.setLine();

    const xAxis = d3.svg.axis()
      .scale(timeRange)
      .orient('bottom')
      .ticks(this.data.ticks)
      .tickSize(3, 0)
      .tickFormat(d3.time.format(this.data.xAxisFormat));

    this.svg.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${this.coordinate.x}, ${this.coordinate.y})`)
      .call(xAxis);
  }

  private setLine(): void {
    this.data.joinsLine = _.map(this.sourceData.lines, (item: any) => {
      item.leaveTime = item.leaveTime || this.sourceData.endTime;
      const end = this.time2line(this.timestampToDate(item.leaveTime));
      const end_ = this.coordinate.endX - this.coordinate.x;
      return _.assignIn({}, item, {
        end: end > end_ ? end_ : end,
        userName_: _.truncate(item.userName, { length: 12 }),
        start: this.time2line(this.timestampToDate(item.joinTime)),
      });
    });
  }

  private timeLine(): void {
    let y = 0;
    const data = _.map(this.data.joinsLine, (item: any) => {
      y += this.option.gridHeight;
      return _.assignIn({}, item, { y: y });
    });
    const g = this.svg.append('g').attr('class', 'timeLine');
    g.selectAll('.timeLine')
      .data(data)
      .enter()
      .append('svg:line')
      .attr('x1', item => this.coordinate.x + item.start)
      .attr('y1', item => item.y)
      .attr('x2', item => this.coordinate.x + item.end)
      .attr('y2', item => item.y)
      .attr('id', item => `myLine${item.guestId}-${item.userId}-${item.joinTime}`);

    this.drawCircle();
  }

  private drawCircle(): void {
    let y = 0;
    const data = _.map(this.data.joinsLine, (item: any) => {
      y += this.coordinate.y / this.data.gridHorizontalLineNum;
      return _.assignIn({}, item, { x: this.coordinate.x + item.start, y: y });
    });

    const g = this.svg.append('g').attr('class', 'circleStart');
    g.selectAll('.circleStart')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'myDot')
      .attr('r', 9)
      .attr('cx', item => item.x )
      .attr('cy', item => item.y )
      .attr('id', item => `myDot${item.guestId}-${item.userId}-${item.joinTime}`);
    this.toolTip();
  }

  private toolTip(): void {
    let y = 0;
    const data = _.map(this.data.joinsLine, (item: any) => {
      y += this.option.gridHeight;
      return _.assignIn({}, item, { x: this.coordinate.x + item.start, y: y });
    });

    _.forEach(data, (item) => {
      const lineId = `#myLine${item.guestId}-${item.userId}-${item.joinTime}`;
      const circleId = `#myDot${item.guestId}-${item.userId}-${item.joinTime}`;
      const textId = `#myText${item.guestId}-${item.userId}-${item.joinTime}`;
      d3.select(circleId)
        .on('mouseover', () => {
          const class_ = _.lowerCase(this.legendInfo.circle[item.jmtQuality]) + 'Circle';
          const msgArr = [{ key: 'Join Meeting Time', value: item.joinMeetingTime ? `${item.joinMeetingTime}s` : 'N/A', class: class_ }];
          const top = item.y + this.$element.find('.timelineSvg').offset().top;
          const left = item.x + this.$element.find('.timelineSvg').offset().left;

          this.makeTips({ arr: msgArr }, { top: top, left: left });
        })
        .on('mouseout', () => this.tip.transition().duration(500).style('opacity', 0));

      d3.select(lineId)
        .on('mouseover', () => {
          const msg = {
            des: _.upperFirst(moment.duration(item.duration * 1000).humanize(true)),
            arr: [
              { key: 'Client IP', value: item.clientIP },
              { key: 'Gateway IP', value: item.gatewayIP },
            ],
          };
          this.makeTips(msg);
        })
        .on('mouseout', () => this.tip.transition().duration(500).style('opacity', 0));


      d3.select(textId)
        .on('mouseover', () => {
          const msgArr = [
            { key: 'User Name', value: item.userName },
            { key: 'Platform', value: item.platform_ },
          ];
          this.makeTips({ arr: msgArr });
        })
        .on('mouseout', () => this.tip.transition().duration(500).style('opacity', 0));
    });
  }

  private makeTips(msg, option: Object|undefined = undefined) {
    let template: string = '';
    this.tip.classed('Tooltip-bottom', true);
    template += msg.des ? `<p><span>${msg.des}</span></p>` : '';
    _.forEach(msg.arr, (item) => {
      template += `<p class="${item.class ? item.class : ''}"><span>${item.key}:</span> ${item.value}</p>`;
    });
    this.tip.html(template);

    const leftOffset = this.tip.style('width').replace('px', '');
    const topOffset = this.tip.style('height').replace('px', '');
    const left = option ? _.get(option, 'left') : d3.event.clientX;
    const top = option ? _.parseInt(_.get(option, 'top')) - 20 : d3.event.clientY - 9;

    this.tip.transition()
      .duration(500)
      .style('opacity', 1)
      .style('display', 'block')
      .style('z-index', 1025)
      .style('top', () => (top - topOffset) + 'px' )
      .style('left', () => (left - leftOffset / 2) + 'px' );
  }

  private showUser(): void {
    let y = 0;
    const data = _.map(this.data.joinsLine, (item: any) => {
      y += this.option.gridHeight;
      return _.assignIn({}, item, { y: y });
    });
    const g = this.svg.append('g').attr('class', 'showUser');
    g.selectAll('.showUser')
      .data(data)
      .enter()
      .append('text')
      .text(item => item.userName_)
      .attr('id', item => `myText${item.guestId}-${item.userId}-${item.joinTime}`)
      .attr('transform', item => `translate(${this.coordinate.x - 9} , ${item.y})`);
  }

  private legend(): void {
    let xStart = 0;
    const x = this.coordinate.x;
    const y = this.coordinate.y + 9;
    const colorG = this.svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(130 , 0)`)
      .append('g')
      .attr('class', 'circle');
    colorG.append('text')
      .attr('transform', `translate(${xStart + x} , ${y + 32})`)
      .text('Join Meeting Time: ');
    xStart += 70;

    _.forEach(this.legendInfo.circle, function (val) {
      xStart += 70;
      colorG.append('circle')
        .attr('r', 9)
        .attr('class', val === 'N/A' ? '' : _.toLower(val) + 'Circle')
        .attr('transform', `translate(${xStart + x} , ${y + 28})`);

      colorG.append('text').text(val).attr('transform', `translate(${xStart + x + 20} , ${y + 32})`);
    });
    this.lineMsgTips();
  }

  private lineMsgTips(): void {
    const colorG = this.svg.select('.legend').append('g').attr('class', 'line');
    const y = this.coordinate.y + 38;

    let xStart = 430;
    colorG.append('text')
      .attr('transform', `translate(${xStart + this.coordinate.x} , ${y + 4})`)
      .text('Meeting Quality: ');
    xStart += 193;
    _.forEach(this.legendInfo.line, (val) => {
      xStart += 100;
      colorG.append('svg:line')
        .attr('class', val === 'N/A' ? '' : _.toLower(val) + 'Line')
        .attr('x1', xStart)
        .attr('y1', y)
        .attr('x2', xStart + 30)
        .attr('y2', y);

      colorG.append('text')
        .text(val)
        .attr('transform', `translate(${xStart + 45} , ${y + 4})`);
    });
  }

  private setColor(color): void {
    if (!color) {
      return;
    }
    let key;
    const colorObj = {};
    _.forEach(color, (item) => {
      key = `${item.guestId}-${item.userId}-${item.joinTime}`;
      colorObj[key] = item;
    });
    _.forEach(this.data.joinsLine, (item) => {
      key = `${item.guestId}-${item.userId}-${item.joinTime}`;
      _.assignIn(item, colorObj[key]);
      if (!colorObj[key]) {
        return true;
      }

      if (colorObj[key]['jmtQuality']) {
        item.jmtQuality = _.parseInt(colorObj[key]['jmtQuality']) - 1;
        const class_ = this.legendInfo.circle[item.jmtQuality] === 'N/A' ? '' : _.lowerCase(this.legendInfo.circle[item.jmtQuality]) + 'Circle';
        d3.select(`#myDot${key}`).attr('class', class_);
      }

      if (colorObj[key]['dataQuality']) {
        item.dataQuality = _.parseInt(colorObj[key]['dataQuality']) - 1;
        const class_ = this.legendInfo.line[item.dataQuality] === 'N/A' ? '' : _.lowerCase(this.legendInfo.line[item.dataQuality]) + 'Line';
        d3.select(`#myLine${key}`).attr('class', class_);
      }
    });

    this.toolTip();
  }

  private setRuler(time): number {
    const rulerArr = [[1800, 0, 300], [10800, 1800, 900], [21600, 10800, 1800], [43200, 21600, 3600], [86400, 43200, 7200]];
    let ruler = 300;
    _.forEach(rulerArr, (item) => {
      if (time <= item[0] && time > item[1]) {
        ruler = item[2];
        return false;
      }
    });
    return ruler;
  }

  private timestampToDate(timestamp): Date {
    const offset = this.sourceData.offset ? this.sourceData.offset : '+00:00';
    const utcTime = moment(timestamp).utc().format('YYYY-MM-DD HH:mm:ss');
    const dateStr = moment.utc(utcTime).utcOffset(offset).format('YYYY-MM-DD HH:mm:ss');
    return moment(dateStr).toDate();
  }

  private setTicks(tick: number): number {
    let tickNum = 4;
    if (tick > 4 ) {
      tickNum = tick > 6 ? 12 : 6;
    }
    return tickNum;
  }

  private dataToline(option) {
    const g = this.svg.append('g').attr('class', option.class);
    g.selectAll(`.${option.class}`)
      .data(option.data)
      .enter()
      .append(option.append)
      .attr('x1', item => item.x1)
      .attr('y1', item => item.y1)
      .attr('x2', item => item.x2)
      .attr('y2', item => item.y2);
  }
}

export class DgcTimeLineComponent implements ng.IComponentOptions {
  public controller = TimeLine;
  public template = '<div class="timelineSvg"></div>';
  public bindings = { sourceData: '<', lineColor: '<', circleColor: '<' };
}
