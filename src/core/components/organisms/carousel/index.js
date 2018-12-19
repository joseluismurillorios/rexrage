/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { debounce, transformProperty } from '../../../helpers/helper-util';

import Radios from '../../molecules/radios';

import './styles.scss';

class Carousel extends Component {
  static setStyle(target, styles) {
    Object.keys(styles).forEach((attribute) => {
      target.style[attribute] = styles[attribute];
    });
  }

  constructor(props) {
    super();
    this.config = Object.assign({}, {
      resizeDebounce: 250,
      duration: 200,
      easing: 'ease-out',
      perPage: 1,
      startIndex: 0,
      draggable: true,
      threshold: 40,
      loop: false,
      onInit: () => { },
      onChange: () => { },
    }, props);

    this.state = {
      selected: 0,
    };

    this.evs = [
      'onTouchStart', 'onTouchEnd', 'onTouchMove', 'onMouseDown', 'onMouseUp', 'onMouseLeave', 'onMouseMove', 'onClick',
    ];

    this.evs.forEach((handler) => {
      this[handler] = this[handler].bind(this);
    });

    this.goTo = this.goTo.bind(this);
  }

  componentDidMount() {
    this.config.selector = this.selector;
    this.curSlide = this.config.startIndex;
    this.setState({ selected: this.curSlide });

    this.init();

    this.onResize = debounce(() => {
      this.resize();
      this.slideToCurrent();
    }, this.config.resizeDebounce);

    window.addEventListener('resize', this.onResize);

    if (this.config.draggable) {
      this.pointerDown = false;
      this.drag = {
        startX: 0,
        endX: 0,
        startY: 0,
        letItGo: null,
      };
    }
  }

  componentDidUpdate() {
    this.init();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  onTouchStart(e) {
    e.stopPropagation();
    this.pointerDown = true;
    this.drag.startX = e.touches[0].pageX;
    this.drag.startY = e.touches[0].pageY;
  }

  onTouchEnd(e) {
    e.stopPropagation();
    this.pointerDown = false;
    Carousel.setStyle(this.sliderFrame, {
      webkitTransition: `all ${this.config.duration}ms ${this.config.easing}`,
      transition: `all ${this.config.duration}ms ${this.config.easing}`,
    });
    if (this.drag.endX) {
      this.updateAfterDrag();
    }
    this.clearDrag();
  }

  onTouchMove(e) {
    // e.preventDefault();
    const { pageX, pageY } = e.touches[0];

    if (this.drag.letItGo === null) {
      this.drag.letItGo = Math.abs(this.drag.startY - pageY) < Math.abs(this.drag.startX - pageX);
    }

    if (this.pointerDown && this.drag.letItGo) {
      this.drag.endX = pageX;

      const dragDiff = this.drag.startX - this.drag.endX;
      const translate = (this.curSlide * (this.selectorWidth / this.perPage) + dragDiff);

      Carousel.setStyle(this.sliderFrame, {
        webkitTransition: `all 0ms ${this.config.easing}`,
        transition: `all 0ms ${this.config.easing}`,
        [transformProperty]: `translate3d(${translate * -1}px, 0, 0)`,
      });
    }
  }

  onMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    this.pointerDown = true;
    this.drag.startX = e.pageX;
    this.wasDragged = false;
  }

  onMouseUp(e) {
    e.stopPropagation();
    this.pointerDown = false;
    Carousel.setStyle(this.sliderFrame, {
      cursor: '-webkit-grab',
      webkitTransition: `all ${this.config.duration}ms ${this.config.easing}`,
      transition: `all ${this.config.duration}ms ${this.config.easing}`,
    });
    if (this.drag.endX) {
      // If drag.end has a value > 0, the slider has been dragged
      this.wasDragged = true;
      this.updateAfterDrag();
    }
    this.clearDrag();
  }

  onMouseMove(e) {
    // e.preventDefault();
    if (this.pointerDown) {
      this.drag.endX = e.pageX;
      Carousel.setStyle(this.sliderFrame, {
        cursor: '-webkit-grabbing',
        webkitTransition: `all 0ms ${this.config.easing}`,
        transition: `all 0ms ${this.config.easing}`,
        [transformProperty]: `translate3d(${(this.curSlide * (this.selectorWidth / this.perPage) + (this.drag.startX - this.drag.endX)) * -1}px, 0, 0)`,
      });
    }
  }

  onMouseLeave(e) {
    if (this.pointerDown) {
      this.pointerDown = false;
      this.drag.endX = e.pageX;
      Carousel.setStyle(this.sliderFrame, {
        cursor: '-webkit-grab',
        webkitTransition: `all ${this.config.duration}ms ${this.config.easing}`,
        transition: `all ${this.config.duration}ms ${this.config.easing}`,
      });
      this.updateAfterDrag();
      this.clearDrag();
    }
  }

  onClick(e) {
    const { onClick } = this.props;
    if (!this.wasDragged && onClick) {
      onClick(e);
    }
  }

  setSelectorWidth() {
    this.selectorWidth = this.selector.getBoundingClientRect().width;
  }

  setInnerElements() {
    this.innerElements = [].slice.call(this.sliderFrame.children);
  }

  resolveSlidesNumber() {
    if (typeof this.config.perPage === 'number') {
      this.perPage = this.config.perPage;
    } else if (typeof this.config.perPage === 'object') {
      this.perPage = 1;
      for (const viewport in this.config.perPage) {
        if (window.innerWidth > viewport) {
          this.perPage = this.config.perPage[viewport];
        }
      }
    }
  }

  prev(n = 1, callback) {
    if (this.curSlide === 0 && this.config.loop) {
      this.curSlide = this.innerElements.length - this.perPage;
      this.setState({ selected: this.curSlide });
    } else {
      this.curSlide = Math.max(this.curSlide - Number(n), 0);
      this.setState({ selected: this.curSlide });
    }
    this.slideToCurrent();
    this.config.onChange.call(this);

    if (typeof callback === 'function') {
      callback();
    }
  }

  next(n = 1, callback) {
    if (this.curSlide === this.innerElements.length - this.perPage && this.config.loop) {
      this.curSlide = 0;
      this.setState({ selected: this.curSlide });
    } else {
      this.curSlide = Math.min(this.curSlide + Number(n), this.innerElements.length - this.perPage);
      this.setState({ selected: this.curSlide });
    }
    this.slideToCurrent();
    this.config.onChange.call(this);

    if (typeof callback === 'function') {
      callback();
    }
  }

  goTo(index) {
    this.curSlide = Math.min(Math.max(index, 0), this.innerElements.length - 1);
    this.setState({ selected: this.curSlide });
    this.slideToCurrent();
    this.config.onChange.call(this);
  }

  slideToCurrent() {
    this.sliderFrame.style[transformProperty] = `translate3d(-${Math.round(this.curSlide * (this.selectorWidth / this.perPage))}px, 0, 0)`;
    this.sliderFrame.style.display = 'flex';
  }

  updateAfterDrag() {
    const movement = this.drag.endX - this.drag.startX;
    if (movement > 0 && Math.abs(movement) > this.config.threshold) {
      this.prev();
    } else if (movement < 0 && Math.abs(movement) > this.config.threshold) {
      this.next();
    }
    this.slideToCurrent();
  }

  resize() {
    this.resolveSlidesNumber();

    this.selectorWidth = this.selector.getBoundingClientRect().width;
    Carousel.setStyle(this.sliderFrame, {
      width: `${(this.selectorWidth / this.perPage) * this.innerElements.length}px`,
    });
  }

  clearDrag() {
    this.drag = {
      startX: 0,
      endX: 0,
      startY: 0,
      letItGo: null,
    };
  }

  init() {
    this.setSelectorWidth();
    this.setInnerElements();
    this.resolveSlidesNumber();

    Carousel.setStyle(this.sliderFrame, {
      width: `${(this.selectorWidth / this.perPage) * this.innerElements.length}px`,
      webkitTransition: `all ${this.config.duration}ms ${this.config.easing}`,
      transition: `all ${this.config.duration}ms ${this.config.easing}`,
    });

    for (let i = 0; i < this.innerElements.length; i += 1) {
      Carousel.setStyle(this.innerElements[i], {
        width: `${100 / this.innerElements.length}%`,
      });
    }

    this.slideToCurrent();
    this.config.onInit.call(this);
  }

  render() {
    const { children } = this.props;
    const { selected } = this.state;
    return (
      <div
        className="app__carousel"
        ref={(selector) => { this.selector = selector; }}
        style={{ overflow: 'hidden' }}
        {
        ...this.evs.reduce((props, event) => Object.assign({}, props, { [event]: this[event] }), {})
        }
      >
        <Radios
          values={Object.keys(children)}
          selected={selected.toString()}
          onChange={e => this.goTo(e.target.id)}
        />
        <div ref={(sliderFrame) => { this.sliderFrame = sliderFrame; }}>
          {React.Children.map(children, (child, index) => (
            <div>
              {
                React.cloneElement(child, {
                  key: index,
                  style: { float: 'left' },
                  onClick: this.onClick,
                })
              }
            </div>
          ))}
        </div>
      </div>
    );
  }
}

Carousel.defaultProps = {
  resizeDebounce: 250,
  duration: 250,
  easing: 'ease-out',
  perPage: 1,
  startIndex: 0,
  draggable: true,
  threshold: 80,
  loop: false,
  onInit: () => {},
  onChange: () => {},
};

Carousel.propTypes = {
  resizeDebounce: PropTypes.number,
  duration: PropTypes.number,
  easing: PropTypes.string,
  perPage: PropTypes.number,
  startIndex: PropTypes.number,
  draggable: PropTypes.bool,
  threshold: PropTypes.number,
  loop: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
  ]).isRequired,
  onInit: PropTypes.func,
  onChange: PropTypes.func,
};

export default Carousel;
