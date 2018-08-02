import * as React from 'react';
import { Graph } from './Graph';
import { Status } from './Status';
import {
  ModelViewerStyle,
  GraphsStyle,
  StatStyle,
  StatsContainerStyle,
  RunTimeStyle
} from '../componentStyle/ModelViewerStyle';

export interface IModelViewerProps {
  modelAccuracy: number;
  modelLoss: number;
  done: boolean;
  runTime: number;
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
          <Graph
            statName="Accuracy"
            stat={this.props.modelAccuracy}
            graph="placeholder for accuracy graph"
            done={this.props.done}
          />
          <Graph
            statName="Loss"
            stat={this.props.modelLoss}
            graph="placeholder for loss graph"
            done={this.props.done}
          />
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
        <Status
          overallComplete={this.props.overallComplete}
          epochComplete={this.props.epochComplete}
          modelAccuracy={this.props.modelAccuracy}
          modelLoss={this.props.modelLoss}
          done={this.props.done}
        />
      </div>
    );
  }
}
