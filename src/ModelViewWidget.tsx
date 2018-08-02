import * as React from 'react';
import { ModelViewer } from './components/ModelViewer'
import { ReactElementWidget} from '@jupyterlab/apputils'
import { Kernel } from '@jupyterlab/services';
import VegaEmbed from 'vega-embed';

/** Top Level: ReactElementWidget that passes the kernel down to a React Component */
export class ModelViewWidget extends ReactElementWidget {
    constructor(
      kernel: Kernel.IKernel
    ) {
      super(
        <ModelViewPanel
          kernel={kernel}
        />
      );
    }
  }
  
  /**
   * Interface for the machine learning panel's React props
   */
  interface ModelViewPanelProps {
    kernel: Kernel.IKernel;
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
    updateGraph: boolean;
  }
  
  /**
   * Interface for the training loss graph's data
   */
  interface LossData extends Array<Object> {
    samples: number;
    loss: number;
  }

  /**
   * Interface for the training accuracy graph's data
   */
  interface AccuracyData extends Array<Object> {
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
      updateGraph: true
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
          runTime: Number(parseInt(msg.content.data['runTime'].toString())),
          modelLoss: Number(
            parseFloat(msg.content.data['loss'].toString()).toFixed(4)
          ),
          modelAccuracy: Number(
            parseFloat(msg.content.data['accuracy'].toString()).toFixed(4)
          ),
          epochs: Number(parseInt(msg.content.data['epochs'].toString())),
          updateGraph: false
        }));
      };
      
      const commTotal = this.props.kernel.connectToComm('totalData')
      console.log(commTotal)
      commTotal.onMsg = msg => {
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

      const commEpoch = this.props.kernel.connectToComm('epochData')
      console.log(commEpoch)
      commEpoch.onMsg = msg => {
        // console.log(msg.content.data);
        this.setState({
          lossData: msg.content.data['lossData'],
          accuracyData: msg.content.data['accuracyData'],
          epochNumber: Number(
            parseInt(msg.content.data['epochNumber'].toString())
          ),
          updateGraph: true
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
      let options = {
        defaultStyle: true,
        actions: false
      };
      let lossGraphSpec: any = {
        $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
        data: {
          values: this.state.lossData
        },
        height: 300,
        width: 300,
        mark: {
          type: 'line',
          opacity: 0.25
        },
        encoding: {
          x: { field: 'samples', type: 'quantitative' },
          y: { field: 'loss', type: 'quantitative' }
        }
      };
  
      /** Vega-Lite spec for training accuracy graph */
      let accuracyGraphSpec: any = {
        $schema: 'https://vega.github.io/schema/vega-lite/v4.json',
        data: {
          values: this.state.accuracyData
        },
        height: 300,
        width: 300,
        mark: {
          type: 'line',
          strokeWidth: '0.25'
        },
        encoding: {
          x: { field: 'samples', type: 'quantitative' },
          y: { field: 'accuracy', type: 'quantitative' }
        }
      };
      /** If there is loss and accuracy data, update their respective graphs */
      if (
        this.state.updateGraph &&
        this.state.accuracyData.length !== 0 &&
        this.state.lossData.length !== 0
      ) {
        console.log('Updating graph for epoch', this.state.epochNumber);
        VegaEmbed('#Loss', lossGraphSpec, options);
        VegaEmbed('#Accuracy', accuracyGraphSpec, options);
      }
  
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
