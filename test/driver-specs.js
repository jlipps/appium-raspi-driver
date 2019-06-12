import RaspiDriver from '..';
import chai from 'chai';

const should = chai.should();

describe('driver tests', function () {
  it('should load the driver', function () {
    should.exist(RaspiDriver);
  });
});
