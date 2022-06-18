import { templates } from '../settings.js';
// eslint-disable-next-line no-unused-vars
import utils from '../utils.js';

// eslint-disable-next-line no-unused-vars
class Home{
  constructor(element) {
    const thisHome = this;
    // eslint-disable-next-line no-undef
    thisHome.render(element);
    thisHome.initWidgets();

  }

  render(element){
    const thisHome = this;
    const generatedHTML = templates.homeWidget();
    thisHome.dom = {};
    thisHome.dom.wrapper = element;
    console.log(thisHome.dom.wrapper);
    // element.innerHTML to sie rowna moj wygenerowany template, wiec template mam zapisany w dom.wrapper
    thisHome.dom.wrapper.innerHTML = generatedHTML;
  }

  initWidgets(){
    // eslint-disable-next-line no-unused-vars
    const thisHome = this;

    const elem = document.querySelector('.main-carousel');
    // eslint-disable-next-line no-unused-vars
    // eslint-disable-next-line no-undef
    thisHome.flkty = new Flickity( elem, {
      // options
      cellAlign: 'left',
      contain: true,
      autoPlay: true,
      prevNextButtons: false,
      freeScroll: true,
      wrapAround: true,
    });


  }
}

export default Home;