import * as React from 'react';
import {
  GraphContainerStyle,
  LabelStyle,
  BigLabelStyle,
} from '../componentStyle/GraphStyle';

export interface IGraphProps {
  graphName: string;
  done: boolean;
}

export class Graph extends React.Component<IGraphProps, {}> {
  render() {
    return (
      <div className={GraphContainerStyle}>
        <div className={LabelStyle}>
          <div className={BigLabelStyle}>{this.props.graphName}</div>
          {/* <div className={'stat-label'}>
            <div className="final-avg">
              {this.props.done ? 'Final: ' : 'Current: '}
            </div>
            <div className="stat">
              {!isNaN(this.props.stat)
                ? Number(this.props.stat).toFixed(2)
                : 'NaN'}
            </div>
            {!isNaN(this.props.stat) &&
              this.props.statName === 'Accuracy' && <div>%</div>}
          </div> */}
        </div>
        <div id={this.props.graphName}/>
      </div>
    );
  }
}
