import { UUID } from './uuid';

describe('UUID', () => {

  it('looks like a uuid', () => {
    expect(UUID.UUID()).toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
  });

  it('creates pretty darn unique uuids', () => {
    let uuids = {};
    for (let i = 0; i < 1000; i++) {
      uuids[UUID.UUID()] = true;
    }
    expect(Object.keys(uuids).length).toEqual(1000);
  });

});
