import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('*/auth/v1/signup', () => {
    return HttpResponse.json({
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
      },
      session: {
        access_token: 'mock-access-token',
      },
    });
  }),

  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      user: {
        id: 'mock-user-id',
        email: 'test@example.com',
      },
      session: {
        access_token: 'mock-access-token',
      },
    });
  }),

  http.post('*/v1/checkout/sessions', () => {
    return HttpResponse.json({
      id: 'cs_test_123',
      url: 'https://checkout.stripe.com/test',
    });
  }),
];
