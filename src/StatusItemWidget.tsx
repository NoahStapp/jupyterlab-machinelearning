import * as React from 'react';
import { ReactElementWidget } from '@jupyterlab/apputils'
import { Kernel, KernelMessage } from '@jupyterlab/services';
import { NotebookPanel, INotebookTracker } from '@jupyterlab/notebook'
import { CommandRegistry } from '@phosphor/commands';
import { Status } from './components/Status'

export class StatusItemWidget extends ReactElementWidget {
    constructor(
      hasKernel: boolean,
      lossGraphSpec: any,
      accuracyGraphSpec: any,
      commands: CommandRegistry,
      tracker: INotebookTracker
    ) {
      super(
        hasKernel 
        ? <StatusItem
          kernel={tracker.currentWidget.context.session.kernel as Kernel.IKernel}
          lossGraphSpec={lossGraphSpec}
          accuracyGraphSpec={accuracyGraphSpec}
          commands={commands}
          tracker={tracker}
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
    commands: CommandRegistry;
    tracker: INotebookTracker;
  }
  
  /**
   * Interface for the machine learning panel's React state
   */
  interface IStatusItemState {
    kernel: Kernel.IKernel;
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
      kernel: this.props.kernel,
      overallComplete: 0,
      epochComplete: 0,
      modelAccuracy: 0,
      modelLoss: 0,
      runTime: 0,
      lossData: [],
      accuracyData: [],
      epochNumber: 1,
      epochs: 0,
    };
  
    constructor(props: any) {
      super(props);
      /** Connect to custom comm with the backend package */
      this.props.kernel.iopubMessage.connect(this.onMessage, this) 

      /** Register a custom comm with the backend package */
      this.props.kernel.registerCommTarget('batchData', (comm, msg) => {})     
      this.props.kernel.registerCommTarget('totalData', (comm, msg) => {})   

      this.props.tracker.currentChanged.connect((tracker) => {
        let widget: NotebookPanel | null = tracker.currentWidget
        if (widget) {
          console.log('new widget. re-registering comm targets')

          this.setState({
            kernel: widget.session.kernel as Kernel.IKernel
          },
          () => {
            this.state.kernel.iopubMessage.connect(this.onMessage, this)

            this.state.kernel.registerCommTarget('batchData', (comm, msg) => {})     
            this.state.kernel.registerCommTarget('totalData', (comm, msg) => {})
          })
        }
      })

    }

    onMessage(sender: Kernel.IKernel, msg: KernelMessage.IIOPubMessage) {
      if (msg.content.target_name === 'batchData') {
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
          epochs: Number(
            parseInt(msg.content.data['epochs'].toString())
          )
        }));
      } else if (msg.content.target_name === 'totalData') {
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
      } else if (msg.content.target_name === 'epochData') {
        this.setState({
          epochNumber: Number(
            parseInt(msg.content.data['epochNumber'].toString()) + 1
          ),
        })
      }
    }
  
    render() { 
      return (
        <Status 
          modelAccuracy={this.state.modelAccuracy}
          modelLoss={this.state.modelLoss}
          done={this.state.overallComplete === 100}
          overallComplete={this.state.overallComplete}
          epochComplete={this.state.epochComplete}
          epoch={this.state.epochNumber}
          commands={this.props.commands}
        />
      );
    }
  }