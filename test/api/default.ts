import { ApiTest } from '../support/api-test';

export default class extends ApiTest {
  run () {
    describe('GET /', () => {
      test('should return api info', () => this.testGetApiInfo());
    });
  }

  async testGetApiInfo () {
    const response = await this.api.get('/');
    expect(response.status).toBe(200);
    expect(response.header['content-type']).toMatch(/json/);
    expect(response.body).toMatchObject({
      description: 'Web3 server',
      env: 'tests',
      name: 'web3-server',
      version: '0.1.0'
    });
  }
}
