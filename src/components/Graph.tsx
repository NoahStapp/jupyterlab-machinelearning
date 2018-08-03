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
        <div className={GraphContainerStyle}>
          <div className={LabelStyle}>
            <div className={BigLabelStyle}>
              {'Model ' + this.props.statName}
            </div>
            <div className={'stat-label'}>
              <div className='final-avg'>
                {(this.props.done ? 'Final: ' : 'Current: ')}
              </div>
              <div className='stat'>
                {
                  !isNaN(this.props.stat) 
                  ? (this.props.statName === 'Accuracy' 
                    ? Number(this.props.stat*100).toFixed(2) 
                    : Number(this.props.stat).toFixed(2)
                  )
                  : 'NaN'
                }
              </div>
              {!isNaN(this.props.stat) 
                && this.props.statName === 'Accuracy' 
                && <div>%</div>
              }
            </div>
          </div>

          <div id={this.props.statName} className={GraphStyle} />
        </div>
    );
  }
}
