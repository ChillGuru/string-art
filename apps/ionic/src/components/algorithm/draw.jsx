import './algCode.jsx'
import './alg.scss'

const Draw = () =>{
    <div>
        <div id="incrementalDrawing" class="inputoutput center hidden">
            <div class="caption">Вывод:</div>
            <span id="incrementalCurrentStep"></span>
            <div id="drawStatus"></div>
            <canvas class="centerCanvasLarge" id="canvasOutput3" ></canvas>
            <div style="height: 30px;">
                <button style="float: left;" onclick="lastStep();">Предыдущий шаг</button>
                <button style="float: right;" onclick="nextStep();">Следующий шаг</button>
            </div>
        </div>
    </div>
}
export default Draw;