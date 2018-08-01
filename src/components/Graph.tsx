import * as React from 'react';
import { GraphContainerStyle, LabelStyle, BigLabelStyle, GraphStyle } from '../componentStyle/GraphStyle'

export interface IGraphProps {
  statName: string;
  stat: number;
  graph: any;
  done: boolean;
}

export class Graph extends React.Component<IGraphProps, {}> {
  render() {
    return(
      <div className={GraphContainerStyle}>
          <div className={LabelStyle}>
            <div className={BigLabelStyle}>{'Model ' + this.props.statName + ': '}</div>
            <div className='current-avg'>{(this.props.done ? 'Average ' : 'Current ')}</div>
            <div className='stat'>{this.props.stat}</div>
            <div>{'%'}</div>
          </div>
          <div className={GraphStyle}>
            {this.props.graph}
          </div>
      </div>
    )
  }
}