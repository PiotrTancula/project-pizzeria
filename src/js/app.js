import { settings, select, classNames } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';
import Booking from './components/Booking.js';

const app = {

  initPages: function () {

    const thisApp = this;
    thisApp.pages = document.querySelector(select.containerOf.pages).children;

    thisApp.navLinks = document.querySelectorAll(select.nav.links);


    const idFromHash = window.location.hash.replace('#/', '');
    console.log(idFromHash);

    let pageMatchingHash = thisApp.pages[0].id;

    for (let page of thisApp.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }

    thisApp.activatePage(pageMatchingHash);

    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function (event) {
        const clickedElement = this;
        event.preventDefault();

        // extract id from href attribute
        const id = clickedElement.getAttribute('href').replace('#', '');

        // start thisApp.ctivatePage methof with this exact id

        thisApp.activatePage(id);

        // change URL hash

        window.location.hash = '#/' + id;
      });
    }

  },

  activatePage: function (pageId) {
    const thisApp = this;

    // add the active class to the matching page and remove it from the non matching ones

    for (let page of thisApp.pages){
      // if (page.id == pageId) {
      //   page.classList.add(classNames.page.active);
      // } else {
      //   page.classList.remove(classNames.page.active);
      // }

      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    // add the active class to the matching links and remove it from the non matching ones

    for (let link of thisApp.navLinks){

      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }

  },

  initMenu: function () {
    // const thisApp = this;
    // console.log('thisApp.data : ', thisApp.data);

    // const testProduct = new Product();
    // console.log('testProduct: ', testProduct);

    const thisApp = this;
    // console.log('thisApp.data : ', thisApp.data);


    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      // console.log(productData, thisApp.data.products[productData]);
    }

  },

  initCart: function () {

    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.product.prepareCartProduct());
    });

  },

  initData: function () {
    const thisApp = this;


    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function(parsedResponse) {
        console.log('parsedResponse : ', parsedResponse);

        thisApp.data.products = parsedResponse;

        thisApp.initMenu();
      });



    console.log('thisApp.data : ', JSON.stringify(thisApp.data));
  },

  initBooking: function () {
    const thisApp = this;
    thisApp.bookingContainer = document.querySelector(select.containerOf.booking);

    // eslint-disable-next-line no-unused-vars
    const booking = new Booking(thisApp.bookingContainer);
    console.log('initbooking');
  },

  init: function(){
    const thisApp = this;
    // console.log('*** App starting ***');
    // console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    // console.log('settings:', settings);
    // console.log('templates:', templates);

    thisApp.initPages();

    thisApp.initData();

    thisApp.initCart();

    thisApp.initBooking();

  },
};

app.init();


