import { ApiTest } from '../support/api-test';

export default class extends ApiTest {
  run () {
    describe('GET /eth/contracts', () => {
      test('should return predefined contract list', () => this.testGetContractList());
    });

    describe('GET /eth/contracts/:id', () => {
      test('should return contract information', () => this.testGetContract());
      test('should return not found when giving unknown contract', () => this.testGetContractNotFound());
    });

    describe('POST /eth/contracts/:id', () => {
      test('should deploy new contract', () => this.testDeployContract());
      test('should deploy new contract with a callback', () => this.testDeployContractCallback());
      test('should invoke contract method', () => this.testInvokeContractMethod());
      test('should invoke contract method with a callback', () => this.testInvokeContractMethodCallback());
      test('should invoke contract method invalid signature', () => this.testInvokeContractMethodInvalidSignature());
      test('should return not found when giving unknown contract', () => this.testPostContractNotFound());
    });
  }

  async testGetContractList () {
    const response = await this.api.get('/eth/contracts');
    expect(response.status).toBe(200);
    expect(response.header['content-type']).toMatch(/json/);
    expect(response.body).toContain('example.sol');
  }

  async testGetContract () {
    const response = await this.api.get('/eth/contracts/example.sol');
    expect(response.status).toBe(200);
    expect(response.header['content-type']).toMatch(/json/);
    expect(response.body).toHaveProperty('abi');
    expect(response.body).toHaveProperty('sol');
    expect(response.body).toHaveProperty('bytecode');
    expect(response.body).toHaveProperty('gas');
  }

  async testGetContractNotFound () {
    const response = await this.api.get('/eth/contracts/foo.sol');
    expect(response.status).toBe(404);
  }

  async testDeployContract () {
    const payload = {
      params: []
    };
    const response = await this.api.post('/eth/contracts/example.sol').send(payload);
    expect(response.status).toBe(200);
    expect(response.header['content-type']).toMatch(/json/);
    expect(response.body).toHaveProperty('from');
    expect(response.body).toHaveProperty('to');
    expect(response.body).toHaveProperty('transaction');
    expect(response.body).toHaveProperty('gas');
  }

  async testDeployContractCallback () {
    const payload = {
      params: [],
      callback_url: 'http://example.com'
    };
    const response = await this.api.post('/eth/contracts/example.sol').send(payload);
    expect(response.status).toBe(202);
  }

  async testInvokeContractMethod () {
    const payload = {
      method: 'setValue',
      params: [ 1234 ],
      address: '0x73d5495e014e59e78ca44a62f9032107b9a5c880'
    };
    const response = await this.api.post('/eth/contracts/example.sol').send(payload);
    expect(response.status).toBe(200);
    expect(response.header['content-type']).toMatch(/json/);
    expect(response.body).toHaveProperty('from');
    expect(response.body).toHaveProperty('to');
    expect(response.body).toHaveProperty('result');
    expect(response.body).toHaveProperty('gas');
  }

  async testInvokeContractMethodCallback () {
    const payload = {
      method: 'setValue',
      params: [ 1234 ],
      address: '0x73d5495e014e59e78ca44a62f9032107b9a5c880',
      callback_url: 'http://example.com'
    };
    const response = await this.api.post('/eth/contracts/example.sol').send(payload);
    expect(response.status).toBe(202);
  }

  async testInvokeContractMethodInvalidSignature () {
    const payload = {
      method: 'setValue',
      params: [ 'it expects int' ],
      address: '0x73d5495e014e59e78ca44a62f9032107b9a5c880'
    };
    const response = await this.api.post('/eth/contracts/example.sol').send(payload);
    expect(response.status).toBe(400);
  }

  async testPostContractNotFound () {
    const payload = {};
    const response = await this.api.post('/eth/contracts/foo.sol').send(payload);
    expect(response.status).toBe(404);
  }
}
