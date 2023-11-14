import './algCode.jsx'
import './alg.scss'

const Art = () =>{
    return(
        <div>
            <div id="step1" className="inputoutput center hidden">
                <img className="centerImage" id="imageSrc" alt="No Image" />
            </div>
            <div id="step2" className="inputoutput center hidden">
                <div className="caption">Обрезаем картинку и переводим в чб формат:</div>
                <canvas className="centerCanvasMedium" id="canvasOutput" ></canvas>
            </div>
            <div id="step3" className="inputoutput center hidden">
                <div className="caption">Результат:</div>
                <div id="drawStatus"></div>
                <canvas className="centerCanvasLarge" id="canvasOutput2" ></canvas>
            </div>
        </div>
    )
}
export default Art;