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
            <span className={BigLabelStyle}>{'Model ' + this.props.statName + ': '}</span>
            <span>{(this.props.done ? 'Average ' : 'Current ') + this.props.stat + '%'}</span>
          </div>
          <div className={GraphStyle}>
            {this.props.graph}
          </div>
      </div>
    )
  }
}