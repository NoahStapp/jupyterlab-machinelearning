import * as React from 'react';
import { 
    ProgressBarStyle, 
    ButtonStyle,
    ProgessBarContainerStyle, 
    ProgressContainerStyle, 
    StatusStyle,
    AccuracyStyle
} from '../componentStyle/StatusStyle'

export interface IStatusProps {
    overallComplete: number;
    epochComplete: number;
    modelAccuracy: number;
    modelLoss:number;
    epoch: number;
    done: boolean;
}

export class Status extends React.Component<IStatusProps, {}> {
    constructor(props: any) {
        super(props)
    }

    render() {
        return (
            <div className={StatusStyle}>
                <div className = {ProgressContainerStyle}>
                    <ProgressBar 
                        statName={"Overall"}
                        stat={this.props.overallComplete}
                    />
                    <ProgressBar
                        statName={"Epoch " + this.props.epoch}
                        stat={this.props.epochComplete}
                    />
                </div>
                <Accuracy 
                    modelAccuracy={this.props.modelAccuracy}
                    modelLoss={this.props.modelLoss}
                />
                <button 
                    className={ButtonStyle}
                />
            </div>
        )
    }
}

export interface IProgressBarProps {
    statName: string;
    stat: number;
}

export class ProgressBar extends React.Component<IProgressBarProps, {}> {
    constructor(props: any) {
        super(props)
    }

    render() {
        return(
            <div className={ProgessBarContainerStyle}>
                <div className='label'>{this.props.statName}</div>
                <div className={ProgressBarStyle(this.props.stat)}>
                    <div
                        className='progress'
                    />
                </div>
            </div>
        )
    }
}

export interface IAccuracyProps {
    modelAccuracy: number;
    modelLoss: number;
}

export class Accuracy extends React.Component<IAccuracyProps, {}> {
    constructor(props: any) {
        super(props)
    }

    render() {
        return(
            <div className={AccuracyStyle}>
                <div className='contain contain-first'>
                    <div className='stat'>{
                        !isNaN(this.props.modelAccuracy)
                        ? Math.round(this.props.modelAccuracy*100)
                        : 'NaN '
                    }</div>                    
                    {!isNaN(this.props.modelAccuracy) ? <div>% acc.</div> : <div> acc.</div>}
                </div>
                <div className='contain'>
                    {!isNaN(this.props.modelLoss) &&
                        <div className='stat'>{
                            Math.round(this.props.modelLoss*100)
                        }</div>
                    }
                    {!isNaN(this.props.modelLoss) ? <div>% loss</div> : <div>NaN loss</div>}
                </div>
            </div>
        )
    }
}