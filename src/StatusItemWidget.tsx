import * as React from 'react';
import { ReactElementWidget } from '@jupyterlab/apputils'
import { Kernel } from '@jupyterlab/services';
import { NotebookPanel } from '@jupyterlab/notebook'
import { Status } from './components/Status'

export class StatusItemWidget extends ReactElementWidget {
    constructor(
      currentWidget: NotebookPanel | null,
      hasKernel: boolean,
      lossGraphSpec: any,
      accuracyGraphSpec: any
    ) {
      super(
        hasKernel 
        ? <StatusItem
          kernel={currentWidget.context.session.kernel as Kernel.IKernel}
          lossGraphSpec={lossGraphSpec}
          accuracyGraphSpec={accuracyGraphSpec}
        />
        : <div></div>
      );
    }
  }
  
  /**
   * Interface for the machine learning panel's React props
   */
  interface IStatusItemProps {
    kernel: Kernel.IKernel;
    lossGraphSpec: any;
    accuracyGraphSpec: any;
  }
  
  /**
   * Interface for the machine learning panel's React state
   */
  interface IStatusItemState {
    overallComplete: number;
    epochComplete: number;
    modelAccuracy: number;
    modelLoss: number;
    runTime: number;
    lossData: LossData[];
    accuracyData: AccuracyData[];
    epochNumber: number;
    epochs: number;
  }
  
  /**
   * Interface for the training loss graph's data
   */
  interface LossData {
    samples: number;
    loss: number;
  }
  
  /**
   * Interface for the training accuracy graph's data
   */
  interface AccuracyData {
    samples: number;
    accuracy: number;
  }
  /** Second Level: React Component that stores the state for the entire extension */
  class StatusItem extends React.Component<
    IStatusItemProps,
    IStatusItemState
  > {
    state = {
      overallComplete: 0,
      epochComplete: 0,
      modelAccuracy: 0,
      modelLoss: 0,
      runTime: 0,
      lossData: [],
      accuracyData: [],
      epochNumber: 0,
      epochs: 0,
    };
  
    constructor(props: any) {
      super(props);
      /** Register a custom comm with the backend package */

      this.props.kernel.registerCommTarget('batchData', (comm, msg) => {
        comm.onMsg = msg => {
          // console.log(msg.content.data);
          this.setState(prevState => ({
            overallComplete: Number(
              parseFloat(msg.content.data['totalProgress'].toString()).toFixed(2)
            ),
            epochComplete: Number(
              parseFloat(msg.content.data['currentProgress'].toString()).toFixed(
                2
              )
            ),
            modelLoss: Number(
              parseFloat(msg.content.data['loss'].toString()).toFixed(4)
            ),
            modelAccuracy: Number(
              parseFloat(msg.content.data['accuracy'].toString()).toFixed(4)
            ),
            lossData: [...prevState.lossData, msg.content.data['lossData']],
            accuracyData: [
              ...prevState.accuracyData,
              msg.content.data['accuracyData']
            ],
            epochNumber: Number(
              parseInt(msg.content.data['epochNumber'].toString())
            ),
            epochs: Number(
              parseInt(msg.content.data['epochs'].toString())
            )
          }));
        };
      })      

      this.props.kernel.registerCommTarget('totalData', (comm, msg) => {
        comm.onMsg = msg => {
          // console.log(msg.content.data);
          this.setState({
            runTime: Number(
              parseFloat(msg.content.data['runTime'].toString()).toFixed(2)
            ),
            modelLoss: Number(
              parseFloat(msg.content.data['totalLoss'].toString()).toFixed(2)
            ),
            modelAccuracy: Number(
              parseFloat(msg.content.data['totalAccuracy'].toString()).toFixed(2)
            )
          });
        };
      })      
    }
  
    render() { 
      if(this.state.overallComplete > 99) {
        console.log(this.state.overallComplete)
      }
  
      /** If there is loss and accuracy data, update their respective graphs */
      // if (this.state.lossData !== null && this.state.accuracy !== null) {
      //   VegaEmbed('#lossGraph', this.props.lossGraphSpec).then(res => {
      //     res.view
      //       .change(
      //         'lossData',
      //         vega
      //           .changeset()
      //           .insert(this.state.lossData[this.state.lossData.length - 1])
      //       )
      //       .run();
      //   });
      //   VegaEmbed('#accuracyGraph', this.props.accuracyGraphSpec).then(res => {
      //     res.view
      //       .change(
      //         'accuracyData',
      //         vega
      //           .changeset()
      //           .insert(this.state.accuracyData[this.state.accuracyData.length - 1])
      //       )
      //       .run();
      //   });
      // }
  
      return (
        <Status 
          modelAccuracy={this.state.modelAccuracy}
          modelLoss={this.state.modelLoss}
          done={this.state.overallComplete === 100}
          overallComplete={this.state.overallComplete}
          epochComplete={this.state.epochComplete}
          epoch={this.state.epochNumber}
        />
      );
    }
  }