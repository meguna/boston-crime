import _ from 'lodash';
import { initCanvas } from './canvas.js';

function component() {
    const element = document.createElement('div');
    element.setAttribute('id','main');
    return element;
}
document.body.appendChild(component());

initCanvas();
