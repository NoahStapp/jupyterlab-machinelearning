import * as React from 'react';
import { Graph } from './Graph';
import {
  ModelViewerStyle,
  GraphsStyle,
  StatStyle,
  StatsContainerStyle,
  RunTimeStyle
} from '../componentStyle/ModelViewerStyle';

export interface IModelViewerProps {
  spec: Object[];
  dataSet: Object[];
  done: boolean;
  epoch: number;
  runTime: string;
  overallComplete: number;
  epochComplete: number;
}

export class ModelViewer extends React.Component<IModelViewerProps, {}> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div className={ModelViewerStyle}>
        <div className="before" />
        <div className={GraphsStyle}>
          {this.props.spec.map(spec => {
            return (
              <Graph key={spec['name']} graphName={spec['name']} done={this.props.done} />
            )
          })}
        </div>
        {this.props.done && (
          <div className={StatsContainerStyle}>
            <span className={RunTimeStyle}>
              {'Total Run Time: ' + this.props.runTime}
            </span>
            <div className={StatStyle}>
              <span>model based: 12</span>
              <span>model based: 3212</span>
            </div>
            <div className={StatStyle}>
              <span>model based: 1234</span>
              <span>model based: 654</span>
            </div>
            <div className={StatStyle}>
              <span>model based: 53453</span>
              <span>model based: 453</span>
            </div>
          </div>
        )}
      </div>
    );
  }
}
