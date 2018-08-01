import { style } from 'typestyle'

export const WidgetStyle = style({
    backgroundColor: 'var(--jp-layout-color0)'
})

export const ModelViewerStyle = style({
    display: 'flex',
    flexWrap: 'wrap',
    fontFamily: 'var(--jp-content-font-family)',
    fontSize: 'var(--jp-content-font-size1)',
    color: 'var(--jp-content-font-color0)',

    $nest: {
        '& .before': {
            display: 'block',
            width: '100%',
            height: 'var(--jp-toolbar-micro-height)',
            background: 'var(--jp-toolbar-background)',
            borderBottom: '1px solid var(--jp-toolbar-border-color)',
            boxShadow: 'var(--jp-toolbar-box-shadow)',
            zIndex: 1,
        }
    }
})

export const GraphsStyle = style({
    display: 'flex',
    width: '100%'
})

export const StatsContainerStyle = style({
    width: '50%',
    display: 'grid',
    boxSizing: 'border-box',
    padding: '15px 5%'
})

export const StatStyle = style({
    display: 'inline-flex',
    margin: '5px 5%',

    $nest: {
        '& span': {
            width: '50%'
        }
    }
})

export const RunTimeStyle = style({
    display: 'block',
    fontSize: 'var(--jp-content-font-size2)',
    textAlign: 'center',
    paddingBottom: '5px'
})

export const IconClass = style({
    backgroundImage: 'var(--jp-icon-datascience)',
    backgroundRepeat: 'no-repeat'
})