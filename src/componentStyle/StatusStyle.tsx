import { style } from 'typestyle'

export const StatusStyle = style({
  height: '26px',
  display: 'contents'
})

export const ProgressContainerStyle = style({
  display: 'block'
})

export const ProgessBarContainerStyle = style({
  display: 'flex',
  fontSize: 'var(--jp-content-font-size0)',

  $nest: {
    '& .label': {
      width: '45px'
    }
  }
})

export function ProgressBarStyle(stat: number) {
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
}

export const AccuracyStyle = style({
  lineHeight: '26px',
  padding: '0 15px',
  display: 'flex',

  $nest: {
    '& .contain-first':{
      paddingRight: '15px'
    },
    
    '& .contain': {
      display: 'flex',
    },

    '& .stat': {
      width: '30px',
      textAlign:'right'
    }
  }
})

export const ButtonStyle = style({
  backgroundImage: 'var(--jp-icon-datascience)',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '16px',
  backgroundPositionY: '4px',
  border: 'none',
  outline: 'none'
})