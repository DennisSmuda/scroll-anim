/**
 * Created by jljsj on 16/1/13.
 */
import React from 'react';
import ReactDom from 'react-dom';
import expect from 'expect.js';
import ScrollAnim from '../index';
import TestUtils from 'react-addons-test-utils';
import QueueAnim from 'rc-queue-anim';
import TweenOne from 'rc-tween-one';
import ticker from 'rc-tween-one/lib/ticker';

describe('rc-scroll-anim', function() {
  let div;
  let instance;
  let tickerId = 0;

  function createScrollOverPack(props) {
    class OverPackDemo extends React.Component {
      constructor() {
        super(...arguments);
      }

      render() {
        return (<div>
          <div style={{height: 1000}}></div>
          <ScrollAnim.OverPack {...this.props} style={{height: 1000}}>
            <TweenOne key="one" animation={{opacity: 1}} className="tween-one" style={{opacity: 0}} component="i"
              hideProps={{ reverse: true }}>demo</TweenOne>
            <QueueAnim key="queueAnim" className="queue-anim" hideProps={{child: null}}>
              <p key="0">demo</p>
              <p key="1">demo</p>
            </QueueAnim>
          </ScrollAnim.OverPack>
        </div>);
      }
    }
    return ReactDom.render(<OverPackDemo {...props} />, div);
  }

  beforeEach(function() {
    div = document.createElement('div');
    document.body.appendChild(div);
  });

  afterEach(function() {
    try {
      ReactDom.unmountComponentAtNode(div);
      document.body.removeChild(div);
    } catch (e) {
      console.log(e);
    }
  });

  function getFloat(str) {
    return parseFloat(str);
  }

  it('single overPack', function() {
    instance = createScrollOverPack();
    const child = TestUtils.scryRenderedDOMComponentsWithTag(instance, 'div');
    console.log('overPack child length is 0');
    expect(child.length).to.be(3);
  });

  it('overPack always false', function(done) {
    window.scrollTo(0, 0);
    instance = createScrollOverPack({
      always: false,
    });
    const _tickerId = `scrollText${Date.now()}`;
    tickerId++;
    if (tickerId >= Number.MAX_VALUE) {
      tickerId = 0;
    }
    const startFrame = ticker.frame;
    ticker.wake(_tickerId, ()=> {
      const moment = (ticker.frame - startFrame) * ticker.perFrame;
      const ratio = moment / 300 * 3000;
      window.scrollTo(0, ratio);
      if (moment >= 300) {
        ticker.clear(_tickerId);
      }
    });
    setTimeout(()=> {
      let child;
      setTimeout(()=> {
        setTimeout(()=> {
          console.log('window.pageYOffset:', window.pageYOffset);
          child = TestUtils.scryRenderedDOMComponentsWithTag(instance, 'i');
          console.log('always = false -> TweenOne end opacity:', child[0].style.opacity);
          expect(getFloat(child[0].style.opacity)).to.be(1);
          child = TestUtils.scryRenderedDOMComponentsWithTag(instance, 'p');
          console.log('always = false -> QueueAnim end child length:', child.length);
          expect(child.length).to.be(2);
          done();
        }, 30);
      }, 930);
    }, 330);
  });

  it('overPack enter leave', function(done) {
    window.scrollTo(0, 0);
    instance = createScrollOverPack();
    const _tickerId = `scrollText${Date.now()}`;
    tickerId++;
    if (tickerId >= Number.MAX_VALUE) {
      tickerId = 0;
    }
    const startFrame = ticker.frame;
    ticker.wake(_tickerId, ()=> {
      const moment = (ticker.frame - startFrame) * ticker.perFrame;
      const ratio = moment / 300 * 3000;
      window.scrollTo(0, ratio);
      if (moment >= 300) {
        ticker.clear(_tickerId);
      }
    });
    setTimeout(() => {
      let child;
      setTimeout(()=> {
        child = TestUtils.scryRenderedDOMComponentsWithTag(instance, 'i');
        console.log('enter -> TweenOne start opacity:', child[0].style.opacity);
        expect(getFloat(child[0].style.opacity)).to.above(0);
        child = TestUtils.scryRenderedDOMComponentsWithTag(instance, 'p');
        console.log('enter -> QueueAnim start child length:', child.length);
        expect(child.length).to.above(0);
        setTimeout(()=> {
          child = TestUtils.scryRenderedDOMComponentsWithTag(instance, 'i');
          console.log('enter -> TweenOne end opacity:', child[0].style.opacity);
          expect(getFloat(child[0].style.opacity)).to.be(1);
        }, 500);
        setTimeout(()=> {
          child = TestUtils.scryRenderedDOMComponentsWithTag(instance, 'p');
          console.log('enter -> QueueAnim end child length:', child.length);
          expect(child.length).to.be(2);
          window.scrollTo(0, 0);
          setTimeout(()=> {
            child = TestUtils.scryRenderedDOMComponentsWithTag(instance, 'i');
            console.log('leave -> TweenOne end opacity:', child[0].style.opacity);
            expect(getFloat(child[0].style.opacity)).to.below(1);
            child = TestUtils.scryRenderedDOMComponentsWithTag(instance, 'p');
            console.log('leave -> QueueAnim end child length:', child.length);
            expect(child.length).to.be(0);
            done();
          }, 1000);
        }, 600);
      }, 30);
    }, 300);
  });
});
