import { JupyterLab, JupyterLabPlugin } from '@jupyterlab/application';
import { ICommandPalette, ReactElementWidget, Toolbar, ToolbarButton } from '@jupyterlab/apputils';
import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';
import { Kernel } from '@jupyterlab/services';
import { ModelViewer } from './components/ModelViewer'
import { IconClass, WidgetStyle } from './componentStyle/ModelViewerStyle'
import * as React from 'react';
import '../style/urls.css'

/**
 * An extension to further explore machine learning models
 * with JupyterLab
 **/
const extension: JupyterLabPlugin<void> = {
  id: '@jupyterlab/jupyterlab-machinelearning',
  requires: [ICommandPalette, INotebookTracker],
  activate: (
    app: JupyterLab,
    palette: ICommandPalette,
    tracker: INotebookTracker
  ): void => {
    function hasKernel(): boolean {
      return (
        tracker.currentWidget !== null &&
        tracker.currentWidget.context.session.kernel !== null
      );
    }

    /** Add command to command registry */
    const command: string = 'machinelearning:open-new';
    app.commands.addCommand(command, {
      label: 'Open Machine Learning View',
      iconClass: IconClass,
      isEnabled: hasKernel,
      execute: () => {
        let kernel: Kernel.IKernel = tracker.currentWidget.context.session
          .kernel as Kernel.IKernel;

        const widget = new ModelViewWidget(kernel);
        widget.id = 'machinelearning';
        widget.addClass(WidgetStyle);
        widget.title.label = 'Machine Learning';
        widget.title.iconClass = IconClass;
        widget.title.closable = true;

        if (!widget.isAttached) {
          app.shell.addToMainArea(widget);
        }
        app.shell.activateById(widget.id);
      }
    });

    /** Add command to command palette */
    palette.addItem({ command, category: 'Notebook Operations' });

    /** Add button for machine learning to notebook toolbar */
    function addButton() {
      let widget: NotebookPanel | null = tracker.currentWidget;
      if (widget) {
        let button: ToolbarButton = Toolbar.createFromCommand(app.commands, command);
        widget.toolbar.insertItem(9, app.commands.label(command), button)
      }
    }

    /** Refresh command, used to update isEnabled when kernel status is changed */
    function refreshNewCommand() {
      app.commands.notifyCommandChanged(command)
    }

    /** 
     * Deals with updating isEnabled status of command 
     * as well as placing button when currentWidget is a notebook panel
     * 
     * Code credit to @vidartf/jupyterlab-kernelspy
     * */
    let widget: NotebookPanel | null = tracker.currentWidget;
    if (widget) {
      widget.context.session.kernelChanged.connect(refreshNewCommand)
    }
    tracker.currentChanged.connect((tracker) => {
      addButton()
      if (widget) {
        widget.context.session.kernelChanged.disconnect(refreshNewCommand)
      }
      widget = tracker.currentWidget;
      if (widget) {
        widget.context.session.kernelChanged.connect(refreshNewCommand);
      }
    })

  },
  autoStart: true
};

/** Top Level: ReactElementWidget that passes the kernel down to a React Component */
class ModelViewWidget extends ReactElementWidget {
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
  modelAccuracy: number;
  modelLoss: number;
  lossData: Object[];
  oldLossData: Object[];
  done: boolean;
}

/** Second Level: React Component that stores the state for the entire extension */
class ModelViewPanel extends React.Component<
  ModelViewPanelProps,
  ModelViewPanelState
> {
  state = {
    totalProgress: 0,
    currentProgress: 0,
    modelAccuracy: 0,
    modelLoss: 0,
    lossData: null,
    oldLossData: null,
    done: false
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
          modelLoss: Number(
            parseFloat(msg.content.data['loss'].toString()).toFixed(2)
          ),
          modelAccuracy: Number(
            parseFloat(msg.content.data['accuracy'].toString()).toFixed(2)
          ),
          currentProgress: Number(
            parseFloat(msg.content.data['current'].toString()).toFixed(2)
          ),
          oldLossData: this.state.lossData,
          lossData: msg.content.data['loss_data'],
          done: Number(
            parseFloat(msg.content.data['overall'].toString()).toFixed(2)
          ) === 100,
        });
      };
      comm.onClose = msg => {
        console.log(msg);
      };
    });
  }

  render() {
    console.log('rendering model view panel with kernel:', this.props.kernel);

    return (
      <ModelViewer 
        modelAccuracy={this.state.modelAccuracy}
        modelLoss={this.state.modelLoss}
        done={this.state.done}
        runTime={10000}
      />
    );
  }
}

export default extension;
