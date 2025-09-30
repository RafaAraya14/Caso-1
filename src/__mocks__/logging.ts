// src/__mocks__/logging.ts
export const logger = {
  session: jest.fn(),
  api: jest.fn(),
  auth: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};
