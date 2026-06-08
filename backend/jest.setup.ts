jest.mock('redis');

const { resetMockStore } = jest.requireMock<typeof import('./src/__mocks__/redis')>('redis');

beforeEach(() => {
    resetMockStore();
});
