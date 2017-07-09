import { createFetch } from 'relay-local-schema';
import { Environment, Network, RecordSource, Store } from 'relay-runtime';

import { Resolver } from '../../src';

import schema from '../fixtures/schema';

export function createFakeFetch() {
  return createFetch({ schema });
}

// Delay field resolution to exercise async data fetching logic.
function delay(promise) {
  return new Promise((resolve, reject) => {
    promise.then(
      (value) => { setTimeout(resolve, 10, value); },
      (error) => { setTimeout(reject, 10, error); },
    );
  });
}

export function createEnvironment(fetch = createFakeFetch()) {
  return new Environment({
    network: Network.create(
      (...args) => delay(fetch(...args)),
    ),
    store: new Store(new RecordSource()),
  });
}

export class InstrumentedResolver extends Resolver {
  constructor(environment = createEnvironment()) {
    super(environment);

    this.done = new Promise((resolve) => {
      this.resolveDone = resolve;
    });
  }

  async * resolveElements(match) {
    yield* super.resolveElements(match);
    this.resolveDone();
  }
}