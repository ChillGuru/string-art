import './algCode.jsx'
import './alg.scss'

const Intro = () =>{
    return(
        <div class="jumbotron" style="padding-bottom: 20px !important;">
        <div style="float: left; position: absolute; top: 20px;">
          
        </div>
        <h1>Генератор Вышивания нитью</h1>
        <div style="float: right; margin-top: -40px;">
            Уже есть сгенерированные шаги?
            <button class="btn btn-primary" onclick="onHasSteps();">Нажмите сюда</button>
        </div>
        <h2 id="status">Загрузка..</h2><br/>

        <span>Загрузите картинку, чтобы начать генерацию <br/>
        </span>
        <br/>
        <div><h5>Выберите значения:</h5></div>
        <div class="row">
            <div class="col">
                <div class="form-group">
                    <label for="numberOfPins">Кол-во гвоздей</label>
                    <input type="text" class="form-control" id="numberOfPins" disabled/>
                </div>
            </div>
            <div class="col">
                <div class="form-group">
                    <label for="numberOfLines">Кол-во линий</label>
                    <input type="text" class="form-control" id="numberOfLines"/>
                </div>
            </div>
            <div class="col">
                <div class="form-group">
                    <label for="lineWeight">Толщина линий</label>
                    <input type="text" class="form-control" id="lineWeight"/>
                </div>
            </div>
        </div>
        <label class="btn btn-primary btn-file">
            Загрузите картинку здесь, чтобы начать  <input type="file" id="fileInput" style="display: none;"/>
        </label>
    </div>
    )
}

export default Intro;