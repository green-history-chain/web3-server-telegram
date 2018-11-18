import * as s from 'supertest';

abstract class ApiTest {
  public api: s.SuperTest<s.Test>

  constructor (api: s.SuperTest<s.Test>) {
    this.api = api;
  }

  abstract run ();
}

export { ApiTest };
