import { JupyterLab, JupyterLabPlugin } from '@jupyterlab/application';
import { ICommandPalette, ReactElementWidget } from '@jupyterlab/apputils';
import { INotebookTracker } from '@jupyterlab/notebook';
import { Kernel } from '@jupyterlab/services';
import { ModelViewer } from './components/ModelViewer'
import * as React from 'react';

const extension: JupyterLabPlugin<void> = {
  id: '@jupyterlab/jupyterlab-machinelearning',
  requires: [ICommandPalette, INotebookTracker],
  activate: (
    app: JupyterLab,
    palette: ICommandPalette,
    tracker: INotebookTracker
  ): void => {
    const command: string = 'machinelearning:open-new';
    app.commands.addCommand(command, {
      label: 'New Model Viewer',
      execute: () => {
        let kernel: Kernel.IKernel = tracker.currentWidget.context.session
          .kernel! as Kernel.IKernel;

        const widget = new ModelView(kernel);
        widget.id = 'machinelearning';
        widget.title.label = 'Machine Learning';
        widget.title.closable = true;

        if (!widget.isAttached) {
          app.shell.addToMainArea(widget);
        }
        app.shell.activateById(widget.id);
      }
    });

    palette.addItem({ command, category: 'AAA' });
  },
  autoStart: true
};

class ModelView extends ReactElementWidget {
  constructor(kernel: Kernel.IKernel) {
    super(<ModelViewPanel kernel={kernel} />);
  }
}

interface ModelViewPanelProps {
  kernel: Kernel.IKernel;
}

interface ModelViewPanelState {
  totalProgress: number;
  currentProgress: number;
}

class ModelViewPanel extends React.Component<
  ModelViewPanelProps,
  ModelViewPanelState
> {
  state = {
    totalProgress: 0,
    currentProgress: 0
  };

  constructor(props: any) {
    super(props);
    this.props.kernel.registerCommTarget('test', (comm, msg) => {
      comm.onMsg = msg => {
        comm.send(msg.content.data); // echo
        this.setState({
          totalProgress: Number(
            parseFloat(msg.content.data['overall'].toString()).toFixed(2)
          ),
          currentProgress: Number(
            parseFloat(msg.content.data['current'].toString()).toFixed(2)
          )
        });
      };
      comm.onClose = msg => {
        console.log(msg); // 'bye'
      };
    });
  }

  render() {
    console.log('rendering model view panel with kernel', this.props.kernel);

    return (
      <ModelViewer 
        modelAccuracy={0}
        modelLoss={0}
        done={true}
        runTime={10000}
      />
    );
  }
}

export default extension;
