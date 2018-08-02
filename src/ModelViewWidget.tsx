import * as React from 'react';
import { ModelViewer } from './components/ModelViewer'
import { ReactElementWidget} from '@jupyterlab/apputils'
import { Kernel } from '@jupyterlab/services';


/** Top Level: ReactElementWidget that passes the kernel down to a React Component */
export class ModelViewWidget extends ReactElementWidget {
    constructor(
      kernel: Kernel.IKernel,
      lossGraphSpec: any,
      accuracyGraphSpec: any,
    ) {
      super(
        <ModelViewPanel
          kernel={kernel}
          lossGraphSpec={lossGraphSpec}
          accuracyGraphSpec={accuracyGraphSpec}
        />
      );
    }
  }
  
  /**
   * Interface for the machine learning panel's React props
   */
  interface ModelViewPanelProps {
    kernel: Kernel.IKernel;
    lossGraphSpec: any;
    accuracyGraphSpec: any;
  }
  
  /**
   * Interface for the machine learning panel's React state
   */
  interface ModelViewPanelState {
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
  class ModelViewPanel extends React.Component<
    ModelViewPanelProps,
    ModelViewPanelState
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
      /** Connect to custom comm with the backend package */
      const commBatch = this.props.kernel.connectToComm('batchData')
      console.log(commBatch)
      commBatch.onMsg = (msg): void => {
        // console.log(msg.content.data);
        console.log(msg)
        this.setState(prevState => ({
          overallComplete: Number(
            parseFloat(msg.content.data['totalProgress'].toString()).toFixed(2)
          ),
          epochComplete: Number(
            parseFloat(msg.content.data['currentProgress'].toString()).toFixed(
              2
            )
          ),
          runTime: Number(
            parseInt(msg.content.data['runTime'].toString())
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
      
      const commTotal = this.props.kernel.connectToComm('totalData')
      console.log(commTotal)
      commTotal.onMsg = msg => {
        // console.log(msg.content.data);
        console.log(msg)
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
    }
  
    getFormattedRuntime() {
      let hours = Math.floor(this.state.runTime / 3600);
      let minutes = Math.floor((this.state.runTime - hours * 3600) / 60);
      let seconds = Math.floor(this.state.runTime - hours * 3600 - minutes * 60);
  
      return hours + ':' + minutes + ':' + seconds;
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
        <ModelViewer 
          modelAccuracy={this.state.modelAccuracy}
          modelLoss={this.state.modelLoss}
          done={this.state.overallComplete === 100}
          runTime={this.getFormattedRuntime()}
          overallComplete={this.state.overallComplete}
          epochComplete={this.state.epochComplete}
          epoch={this.state.epochNumber}
        />
      );
    }
  }