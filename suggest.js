// suggest.js
// email autocomplete effects
// not use MVC framework...

(function(global) {

  'use strict';

  function Method() {}

  Method.prototype = {

    constructor: Method,

    html: function(el, str) {
      if(1 in arguments) {
        return el.innerHTML = str;
      }
      return el.innerHTML;
    },

    attr: function(el, key, value) {
      if(value === undefined) {
        return el.getAttribute(key);
      }
      return el.setAttribute(key, value);
    },

    open: function(el) {
      el && el.classList.remove('hide');
    },

    close: function(el) {
      el && el.classList.add('hide');
    },

    ellipsis: function(str, max) {
      max = max || 15;
      return str.length > max ? str.substring(0, max) + '...' : str;
    }
  }

  function Suggest(el, opts) {
    this.el = el;
    opts || (opts = {});
    this.opts = opts;
    this.input = this.el.querySelector(this.opts.input);
    this.result = this.el.querySelector(this.opts.result);
    var bundle = this.input.getAttribute('data-bundle');
    this.opts.list = this.opts.list || (bundle && JSON.parse(bundle));
    this.method = new Method();
    this.rendered = false;
  }

  Suggest.prototype.search = function(e) {
    var el = this.input;
    var val = el.value;
    if(!val.length) {
      this.method.close(this.result);
      this.method.html(this.result, '');
    }
    else {
      this.render(val);
    }
  };

  Suggest.prototype.selectUp = function() {
    var result = this.result;
    var item = result.querySelector('.selected');
    var el = this.input;
    if(!item || item === result.firstChild) {
      result.firstChild.classList.remove('selected');
      result.lastChild.classList.add('selected');
      el.value = this.method.attr(result.lastChild, 'data-value');
    }
    else {
      item.classList.remove('selected');
      item = item.previousElementSibling;
      item.classList.add('selected');
      el.value = this.method.attr(item, 'data-value');
    }
  };

  Suggest.prototype.selectDown = function() {
    var result = this.result;
    var el = this.input;
    var item = result.querySelector('.selected');
    if(!item || item === result.lastChild) {
      result.lastChild.classList.remove('selected');
      result.firstChild.classList.add('selected');
      el.value = this.method.attr(result.firstChild, 'data-value');
    }
    else {
      item.classList.remove('selected');
      item = item.nextElementSibling;
      item.classList.add('selected');
      el.value = this.method.attr(item, 'data-value');
    }

  };

  Suggest.prototype.clickListen = function(e) {
    var result = this.result;
    var el = this.input;
    var target = e.target;
    var item = result.querySelector('.selected');
    if(this.rendered) {
      if(el !== document.activeElement) {
        this.method.close(result);
      }
      else {
        this.method.open(result);
      }
      if(result.contains(target)) {
        el.value = this.method.attr(target, 'data-value');
        item && item.classList.remove('selected');
      }
    }
  };

  Suggest.prototype.resizeListen = function() {
    var result = this.result;
    this.method.close(result);
  };

  Suggest.prototype.keydownListen = function(e) {
    var code = e.keyCode;
    var el = this.input;
    e.stopPropagation();
    switch(code) {
      case 9:
        this.method.close(this.result);
        break;
    }
  };

  Suggest.prototype.keyupListen = function(e) {
    var code = e.keyCode;
    e.stopPropagation();
    e.preventDefault();
    switch(code) {
      case 13:
      case 27:
        this.method.close(this.result);
        el.blur();
        break;
      case 38:
        this.selectUp();
        break;
      case 40:
        this.selectDown();
        break;
      default:
        this.search();
    }
  };

  Suggest.prototype.render = function(val) {
    var at = val.indexOf('@');
    var method = this.method;
    var atBefore = val.substring(0, at);
    var atAfter = val.substring(at);
    var html = '';
    if(~~at && /^[a-zA-Z\d-_]+?$/.test(atBefore)) {
      [].forEach.call(this.opts.list, function(el) {
        if(!el.indexOf(atAfter)) {
          html += '<li data-value="' + atBefore + el + '">' + method.ellipsis(atBefore) + el + '<\/li>';
        }
      });
      this.method.open(this.result);
      this.method.html(this.result, html);
      this.rendered = true;
    }
    else {
      this.method.close(this.result);
      this.method.html(this.result, '');
      this.rendered = false;
    }
  };

  Suggest.prototype.listener = function() {
    var el = this.input;
    el.addEventListener('keydown', this.keydownListen.bind(this), false);
    el.addEventListener('keyup', this.keyupListen.bind(this), false);
    document.body.addEventListener('click', this.clickListen.bind(this), false);
    window.addEventListener('resize', this.resizeListen.bind(this), false);
  };

  window.Suggest = Suggest;

})(window);