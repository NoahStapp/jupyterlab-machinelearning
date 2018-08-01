# jupyterlab-machinelearning

A JupyterLab extension for machine learning tools

## Prerequisites

- JupyterLab
- Keras
- Tensorflow

## Development

### Contributing

If you would like to contribute to the project, please read our [contributor documentation](https://github.com/jupyterlab/jupyterlab/blob/master/CONTRIBUTING.md).

JupyterLab follows the official [Jupyter Code of Conduct](https://github.com/jupyter/governance/blob/master/conduct/code_of_conduct.md).

### Install

Requires node 4+ and npm 4+

```bash
# Clone the repo to your local environment
git clone https://github.com/NoahStapp/jupyterlab-machinelearning.git
cd jupyterlab-machinelearning
# Install dependencies
npm install # or yarn
# Build Typescript source
npm run build # or yarn build
# Link your development version of the extension with JupyterLab
jupyter labextension link .
# Rebuild Typescript source after making changes
npm run build # or yarn build
```
To rebuild the package and the JupyterLab app:

```bash
npm run build
jupyter lab build
```

