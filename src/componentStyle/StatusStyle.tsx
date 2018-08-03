import { style } from 'typestyle';

export const StatusStyle = style({

  height: '24px',
  display: 'flex',
  fontSize: 'var(--jp-content-font-size0)',
  color: '#EEEEEE'
})

export const ProgressContainerStyle = style({
  display: 'block'
});

export const ProgessBarContainerStyle = style({
  display: 'flex',
  fontSize: 'var(--jp-content-font-size0)',

  $nest: {
    '& .label': {
      width: '50px',
      fontSize: '9px'
    }
  }
});

export function ProgressBarStyle(stat: number) {

  if (stat < 100) {
    return (
      style({
        width: '40px',
        backgroundColor: 'var(--jp-content-font-color0)',
        borderRadius: '3px',
        height: '6px',
        marginTop: '4px',

        $nest: {
          '& .progress': {
            width:stat*0.4,
            backgroundColor: 'var(--jp-brand-color2)',
            height: '6px',
            borderRadius: '3px 0px 0px 3px'
          }
        }
      })
    )
  } else {
    return (
      style({
        width: '40px',
        backgroundColor: 'var(--jp-content-font-color0)',
        borderRadius: '3px',
        height: '6px',
        marginTop: '4px',

        $nest: {
          '& .progress': {
            width:stat*0.4,
            backgroundColor: 'var(--jp-brand-color2)',
            height: '6px',
            borderRadius: '3px'
          }
        }
      })
    )
  }
}

export const AccuracyStyle = style({
  lineHeight: '26px',
  padding: '0 15px',
  display: 'flex',

  $nest: {
    '& .contain-first': {
      paddingRight: '15px'
    },

    '& .acc-loss': {
      paddingLeft: '4px'
    },

    '& .contain': {
      display: 'flex'
    },

    '& .stat': {
      width: '30px',
      textAlign: 'right'
    },

    '& .up': {
      backgroundImage: 'var(--jp-icon-uparrow)',
      backgroundRepeat: 'no-repeat',
    },

    '& .down': {
      backgroundImage: 'var(--jp-icon-uparrow)',
      backgroundRepeat: 'no-repeat',
      backgroundPositionX: '-2px',
      backgroundPositionY: '4px',
      backgroundSize: '15px',
      width: '16px',
      transform: 'rotate(180deg)',
    }
  }
});

export const ButtonStyle = style({
  backgroundImage: 'var(--jp-icon-machinelearning)',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '16px',
  backgroundPositionY: '4px',
  backgroundColor: '#757575',
  border: 'none',
  outline: 'none'
});
