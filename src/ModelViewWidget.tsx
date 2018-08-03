import * as React from 'react';
import { ModelViewer } from './components/ModelViewer';
import { ReactElementWidget } from '@jupyterlab/apputils';
import { Kernel, KernelMessage } from '@jupyterlab/services';
import VegaEmbed from 'vega-embed';

/** Top Level: ReactElementWidget that passes the kernel down to a React Component */
export class ModelViewWidget extends ReactElementWidget {
  constructor(kernel: Kernel.IKernel) {
    super(<ModelViewPanel kernel={kernel} />);
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
  runTime: number;
  dataSet: Object[];
  spec: Object[];
  currentStep: number;
  totalSteps: number;
  updateGraph: boolean;
}

/** Second Level: React Component that stores the state for the entire extension */
class ModelViewPanel extends React.Component<
  ModelViewPanelProps,
  ModelViewPanelState
> {
  state = {
    overallComplete: 0,
    epochComplete: 0,
    runTime: 0,
    dataSet: new Array<Object>(),
    spec: new Array<Object>(),
    currentStep: 1,
    totalSteps: 0,
    updateGraph: true
  };

  constructor(props: any) {
    super(props);
    /** Connect to custom comm with the backend package */
    this.props.kernel.iopubMessage.connect(this.onMessage, this);

    /** Register a custom comm with the backend package */
    this.props.kernel.registerCommTarget('plyto', (comm, msg) => {});
  }

  onMessage(sender: Kernel.IKernel, msg: KernelMessage.IIOPubMessage) {
    if (msg.content.target_name === 'plyto') {
      this.setState(prevState => ({
        spec: msg.content.data['spec'],
        runTime: Number(parseInt(msg.content.data['runTime'].toString())),
        totalSteps: Number(parseInt(msg.content.data['totalSteps'].toString())),
        currentStep: Number(
          parseInt(msg.content.data['currentStep'].toString())
        ),
        updateGraph: prevState.currentStep !== msg.content.data['currentStep'],
        dataSet: [...prevState.dataSet, msg.content.data['dataSet']]
      }));
    }
  }

  getFormattedRuntime() {
    let hours = Math.floor(this.state.runTime / 3600);
    let minutes = Math.floor((this.state.runTime - hours * 3600) / 60);
    let seconds = Math.floor(this.state.runTime - hours * 3600 - minutes * 60);

    return hours + ':' + minutes + ':' + seconds;
  }

  render() {
    if (this.state.updateGraph && this.state.dataSet.length !== 0) {
      this.state.spec.forEach(spec => {
        VegaEmbed('#' + spec['name'], spec).then(res => {
          res.view.insert('dataSet', this.state.dataSet).run();
        });
      });
    }

    return (
      <ModelViewer
        spec={this.state.spec}
        dataSet={this.state.dataSet}
        done={this.state.overallComplete === 100}
        runTime={this.getFormattedRuntime()}
        overallComplete={this.state.overallComplete}
        epochComplete={this.state.epochComplete}
        epoch={this.state.currentStep}
      />
    );
  }
}
