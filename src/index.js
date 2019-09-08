import _ from 'lodash';

function component() {
    const element = document.createElement('div');
    element.setAttribute('id','main');
    return element;
}
document.body.appendChild(component());