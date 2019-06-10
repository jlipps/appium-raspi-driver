import { BaseDriver } from 'appium-base-driver';
import { W3C_ELEMENT_KEY } from 'appium-base-driver/build/lib/protocol/protocol';
import _ from 'lodash';
import B from 'bluebird';
import five from 'johnny-five';
import { RaspiIO } from 'raspi-io';
import log from './logger';
import uuid from 'uuid/v4';

let board;

export default class RaspiDriver extends BaseDriver {
  constructor (opts = {}) {
    super(opts, false);
    this.els = {};
    this.pinIdMap = {};
  }

  proxyActive () {
    return false;
  }

  getProxyAvoidList () {
    return [];
  }

  canProxy () {
    return false;
  }

  validateLocatorStrategy (strategy) {
    if (strategy !== 'id') {
      throw new Error(`Only the 'id' locator strategy is supported.`);
    }
  }

  validateDesiredCaps (caps) {
    if (!caps.app) {
      throw new Error(`'app' capability must exist`);
    }
  }

  async createSession (...args) {
    let [sessionId, caps] = await super.createSession(...args);
    if (!board) {
      board = new five.Board({
        io: new RaspiIO()
      });
      log.info('Waiting for board to be ready');
      await B.promisify(board.on, {context: board})('ready');
    }
    if (caps.app.pins) {
      log.info('Reading app pin setup');
      for (const [pin, spec] of _.toPairs(caps.app.pins)) {
        log.info(`Assigning id '${spec.id}' to pin '${pin}'`);
        this.pinIdMap[spec.id] = new five.Pin(pin);
        if (spec.mode) {
          if (spec.mode.toLowerCase() === 'output') {
            log.info(`Setting mode for pin '${pin}' to output`);
            board.pinMode(pin, five.Pin.OUTPUT);
          } else if (spec.mode.toLowerCase() === 'input') {
            log.info(`Setting mode for pin '${pin}' to input`);
            board.pinMode(pin, five.Pin.INPUT);
          }
        }
      }
      this.resetPinState();
    }
    return [sessionId, caps];
  }

  resetPinState () {
    log.info('Resetting pin state');
    if (this.caps.app.pins) {
      for (const [pin, spec] of _.toPairs(this.caps.app.pins)) {
        if (spec.init === 1) {
          log.info(`Setting initial state for pin '${pin}' to high`);
          this.pinIdMap[spec.id].high();
        } else if (spec.init === 0) {
          log.info(`Setting initial state for pin '${pin}' to low`);
          this.pinIdMap[spec.id].low();
        }
      }
    }
  }

  findElOrEls (strategy, selector, mult, context) {
    if (mult) {
      throw new Error('RaspiDriver does not support multiple element search');
    }

    if (context) {
      throw new Error('RaspiDriver does not support context for findElement');
    }

    if (!this.pinIdMap[selector]) {
      throw new Error(`Could not find pin with id '${selector}', does it ` +
                      `exist in the app model?`);
    }

    const newId = uuid();
    this.els[newId] = this.pinIdMap[selector];

    return {[W3C_ELEMENT_KEY]: newId};
  }

  setValue (value, elId) {
    const pin = this.els[elId];

    if (!this.els) {
      throw new Error(`Couldn't find element with id ${elId}`);
    }

    if (_.isArray(value)) {
      value = value.join('');
    }

    if (value !== '0' && value !== '1') {
      throw new Error(`Currently, can only set pins to '0' or '1', but you ` +
                      `sent in '${value}'`);
    }

    if (value === '0') {
      pin.low();
      return;
    }

    pin.high();
  }

  async deleteSession () {
    log.info('Ending Raspi session');
    this.resetPinState();
    await super.deleteSession();
  }
}
