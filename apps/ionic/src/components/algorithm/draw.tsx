import './algCode'
import './alg.scss'
import { FC } from 'react';

const Draw: FC = () => {
    return (
        <div>
            <div id="incrementalDrawing" className="inputoutput center hidden">
                <div className="caption">Вывод:</div>
                <span id="incrementalCurrentStep"></span>
                <div id="drawStatus"></div>
                <canvas className="centerCanvasLarge" id="canvasOutput3"></canvas>
                <div style={{ height: '30px' }}>
                    <button style={{ float: 'left' }} onClick={lastStep}>Предыдущий шаг</button>
                    <button style={{ float: 'right' }} onClick={nextStep}>Следующий шаг</button>
                </div>
            </div>
        </div>
    );
}

export default Draw;