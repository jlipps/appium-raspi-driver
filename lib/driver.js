import { BaseDriver } from 'appium-base-driver';
import B from 'bluebird';
import five from 'johnny-five';
import { RaspiIO } from 'raspi-io';
import log from './logger';

export default class RaspiDriver extends BaseDriver {
  constructor (opts = {}) {
    super(opts, false);
    this.board = null;
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

  async createSession (...args) {
    let [sessionId, caps] = await super.createSession(...args);
    this.board = new five.Board({
      io: new RaspiIO()
    });
    await B.promisify(this.board.on, {context: this.board})("ready");
    //let pins = ["P1-11", "P1-13", "P1-15"];
    //pins = pins.map(p => new five.Pin(p));
    //for (let pin of pins) {
      //pin.high();
    //}
    //pins[0].low();
    //await B.delay(3000);
    //pins[0].high();
    //await B.delay(3000);
    return [sessionId, caps];
  }

  async deleteSession () {
    log.info('Ending Raspi session');
    await super.deleteSession();
  }
}
