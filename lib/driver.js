import { BaseDriver } from 'appium-base-driver';
import log from './logger';

export default class RaspiDriver extends BaseDriver {
  constructor (opts = {}) {
    super(opts, false);
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
    return [sessionId, caps];
  }

  async deleteSession () {
    log.info('Ending Raspi session');
    await super.deleteSession();
  }
}
