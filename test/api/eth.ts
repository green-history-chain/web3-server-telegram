import { ApiTest } from '../support/api-test';

export default class extends ApiTest {
  run () {
    describe('GET /eth', () => {
      test('should return eth node info', () => this.testGetEthNodeInfo());
    });
  }

  async testGetEthNodeInfo () {
    const response = await this.api.get('/eth');
    expect(response.status).toBe(200);
    expect(response.header['content-type']).toMatch(/json/);
    expect(response.body).toHaveProperty('accounts');
    expect(response.body).toHaveProperty('default_account');
    expect(response.body).toHaveProperty('default_account.address');
    expect(response.body).toHaveProperty('default_account.balance');
    expect(response.body).toHaveProperty('network');
    expect(response.body).toHaveProperty('node');
    expect(response.body).toHaveProperty('syncing');
    expect(response.body).toHaveProperty('version');
  }
}
