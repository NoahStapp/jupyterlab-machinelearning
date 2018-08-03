import { JupyterLab, JupyterLabPlugin } from '@jupyterlab/application';
import { 
  ICommandPalette,
  Toolbar,
  ToolbarButton 
} from '@jupyterlab/apputils';
import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';
import { Kernel } from '@jupyterlab/services';
import { IStatusBar } from '@jupyterlab/statusbar';
import { IconClass, WidgetStyle } from './componentStyle/ModelViewerStyle'
import { ModelViewWidget } from './ModelViewWidget'
import { StatusItemWidget } from './StatusItemWidget'
import '../style/urls.css'

/**
 * An extension to further explore machine learning models
 * with JupyterLab
 **/
const extension: JupyterLabPlugin<void> = {
  id: '@jupyterlab/jupyterlab-machinelearning',
  requires: [ICommandPalette, INotebookTracker, IStatusBar],
  activate: (
    app: JupyterLab,
    palette: ICommandPalette,
    tracker: INotebookTracker,
    statusBar: IStatusBar
  ): void => {
    console.log('test9')

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
          tracker.currentWidget.context.addSibling(widget, {mode: 'split-right'})
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
        let button: ToolbarButton = Toolbar.createFromCommand(
          app.commands,
          command
        );
        widget.toolbar.insertItem(9, app.commands.label(command), button);
      }
    }

    /** Refresh command, used to update isEnabled when kernel status is changed */
    function refreshNewCommand() {
      app.commands.notifyCommandChanged(command);
    }

    /** Add status bar item **/
    function addStatus() {
      console.log('adding to status bar')

      let currentWidget: NotebookPanel = tracker.currentWidget
      //.context.session.kernel as Kernel.IKernel;

      statusBar.registerStatusItem(
        '@jupyterlab/machinelearning',
        new StatusItemWidget(currentWidget, hasKernel(), null, null, app.commands),
        {align: 'middle'}
      )
    }

    /** 
     * Deals with updating isEnabled status of command 
     * as well as placing button when currentWidget is a notebook panel
     *
     * Code credit to @vidartf/jupyterlab-kernelspy
     * */
    let widget: NotebookPanel | null = tracker.currentWidget;
    if (widget) {
      widget.context.session.kernelChanged.connect(refreshNewCommand);
    }

    tracker.currentChanged.connect((tracker) => {
      console.log('current changed')
      addButton()
      if (widget) {
        console.log('disconnecting')
        widget.context.session.kernelChanged.disconnect(refreshNewCommand)
        widget.context.session.kernelChanged.disconnect(addStatus)
      }
      widget = tracker.currentWidget;
      if (widget) {
        console.log('connecting')
        widget.context.session.kernelChanged.connect(refreshNewCommand);
        widget.context.session.kernelChanged.connect(addStatus);
      }
    });
  },
  autoStart: true
};

export default extension;
