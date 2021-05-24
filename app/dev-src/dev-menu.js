import * as devBtn from './dev-btn.js';
import * as devSlider from './dev-slider.js';

const template = document.createElement('template');
template.innerHTML = `
  <style>
    #wrapper {
      /*float: right;*/
      display: flex;
      flex-direction: column;
      /*justify-content: right;*/
      align-items: flex-end;
      background-color: rgba(0, 0, 0, 0);
      color: white;
      text-shadow: 0 0 5px black;
    }
    #toggle {
      /*float: right;*/
      padding: 15px;
      font-size: 24pt;
      color: white;
      text-shadow: 0 0 5px black;
      background-color: rgba(0, 0, 0, 0.0);
      /*opacity: 0.75;*/
      border: none;
      cursor: pointer;
    }
    #menu {
      display: none;
    }
  </style>
  <div id="wrapper">
    <button id="toggle">
      ☰
    </button>
    <div id="menu">
      <dev-slider identifier="brightness" min="1" max="200" default="100">Brightness</dev-slider>
      <dev-slider identifier="wispcount" min="1" max="1000000" default="10000">Number of wisps</dev-slider>
    </div>
  </div>
`;

class DevMenu extends HTMLElement {
  constructor() {
    super();
    
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    
    this.showMenu = false;
    
    // let's start with it showing
    // TODO: remove this
    this.toggleMenu();
  }
  
  toggleMenu() {
    this.showMenu = !this.showMenu;

    const menu = this.shadowRoot.querySelector('#menu');

    if(this.showMenu) {
      menu.style.display = 'block';
    } else {
      menu.style.display = 'none';
    }
  }
  
  connectedCallback() {
    this.shadowRoot.querySelector('#toggle').addEventListener('click', () => this.toggleMenu());
  }

  disconnectedCallback() {
    this.shadowRoot.querySelector('#toggle').removeEventListener();
  }
}

window.customElements.define('dev-menu', DevMenu);