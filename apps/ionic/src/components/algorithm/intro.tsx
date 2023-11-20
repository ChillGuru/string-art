import './algCode'
import './alg.scss'

import React, { FC } from 'react';

const Intro: FC = () => {
    return (
        <div className="jumbotron" style={{ paddingBottom: '20px !important' }}>
            <div style={{ float: 'left', position: 'absolute', top: '20px' }}></div>
            <h1>Генератор Вышивания нитью</h1>
            <div style={{ float: 'right', marginTop: '-40px' }}>
                Уже есть сгенерированные шаги?
                <button className="btn btn-primary" onClick={onHasSteps} >Нажмите сюда</button>
            </div>
            <h2 id="status">Загрузка..</h2><br />

            <span>Загрузите картинку, чтобы начать генерацию <br />
            </span>
            <br />
            <div><h5>Выберите значения:</h5></div>
            <div className="row">
                <div className="col">
                    <div className="form-group">
                        <label htmlFor="numberOfPins">Кол-во гвоздей</label>
                        <input type="text" className="form-control" id="numberOfPins" disabled />
                    </div>
                </div>
                <div className="col">
                    <div className="form-group">
                        <label htmlFor="numberOfLines">Кол-во линий</label>
                        <input type="text" className="form-control" id="numberOfLines" />
                    </div>
                </div>
                <div className="col">
                    <div className="form-group">
                        <label htmlFor="lineWeight">Толщина линий</label>
                        <input type="text" className="form-control" id="lineWeight" />
                    </div>
                </div>
            </div>
            <label className="btn btn-primary btn-file">
                Загрузите картинку здесь, чтобы начать  <input type="file" id="fileInput" style={{ display: 'none' }} />
            </label>
        </div>
    );
}

export default Intro;