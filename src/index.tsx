import { JupyterLab, JupyterLabPlugin } from '@jupyterlab/application';
import { ICommandPalette, ReactElementWidget } from '@jupyterlab/apputils';
import { INotebookTracker } from '@jupyterlab/notebook';
import { Kernel } from '@jupyterlab/services';
// import VegaEmbed from 'vega-embed';
// import * as vega from 'vega';
// import { TopLevelSpec as Spec } from 'vega-lite';
import * as React from 'react';

const extension: JupyterLabPlugin<void> = {
  id: '@jupyterlab/jupyterlab-modelview',
  requires: [ICommandPalette, INotebookTracker],
  activate: (
    app: JupyterLab,
    palette: ICommandPalette,
    tracker: INotebookTracker
  ): void => {
    const command: string = 'modelview:open-new';
    app.commands.addCommand(command, {
      label: 'New Model Viewer',
      execute: () => {
        let kernel: Kernel.IKernel = tracker.currentWidget.context.session
          .kernel! as Kernel.IKernel;

        const widget = new ModelView(kernel);
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
  loss: number;
  accuracy: number;
  lossData: LossData[];
  oldLossData: LossData[];
  accuracyData: AccuracyData[];
  oldAccuracyData: AccuracyData[];
}

interface LossData {
  samples: number;
  loss: number;
}

interface AccuracyData {
  samples: number;
  accuracy: number;
}

class ModelViewPanel extends React.Component<
  ModelViewPanelProps,
  ModelViewPanelState
> {
  state = {
    totalProgress: 0,
    currentProgress: 0,
    loss: 0,
    accuracy: 0,
    lossData: null,
    oldLossData: null,
    accuracyData: null,
    oldAccuracyData: null
  };

  constructor(props: any) {
    super(props);
    this.props.kernel.registerCommTarget('test', (comm, msg) => {
      comm.onMsg = msg => {
        console.log(msg.content.data)
        this.setState({
          totalProgress: Number(
            parseFloat(msg.content.data['totalProgress'].toString()).toFixed(
              2
            )
          ),
          currentProgress: Number(
            parseFloat(msg.content.data['currentProgress'].toString()).toFixed(
              2
            )
          ),
          loss: Number(
            parseFloat(msg.content.data['loss'].toString()).toFixed(2)
          ),
          accuracy: Number(
            parseFloat(msg.content.data['accuracy'].toString()).toFixed(2)
          ),
          oldLossData: this.state.lossData,
          lossData: msg.content.data['lossData'],
          oldAccuracyData: this.state.accuracyData,
          accuracyData: msg.content.data['accuracyData']
        });
      };
    });
  }

  render() {
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

    // if (this.state.lossData !== null) {
    //   VegaEmbed('#lossGraph', lossGraphSpec).then(res => {
    //     res.view
    //       .change(
    //         'lossData',
    //         vega
    //           .changeset()
    //           .insert(this.state.lossData)
    //           .remove(this.state.oldLossData)
    //       )
    //       .run();
    //   });
    //   VegaEmbed('#accuracyGraph', lossGraphSpec).then(res => {
    //     res.view
    //       .change(
    //         'accuracyData',
    //         vega
    //           .changeset()
    //           .insert(this.state.accuracyData)
    //           .remove(this.state.oldAccuracyData)
    //       )
    //       .run();
    //   });
    // }

    return (
      <div>
        <div>{'Total: ' + this.state.totalProgress + '%'}</div>
        <div>{'Current: ' + this.state.currentProgress + '%'}</div>
        <div>{'Loss: ' + this.state.loss + '%'}</div>
        <div>{'Accuracy: ' + this.state.accuracy + '%'}</div>

        <div id="lossGraph" />
        <div id="accuracyGraph" />
      </div>
    );
  }
}

export default extension;
