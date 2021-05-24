
const template = document.createElement('template');
template.innerHTML = `
  <style>
    #wrapper {
      width: 400px;
    }
    #slider {
      width: 150px;
    }
    #label {
      /*width: 100px;
      text-align: right;*/
    }
  </style>
  <div id="wrapper">
    <label id="description-label"><slot /></label>
    <input type="range" min="1" max="100" value="50" id="slider">
    <label id="val-label" for="slider">
    </label>
  </div>
`;

class DevSlider extends HTMLElement {
  constructor() {
    super();
    
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    
    this.slider = this.shadowRoot.querySelector('#slider');
    this.valLabel = this.shadowRoot.querySelector('#val-label');
    
    this.slider.min = this.getAttribute('min');
    this.slider.max = this.getAttribute('max');
    this.slider.value = this.getAttribute('default');
    this.valLabel.innerText = this.getAttribute('default');
  }
  
  updateInput() {
    let value = this.shadowRoot.querySelector('#slider').value;
    this.shadowRoot.querySelector('#val-label').innerText = value;
  }
  
  connectedCallback() {
    this.shadowRoot.querySelector('#slider').addEventListener('input', () => this.updateInput());
  }

  disconnectedCallback() {
    this.shadowRoot.querySelector('#slider').removeEventListener();
  }
}

window.customElements.define('dev-slider', DevSlider);