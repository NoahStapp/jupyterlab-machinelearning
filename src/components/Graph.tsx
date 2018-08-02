import * as React from 'react';
import {
  GraphContainerStyle,
  LabelStyle,
  BigLabelStyle,
  GraphStyle
} from '../componentStyle/GraphStyle';

export interface IGraphProps {
  statName: string;
  stat: number;
  graph: any;
  done: boolean;
}

export class Graph extends React.Component<IGraphProps, {}> {
  render() {
    return (
      <div>
        <div className={GraphContainerStyle}>
          <div className={LabelStyle}>
            <div className={BigLabelStyle}>{'Model ' + this.props.statName + ': '}</div>
            <div className='current-avg'>{(this.props.done ? 'Average ' : 'Current ')}</div>
            <div className='stat'>
              {
                !isNaN(this.props.stat) 
                ? Number(this.props.stat*100).toFixed(2)
                : 'NaN'
              }
            </div>
            {!isNaN(this.props.stat) && <div>%</div>}
          </div>
          <div className="current-avg">
            {this.props.done ? 'Average ' : 'Current '}
          </div>
          <div className="stat">
            {Math.round(this.props.stat * 10000) / 100}
          </div>
          <div>{'%'}</div>
        </div>
        <div id={this.props.statName} className={GraphStyle} />
      </div>
    );
  }
}
