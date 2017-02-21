// suggest.js
// email autocomplete effects

(function(global) {
  'use strict';
  const Assist = {
    html(el, str) {
      if (1 in arguments) {
        return el.innerHTML = str;
      }
      return el.innerHTML;
    },
    attr(el, key, value) {
      if (value === undefined) {
        return el.getAttribute(key);
      }
      return el.setAttribute(key, value);
    },
    open(el) {
      el && el.classList.remove('hide');
    },
    close(el) {
      el && el.classList.add('hide');
    },
    ellipsis(str, max = 15) {
      return str.length > max ? str.substring(0, max) + '...' : str;
    },
    bind(context, name) {
      return function() {
        return context[name].apply(context, arguments);
      }
    }
  }

  function Suggest(el, opts) {
    this.el = el;
    opts || (opts = {});
    this.opts = opts;
    this.input = this.el.querySelector(this.opts.input);
    this.result = this.el.querySelector(this.opts.result);
    var bundle = this.input.getAttribute('data-bundle');
    this.list = this.opts.list || (bundle && JSON.parse(bundle));
    this.method = Object.create(Assist);
    this.rendered = false;
    this.listener();
  }
  Suggest.prototype.search = function(e) {
    var el = this.input,
      val = el.value;
    if (!val.length) {
      this.method.close(this.result);
      this.method.html(this.result, '');
    } else {
      this.render(val);
    }
  };
  Suggest.prototype.selectUp = function() {
    var result = this.result,
      item = result.querySelector('.selected'),
      el = this.input
    if (!item || item === result.firstChild) {
      result.firstChild.classList.remove('selected');
      result.lastChild.classList.add('selected');
      el.value = this.method.attr(result.lastChild, 'data-value');
    } else {
      item.classList.remove('selected');
      item = item.previousElementSibling;
      item.classList.add('selected');
      el.value = this.method.attr(item, 'data-value');
    }
  };
  Suggest.prototype.selectDown = function() {
    var result = this.result,
      el = this.input,
      item = result.querySelector('.selected')
    if (!item || item === result.lastChild) {
      result.lastChild.classList.remove('selected');
      result.firstChild.classList.add('selected');
      el.value = this.method.attr(result.firstChild, 'data-value');
    } else {
      item.classList.remove('selected');
      item = item.nextElementSibling;
      item.classList.add('selected');
      el.value = this.method.attr(item, 'data-value');
    }
  };
  Suggest.prototype.clickListen = function(e) {
    var result = this.result,
      el = this.input,
      target = e.target,
      item = result.querySelector('.selected')
    if (!this.rendered) {
      return false;
    }
    if (el !== (target || document.activeElement)) {
      this.method.close(result);
    } else {
      this.method.open(result);
    }
    if (result.contains(target)) {
      el.value = this.method.attr(target, 'data-value');
      item && item.classList.remove('selected');
    }
  };
  Suggest.prototype.resizeListen = function() {
    var result = this.result;
    this.method.close(result);
  };
  Suggest.prototype.keydownListen = function(e) {
    var code = e.keyCode,
      el = this.input,
      selected = this.result.querySelector('.selected');
    e.stopPropagation();
    switch (code) {
      case 9:
        this.method.close(this.result);
        break;
      case 13:
        this.method.close(this.result);
        selected && selected.classList.remove('selected');
        el.blur();
        break;
      default:
    }
  };
  Suggest.prototype.keyupListen = function(e) {
    var code = e.keyCode,
      el = this.el
    e.stopPropagation();
    e.preventDefault();
    switch (code) {
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
  Suggest.prototype.htmlStringHandle = function(o) {
    var html = '',
      method = this.method,
      match = /^[a-zA-Z\d_]+?$/
    if (~~o.at && match.test(o.atBefore)) {
      [].forEach.call(this.list.sort(), function(el) {
        if (!el.indexOf(o.atAfter)) {
          html += '<li data-value="' + o.atBefore + el + '">' + method.ellipsis(o.atBefore) + el + '<\/li>';
        }
      });
      method.open(this.result);
      method.html(this.result, html);
      this.rendered = true;
    } else {
      method.close(this.result);
      method.html(this.result, '');
      this.rendered = false;
    }
  };
  Suggest.prototype.render = function(val) {
    var at = val.indexOf('@'),
      atBefore = val.substring(0, at),
      atAfter = val.substring(at);
    this.htmlStringHandle({
      at: at,
      atBefore: atBefore,
      atAfter: atAfter
    });
  };
  Suggest.prototype.bind = function(method, context) {
    if (typeof this[method] === 'function') {
      return this[method].bind(context) || this.method.bind(context, method)
    }
  };
  
  Suggest.prototype.listener = function() {
    var el = this.input,
      body = document.body;
    el.addEventListener('keydown', this.bind('keydownListen', this), false);
    el.addEventListener('keyup', this.bind('keyupListen', this), false);
    body.addEventListener('click', this.bind('clickListen', this), false);
    body.addEventListener('touchstart', this.bind('clickListen', this), false);
    window.addEventListener('resize', this.bind('resizeListen', this), false);
  };
  
  global.Suggest = Suggest;
  
})(window);
