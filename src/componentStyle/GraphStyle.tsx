import { style } from 'typestyle';

export const GraphContainerStyle = style({
  width: '50%',
  paddingTop: '35px'
});

export const LabelStyle = style({
  display: 'flex',
  width: '100%',
  boxSizing: 'border-box',
  paddingLeft: '10%',

  $nest: {
    '& .stat': {
      width: '50px',
      lineHeight: '20px',
      textAlign: 'right'
    },

    '& .current-avg': {
      lineHeight: '20px',
      paddingLeft: '12px'
    }
  }
});

export const BigLabelStyle = style({
  fontSize: 'var(--jp-content-font-size2)'
});

export const GraphStyle = style({
  width: '80%',
  margin: '15px 10%',
  height: '400px',
});
