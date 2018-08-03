import * as React from 'react';
import { ReactElementWidget } from '@jupyterlab/apputils';
import { Kernel, KernelMessage } from '@jupyterlab/services';
import { NotebookPanel } from '@jupyterlab/notebook';
import { CommandRegistry } from '@phosphor/commands';
import { Status } from './components/Status';

export class StatusItemWidget extends ReactElementWidget {
  constructor(
    currentWidget: NotebookPanel | null,
    hasKernel: boolean,
    lossGraphSpec: any,
    accuracyGraphSpec: any,
    commands: CommandRegistry
  ) {
    super(
      hasKernel ? (
        <StatusItem
          kernel={currentWidget.context.session.kernel as Kernel.IKernel}
          commands={commands}
        />
      ) : (
        <div />
      )
    );
  }
}

/**
 * Interface for the machine learning panel's React props
 */
interface IStatusItemProps {
  kernel: Kernel.IKernel;
  commands: CommandRegistry;
}

/**
 * Interface for the machine learning panel's React state
 */
interface IStatusItemState {
  overallComplete: number;
  epochComplete: number;
  epochNumber: number;
}

/** Second Level: React Component that stores the state for the entire extension */
class StatusItem extends React.Component<IStatusItemProps, IStatusItemState> {
  state = {
    overallComplete: 0,
    epochComplete: 0,
    epochNumber: 1
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
      this.setState({
        overallComplete: Number(
          parseFloat(msg.content.data['totalProgress'].toString()).toFixed(2)
        ),
        epochComplete: Number(
          parseFloat(msg.content.data['currentProgress'].toString()).toFixed(2)
        ),
        epochNumber: Number(
          parseInt(msg.content.data['currentStep'].toString())
        )
      });
    }
  }

  render() {
    return (
      <Status
        done={this.state.overallComplete === 100}
        overallComplete={this.state.overallComplete}
        epochComplete={this.state.epochComplete}
        epoch={this.state.epochNumber}
        commands={this.props.commands}
      />
    );
  }
}
