import { JupyterLab, JupyterLabPlugin } from '@jupyterlab/application';
import { ICommandPalette, ReactElementWidget } from '@jupyterlab/apputils';
import { INotebookTracker } from '@jupyterlab/notebook';
import { Kernel } from '@jupyterlab/services';
// import VegaEmbed from 'vega-embed';
// import * as vega from 'vega';
// import { TopLevelSpec as Spec } from 'vega-lite';
import * as React from 'react';

/**
 * Top-level for extension
 */
const extension: JupyterLabPlugin<void> = {
  id: '@jupyterlab/jupyterlab-modelview',
  requires: [ICommandPalette, INotebookTracker],
  activate: (
    app: JupyterLab,
    palette: ICommandPalette,
    tracker: INotebookTracker
  ): void => {
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

    /** Add command to open machine learning panel */
    const command: string = 'modelview:open-new';
    app.commands.addCommand(command, {
      label: 'New Model Viewer',
      execute: () => {
        let kernel: Kernel.IKernel = tracker.currentWidget.context.session
          .kernel! as Kernel.IKernel;
        const widget = new ModelView(kernel, null, null);
        widget.id = 'modelviewer';
        widget.title.label = 'Model Viewer';
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

/**
 * Widget for the machine learning panel
 */
class ModelView extends ReactElementWidget {
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
  totalProgress: number;
  currentProgress: number;
  loss: number;
  accuracy: number;
  lossData: LossData[];
  accuracyData: AccuracyData[];
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

/**
 * React component for the machine learning panel
 */
class ModelViewPanel extends React.Component<
  ModelViewPanelProps,
  ModelViewPanelState
> {
  state = {
    totalProgress: 0,
    currentProgress: 0,
    loss: 0,
    accuracy: 0,
    lossData: [],
    accuracyData: []
  };

  constructor(props: any) {
    super(props);
    /** Register a custom comm with the backend package */
    this.props.kernel.registerCommTarget('batchData', (comm, msg) => {
      comm.onMsg = msg => {
        // console.log(msg.content.data);
        this.setState(prevState => ({
          totalProgress: Number(
            parseFloat(msg.content.data['totalProgress'].toString()).toFixed(2)
          ),
          currentProgress: Number(
            parseFloat(msg.content.data['currentProgress'].toString()).toFixed(
              2
            )
          ),
          loss: Number(
            parseFloat(msg.content.data['loss'].toString()).toFixed(4)
          ),
          accuracy: Number(
            parseFloat(msg.content.data['accuracy'].toString()).toFixed(4)
          ),
          lossData: [...prevState.lossData, msg.content.data['lossData']],
          accuracyData: [
            ...prevState.accuracyData,
            msg.content.data['accuracyData']
          ]
        }));
      };
    });
    this.props.kernel.registerCommTarget('totalData', (comm, msg) => {
      comm.onMsg = msg => {
        // console.log(msg.content.data);
        this.setState({
          loss: Number(
            parseFloat(msg.content.data['totalLoss'].toString()).toFixed(2)
          ),
          accuracy: Number(
            parseFloat(msg.content.data['totalAccuracy'].toString()).toFixed(2)
          )
        });
      };
    });
  }

  render() {
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
      <div>
        <div>{'Total: ' + this.state.totalProgress + '%'}</div>
        <div>{'Current: ' + this.state.currentProgress + '%'}</div>
        <div>{'Loss: ' + this.state.loss}</div>
        <div>{'Accuracy: ' + this.state.accuracy}</div>

        <div id="lossGraph" />
        <div id="accuracyGraph" />
      </div>
    );
  }
}

export default extension;
