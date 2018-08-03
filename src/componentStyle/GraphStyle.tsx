import { style } from 'typestyle';

export const GraphContainerStyle = style({
  paddingTop: '35px',
  width: '50%',
});

export const LabelStyle = style({
  width: '100%',
  boxSizing: 'border-box',
  paddingLeft: '10%',

  $nest: {
    '& .stat-label': {
      display: 'flex'
    },

    '& .stat': {
      width: '50px',
      lineHeight: '20px',
      textAlign: 'right'
    },

    '& .final-avg': {
      lineHeight: '20px',
    }
  }
});

export const BigLabelStyle = style({
  fontSize: 'var(--jp-content-font-size2)'
});

export const GraphStyle = style({
  width: '80%',
  height: '400px',
});
