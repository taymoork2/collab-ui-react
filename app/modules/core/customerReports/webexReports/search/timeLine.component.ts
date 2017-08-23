import './_timeline.scss';
import * as d3 from 'd3';
import * as moment from 'moment';

class TimeLine implements ng.IComponentController {

  private tip;
  private svg;
  private tips;
  private option;
  private time2line;
  private coordinate;
  private data: any = {};
  private sourceData: any;
  private colorArr: String[];

  /* @ngInject */
  public constructor(
    private $element: ng.IRootElementService,
  ) {
    this.data = {
      xStep: 0,
      yStep: 0,
      ticks: 0,
      domain: [],
      endTime: 0,
      startTime: 0,
      joinsLine: {},
      xAxisFormat: '%I:%M %p',
      gridVerticalLineNum: 24,
      gridHorizontalLineNum: 12,
    };
    this.option = { width: 960, height: 360, paddingRight: 25, paddingLeft: 92.5, paddingButtom: 50.5 };
  }

  public $onInit() {
    this.initParameters();

    this.axis();
    this.drawGridVerticalLine();
    this.drawGridHorizontalLine();
    this.drawLine();
    this.showUser();
    this.showTips();
  }

  public $onChanges(changes: { [bindings: string]: ng.IChangesObject<any> }): void {
    const { lineColor, circleColor } = changes;
    const color = lineColor ? lineColor : circleColor;
    this.setColor(_.get(color, 'currentValue'));
  }

  private initParameters(): void {
    const width = this.$element.find('.timelineSvg').width();
    this.colorArr = ['#32c655', '#f0a309', '#e74a3e', '#AEAEAF'];
    this.option.width = width ? width : this.option.width;
    this.data.endTime = this.sourceData.overview.endTime;
    this.data.startTime = this.sourceData.overview.startTime;
    this.data.gridHorizontalLineNum = this.sourceData.lines.length + 2 > 12 ? this.sourceData.lines.length + 2 : 12;

    if (this.data.gridHorizontalLineNum > 12) {
      this.option.height = (this.data.gridHorizontalLineNum * 26) + this.option.paddingButtom;
    }

    this.coordinate = {
      x: this.option.paddingLeft,
      y: this.option.height - this.option.paddingButtom,
      endX: this.option.width - this.option.paddingRight,
    };

    this.data.yStep = this.coordinate.y / this.data.gridHorizontalLineNum;
    this.data.xStep = (this.coordinate.endX - this.coordinate.x) / this.data.gridVerticalLineNum;
    this.setDomain();
    this.svg = d3.select('.timelineSvg')
      .append('svg:svg')
      .attr('width', this.option.width)
      .attr('height', this.option.height);
    this.tip = d3.select('body').append('div')
      .attr('class', 'timelineTooltip')
      .style('opacity', 0);
    this.tips = [
      { text: 'Good', color: this.colorArr[0] },
      { text: 'Fair', color: this.colorArr[1] },
      { text: 'Poor', color: this.colorArr[2] },
      { text: 'N/A', color: this.colorArr[3] },
    ];
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

  private drawGridHorizontalLine(): void {
    const data: Number[] = [];
    let y = this.coordinate.y + this.data.yStep;
    while (y > 0) {
      y  -= this.data.yStep;
      data.push(y);
    }
    const g = this.svg.append('g').attr('class', 'gridHorizontalLine');
    g.selectAll('.gridHorizontalLine')
      .data(data)
      .enter()
      .append('svg:line')
      .attr('x1', this.coordinate.x)
      .attr('y1', val => val )
      .attr('x2', this.coordinate.endX)
      .attr('y2', val => val );
  }

  private drawGridVerticalLine(): void {
    const data: Number[] = [];
    let x = this.coordinate.x - this.data.xStep;
    while ( x < this.coordinate.endX) {
      x += this.data.xStep;
      data.push(x);
    }

    const g = this.svg.append('g').attr('class', 'gridVerticalLine');
    g.selectAll('.gridVerticalLine')
      .data(data)
      .enter()
      .append('svg:line')
      .attr('x1', val => val)
      .attr('y1', 0)
      .attr('x2', val => val)
      .attr('y2', this.coordinate.y);
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
      item.leaveTime = item.leaveTime || this.sourceData.overview.endTime;
      const end = this.time2line(this.timestampToDate(item.leaveTime));
      const end_ = this.coordinate.endX - this.coordinate.x;
      return _.assignIn({}, item, {
        end: end > end_ ? end_ : end,
        userName_: _.truncate(item.userName, { length: 14 }),
        start: this.time2line(this.timestampToDate(item.joinTime)),
      });
    });
  }

  private drawLine(): void {
    let y = 0;
    const data = _.map(this.data.joinsLine, (item: any) => {
      y += this.data.yStep;
      return _.assignIn({}, item, { y: y });
    });
    const g = this.svg.append('g').attr('class', 'drawLine');
    g.selectAll('.drawLine')
      .data(data)
      .enter()
      .append('svg:line')
      .attr('x1', item => this.coordinate.x + item.start)
      .attr('y1', item => item.y)
      .attr('x2', item => this.coordinate.x + item.end)
      .attr('y2', item => item.y)
      .attr('stroke', this.colorArr[3])
      .attr('id', item => `myLine${item.guestId}-${item.userId}-${item.joinTime}`);

    this.drawDots();
  }

  private drawDots(): void {
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
      .attr('r', 5)
      .attr('cx', item => item.x )
      .attr('cy', item => item.y )
      .attr('id', item => `myDot${item.guestId}-${item.userId}-${item.joinTime}`);
    this.toolTip();
  }

  private toolTip(): void {
    let y = 0;
    const platform = ['WIN32', 'MAC', 'SOLARIS', 'JAVA', 'LINUX'];
    const data = _.map(this.data.joinsLine, (item: any) => {
      y += this.coordinate.y / this.data.gridHorizontalLineNum;
      return _.assignIn({}, item, { x: this.coordinate.x + item.start, y: y });
    });

    _.forEach(data, (item) => {
      const id = `myDot${item.guestId}-${item.userId}-${item.joinTime}`;
      d3.select(`#${id}`)
        .on('mouseover', () => {
          this.tip.classed('Tooltip-bottom', true);
          const template = `<p>User Name: ${item.userName}</p>
          <p>Platform: ${item.platform ? platform[item.platform] : 'N/A'}</p>
          <p>Join Meeting Time: ${item.joinMeetingTime ? item.joinMeetingTime : 'N/A'}</p>
          <p>Latency: ${item.latency ? _.round(item.latency, 1) : 'N/A'}</p>
          <p>PacketLoss: ${item.PacketLoss ? item.PacketLoss : 'N/A'}</p>`;
          this.tip.html(template);
          const tipWidth = this.tip.style('width').replace('px', '');
          const tipHeight = this.tip.style('height').replace('px', '');
          const top = item.y + this.$element.find('.timelineSvg').offset().top;
          const left = item.x + this.$element.find('.timelineSvg').offset().left;

          this.tip.transition()
            .duration(500)
            .style('opacity', .6)
            .style('left', () => (left - 3 - tipWidth / 2) + 'px' )
            .style('top', () => (top - tipHeight - 12) + 'px' );
        })
        .on('mouseout', () => this.tip.transition().duration(500).style('opacity', 0));
    });
  }

  private showUser(): void {
    let y = 0;
    const data = _.map(this.data.joinsLine, (item: any) => {
      y += this.data.yStep;
      return _.assignIn({}, item, { y: y });
    });
    const g = this.svg.append('g').attr('class', 'showUser');
    g.selectAll('.showUser')
      .data(data)
      .enter()
      .append('text')
      .text(item => item.userName_)
      .attr('transform', item => `translate(${this.coordinate.x - 10} , ${item.y})`);
  }

  private showTips(): void {
    let xStart = 0;
    const x = this.coordinate.x;
    const y = this.coordinate.y + 10;
    const colorG = this.svg.append('g')
      .attr('class', 'showTips')
      .attr('transform', `translate(150 , 0)`)
      .append('g')
      .attr('class', 'circleTips');
    colorG.append('text')
      .attr('transform', `translate(${xStart + x} , ${y + 32})`)
      .text('Join Meeting Time: ');
    xStart += 50;

    _.forEach(this.tips, function (val) {
      xStart += 70;
      colorG.append('circle')
        .attr('r', 5)
        .style('fill', val.color)
        .attr('transform', `translate(${xStart + x} , ${y + 28})`);

      colorG.append('text').text(val.text).attr('transform', `translate(${xStart + x + 10} , ${y + 32})`);
    });
    this.lineMsgTips();
  }

  private lineMsgTips(): void {
    const colorG = this.svg.select('.showTips').append('g').attr('class', 'lineTips');
    const x = this.coordinate.x;
    const y = this.coordinate.y + 10;
    const tips = [
      { text: 'Good', color: this.colorArr[0] },
      { text: 'Bad', color: this.colorArr[1] },
      { text: 'N/A', color: this.colorArr[3] },
    ];

    let xStart = 400;
    const lineData = [{ x: x, y: y + 5 }, { x: x + 30, y: y + 5 }];
    const lineFunction = d3.svg.line().x(d => d.x).y(d => d.y).interpolate('linear');

    colorG.append('text')
      .attr('transform', `translate(${xStart + x} , ${y + 32})`)
      .text('Meeting Quality: ');
    xStart += 30;
    _.forEach(tips, (val) => {
      xStart += 80;
      colorG.append('path')
        .attr('d', lineFunction(lineData))
        .attr('stroke', val.color)
        .attr('transform', `translate(${xStart} , 23)`);

      colorG.append('text')
        .attr('font-size', '12px')
        .text(val.text)
        .attr('transform', `translate(${xStart + x + 35} , ${y + 32})`);
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
      if (!colorObj[key]) {
        return true;
      }

      if (colorObj[key]['jmtQuality']) {
        const qa = _.parseInt(colorObj[key]['jmtQuality']) - 1;
        item.joinMeetingTime = colorObj[key].joinMeetingTime + 's';
        d3.select(`#myDot${key}`).style('fill', this.colorArr[qa]);
      }

      if (colorObj[key]['dataQuality']) {
        const qa = _.parseInt(colorObj[key]['dataQuality']) - 1;
        item.latency = colorObj[key].latency + 's';
        item.PacketLoss = colorObj[key].PacketLoss ? colorObj[key].PacketLoss * 100 + '%' : null;
        d3.select(`#myLine${key}`).attr('stroke', this.colorArr[qa]);
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
}

export class CustTimeLineComponent implements ng.IComponentOptions {
  public controller = TimeLine;
  public template = '<div class="timelineSvg"></div>';
  public bindings = { sourceData: '<', lineColor: '<', circleColor: '<' };
}
