import { JupyterLab, JupyterLabPlugin } from '@jupyterlab/application';
import { ICommandPalette, ReactElementWidget, Toolbar, ToolbarButton } from '@jupyterlab/apputils';
import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';
import { Kernel } from '@jupyterlab/services';
import { ModelViewer } from './components/ModelViewer'
import { IconClass, WidgetStyle } from './componentStyle/ModelViewerStyle'
// import VegaEmbed from 'vega-embed';
// import * as vega from 'vega';
// import { TopLevelSpec as Spec } from 'vega-lite';
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

  
    /** Vega-Lite spec for training loss graph */
    // let lossGraphSpec: Spec = {
    //   $schema: 'https://vega.github.io/schema/vega-lite/v2.json',
    //   data: {
    //     name: 'lossData'
    //   },
    //   width: 400,
    //   mark: 'line',
    //   encoding: {
    //     x: { field: 'samples', type: 'quantitative' },
    //     y: { field: 'loss', type: 'quantitative' }
    //   }
    // };

    // /** Vega-Lite spec for training accuracy graph */
    // let accuracyGraphSpec: Spec = {
    //   $schema: 'https://vega.github.io/schema/vega-lite/v2.json',
    //   data: {
    //     name: 'accuracyData'
    //   },
    //   width: 400,
    //   mark: 'line',
    //   encoding: {
    //     x: { field: 'samples', type: 'quantitative' },
    //     y: { field: 'accuracy', type: 'quantitative' }
    //   }
    // };


    /** Add command to command registry */
    const command: string = 'machinelearning:open-new';
    app.commands.addCommand(command, {
      label: 'Open Machine Learning View',
      iconClass: IconClass,
      isEnabled: hasKernel,
      execute: () => {
        let kernel: Kernel.IKernel = tracker.currentWidget.context.session
          .kernel as Kernel.IKernel;

        const widget = new ModelViewWidget(kernel, null, null);
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
  constructor(
    kernel: Kernel.IKernel,
    lossGraphSpec: any,
    accuracyGraphSpec: any
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
    });
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
    });
  }

  getFormattedRuntime() {
    let hours = Math.floor(this.state.runTime / 3600);
    let minutes = Math.floor((this.state.runTime - hours * 3600) / 60);
    let seconds = Math.floor(this.state.runTime - hours * 3600 - minutes * 60);

    return hours + ':' + minutes + ':' + seconds;
  }

  render() {
    console.log('rendering model view panel with kernel:', this.props.kernel);

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
        done={this.state.overallComplete === 1.00}
        runTime={10000}
        overallComplete={this.state.overallComplete}
        epochComplete={this.state.epochComplete}
      />
    );
  }
}

export default extension;
