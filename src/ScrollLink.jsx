/**
 * Created by jljsj on 16/1/13.
 */
import React, { createElement } from 'react';
import ReactDOM from 'react-dom';
import easingTypes from 'tween-functions';
import requestAnimationFrame from 'raf';
import EventListener from './EventDispatcher';
import { transformArguments, currentScrollTop } from './util';
import mapped from './Mapped';

function noop() {
}


class ScrollLink extends React.Component {
  constructor() {
    super(...arguments);
    this.rafID = -1;
    this.state = {
      active: false,
    };
  }

  componentDidMount() {
    this.dom = ReactDOM.findDOMNode(this);
    const date = Date.now();
    const length = EventListener._listeners.scroll ? EventListener._listeners.scroll.length : 0;
    this.eventType = `scroll.scrollAnchorEvent${date}${length}`;
    EventListener.addEventListener(this.eventType, this.scrollEventListener);
    // 第一次进入；
    setTimeout(() => {
      this.scrollEventListener();
    });
  }

  componentWillUnmount() {
    EventListener.removeEventListener(this.eventType, this.scrollEventListener);
    this.cancelRequestAnimationFrame();
  }

  onClick = (e) => {
    e.preventDefault();
    const docRect = document.documentElement.getBoundingClientRect();
    const elementDom = mapped.get(this.props.location);
    const elementRect = elementDom.getBoundingClientRect();
    this.scrollTop = currentScrollTop();
    const toTop = Math.round(elementRect.top) - Math.round(docRect.top) + this.props.offsetTop;
    this.toTop = this.props.toShowHeight ?
    toTop - transformArguments(this.props.showHeightActive)[0] : toTop;
    this.initTime = Date.now();
    this.rafID = requestAnimationFrame(this.raf);
  }

  raf = () => {
    if (this.rafID === -1) {
      return;
    }
    const duration = this.props.duration;
    const now = Date.now();
    const progressTime = now - this.initTime > duration ? duration : now - this.initTime;
    const easeValue = easingTypes[this.props.ease](progressTime, this.scrollTop,
      this.toTop, duration);
    window.scrollTo(window.scrollX, easeValue);
    if (progressTime === duration) {
      this.cancelRequestAnimationFrame();
    } else {
      this.rafID = requestAnimationFrame(this.raf);
    }
  }

  cancelRequestAnimationFrame = () => {
    requestAnimationFrame.cancel(this.rafID);
    this.rafID = -1;
  }

  scrollEventListener = () => {
    const docRect = document.documentElement.getBoundingClientRect();
    const clientHeight = window.innerHeight ||
      document.documentElement.clientHeight || document.body.clientHeight;
    const elementDom = mapped.get(this.props.location);
    if (!elementDom) {
      throw new Error(`There is no location(${this.props.location}) in the element.`);
    }
    const elementRect = elementDom.getBoundingClientRect();
    const elementClientHeight = elementDom.clientHeight;
    const scrollTop = currentScrollTop();
    const top = Math.round(docRect.top - elementRect.top + scrollTop);
    const showHeightActive = transformArguments(this.props.showHeightActive);
    const startShowHeight = showHeightActive[0].toString().indexOf('%') >= 0 ?
    parseFloat(showHeightActive[0]) / 100 * clientHeight :
      parseFloat(showHeightActive[0]);
    const endShowHeight = showHeightActive[1].toString().indexOf('%') >= 0 ?
    parseFloat(showHeightActive[1]) / 100 * clientHeight :
      parseFloat(showHeightActive[1]);
    if (top >= -startShowHeight && top < elementClientHeight - endShowHeight) {
      if (!this.props.onFocus.only) {
        const obj = {
          target: this.dom,
          location: this.props.location,
        };
        this.props.onFocus.call(this, obj);
        this.props.onFocus.only = true;
      }
      if (!this.state.active) {
        this.setState({
          active: true,
        });
      }
    } else {
      if (this.props.onFocus.only) {
        const obj = {
          target: this.dom,
          location: this.props.location,
        };
        this.props.onBlur.call(this, obj);
      }
      this.props.onFocus.only = false;
      if (this.state.active) {
        this.setState({
          active: false,
        });
      }
    }
  }

  render() {
    const active = this.state.active ? this.props.active : '';
    const onClick = this.props.onClick;
    const props = {
      ...this.props,
      onClick: (e) => {
        onClick(e);
        this.onClick(e);
      },
    };
    [
      'component',
      'duration',
      'active',
      'location',
      'showHeightActive',
      'ease',
      'toShowHeight',
      'offsetTop',
    ].forEach(key => delete props[key]);
    const reg = new RegExp(active, 'ig');
    const className = props.className || '';
    props.className = className.indexOf(active) === -1 ?
      `${className} ${active}`.trim() : className.replace(reg, '').trim();
    return createElement(this.props.component, props);
  }
}

ScrollLink.propTypes = {
  component: React.PropTypes.string,
  children: React.PropTypes.any,
  className: React.PropTypes.string,
  style: React.PropTypes.any,
  offsetTop: React.PropTypes.number,
  duration: React.PropTypes.number,
  active: React.PropTypes.string,
  location: React.PropTypes.string,
  showHeightActive: React.PropTypes.any,
  toShowHeight: React.PropTypes.bool,
  ease: React.PropTypes.string,
  onClick: React.PropTypes.func,
  onFocus: React.PropTypes.func,
  onBlur: React.PropTypes.func,
};

ScrollLink.defaultProps = {
  component: 'div',
  offsetTop: 0,
  duration: 450,
  active: 'active',
  showHeightActive: '50%',
  ease: 'easeInOutQuad',
  onClick: noop,
  onFocus: noop,
  onBlur: noop,
};


export default ScrollLink;
