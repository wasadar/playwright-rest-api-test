// @ts-check
import { test, expect } from '@playwright/test';
import { ApiPage } from '../pages/api.page';

function checkBookingPropetires (booking, firstname, lastname, price, deposit, checkin, checkout, additionalneeds) {
  expect(booking).toHaveProperty('firstname',firstname);
  expect(booking).toHaveProperty('lastname',lastname);
  expect(booking).toHaveProperty('totalprice',price);
  expect(booking).toHaveProperty('depositpaid',deposit);
  expect(booking.bookingdates).toHaveProperty('checkin',checkin);
  expect(booking.bookingdates).toHaveProperty('checkout',checkout);
  expect(booking).toHaveProperty('additionalneeds',additionalneeds);
}

test.describe('Api tests', () => {
  test('It should login to admin account when used valid credentials', async ({request}) => {
    let apiPage = new ApiPage(request);

    let response = await apiPage.createToken('admin', 'password123');
    expect(response.ok()).toBeTruthy();
    expect(await response.json()).toHaveProperty('token');
  });

  test('It shouldn\'t login to admin account when used invalid login', async ({request}) => {
    let apiPage = new ApiPage(request);

    let response = await apiPage.createToken('false_admin', 'password123');
    expect(response.ok()).toBeTruthy();
    expect(await response.json()).toHaveProperty('reason', 'Bad credentials');
  });

  test('It shouldn\'t login to admin account when used invalid password', async ({request}) => {
    let apiPage = new ApiPage(request);

    let response = await apiPage.createToken('admin', 'false_password');
    expect(response.ok()).toBeTruthy();
    expect(await response.json()).toHaveProperty('reason', 'Bad credentials');
  });

  test('It should return list of bookings', async ({request}) => {
    let apiPage = new ApiPage(request);

    let response = await apiPage.getBookingsId();
    expect(response.ok()).toBeTruthy();
    let json = await response.json();
    expect(Array.isArray(json)).toBe(true);

    json.forEach(booking => {
      expect(booking).toHaveProperty('bookingid');
      expect(typeof booking.bookingid).toBe('number');
    });
  });

  test('It should create a booking with valid data', async ({request}) => {
    let apiPage = new ApiPage(request);

    let response = await apiPage.createBooking('firstname', 'lastname', 100, true, '2025-11-11', '2025-12-12', 'sightseeing');
    expect(response.ok()).toBeTruthy();
    let json = await response.json();
    expect(json).toHaveProperty('bookingid');
    checkBookingPropetires(json.booking,'firstname', 'lastname', 100, true, '2025-11-11', '2025-12-12', 'sightseeing');
  });

  test('It should get booking by it\'s id', async ({request}) => {
    let apiPage = new ApiPage(request);

    let response = await apiPage.createBooking('firstname', 'lastname', 100, true, '2025-11-11', '2025-12-12', 'sightseeing');
    expect(response.ok()).toBeTruthy();
    let json = await response.json();
    let id = json.bookingid;

    response = await apiPage.getBooking(id);
    expect(response.ok()).toBeTruthy();
    json = await response.json();
    checkBookingPropetires(json,'firstname', 'lastname', 100, true, '2025-11-11', '2025-12-12', 'sightseeing');
  });

  test('It should return 404 when booking doesn\'t exists', async ({request}) => {
    let apiPage = new ApiPage(request);

    let response = await apiPage.getBooking(0);
    expect(response.status()).toBe(404);
  });

  test('It should update a booking with valid data', async ({request}) => {
    let apiPage = new ApiPage(request);

    let response = await apiPage.createToken('admin', 'password123');
    let token = (await response.json()).token;
    response = await apiPage.createBooking('firstname', 'lastname', 100, true, '2025-11-11', '2025-12-12', 'sightseeing');
    expect(response.ok()).toBeTruthy();
    let json = await response.json();
    let id = json.bookingid;
    checkBookingPropetires(json.booking,'firstname', 'lastname', 100, true, '2025-11-11', '2025-12-12', 'sightseeing');

    response = await apiPage.updateBooking('other firstname', 'other lastname', 1000, false, '2026-11-11', '2026-12-12', 'not sightseeing', id, token);
    expect(response.ok()).toBeTruthy();
    json = await response.json();
    checkBookingPropetires(json,'other firstname', 'other lastname', 1000, false, '2026-11-11', '2026-12-12', 'not sightseeing');
  });

  test('It shouldn\'t update a booking without valid token', async ({request}) => {
    let apiPage = new ApiPage(request);

    let response = await apiPage.createBooking('firstname', 'lastname', 100, true, '2025-11-11', '2025-12-12', 'sightseeing');
    expect(response.ok()).toBeTruthy();
    let json = await response.json();
    let id = json.bookingid;

    response = await apiPage.updateBooking('other firstname', 'other lastname', 1000, false, '2026-11-11', '2026-12-12', 'not sightseeing', id, "wrongtoken");
    expect(response.status()).toBe(403);
  });

  test('It shouldn\'t update a booking with invalid id', async ({request}) => {
    let apiPage = new ApiPage(request);

    let response = await apiPage.createToken('admin', 'password123');
    let token = (await response.json()).token;
    response = await apiPage.updateBooking('other firstname', 'other lastname', 1000, false, '2026-11-11', '2026-12-12', 'not sightseeing', 0, token);
    expect(response.status()).toBe(405);
  });

  test('It should partially update a booking with valid data', async ({request}) => {
    let apiPage = new ApiPage(request);

    let response = await apiPage.createToken('admin', 'password123');
    let token = (await response.json()).token;
    response = await apiPage.createBooking('firstname', 'lastname', 100, true, '2025-11-11', '2025-12-12', 'sightseeing');
    expect(response.ok()).toBeTruthy();
    let json = await response.json();
    let id = json.bookingid;
    checkBookingPropetires(json.booking,'firstname', 'lastname', 100, true, '2025-11-11', '2025-12-12', 'sightseeing');

    // @ts-ignore
    response = await apiPage.partialUpdateBooking({firstname: 'other firstname', lastname: 'other lastname', id: id, token: token});
    expect(response.ok()).toBeTruthy();
    json = await response.json();
    checkBookingPropetires(json,'other firstname', 'other lastname', 100, true, '2025-11-11', '2025-12-12', 'sightseeing');
  });

  test('It shouldn\'t partially update a booking without valid token', async ({request}) => {
    let apiPage = new ApiPage(request);

    let response = await apiPage.createBooking('firstname', 'lastname', 100, true, '2025-11-11', '2025-12-12', 'sightseeing');
    expect(response.ok()).toBeTruthy();
    let json = await response.json();
    let id = json.bookingid;

    // @ts-ignore
    response = await apiPage.partialUpdateBooking({firstname: 'other firstname', lastname: 'other lastname', id: id, token: "wrongtoken"});
    expect(response.status()).toBe(403);
  });

  test('It shouldn\'t partially update a booking with invalid id', async ({request}) => {
    let apiPage = new ApiPage(request);

    let response = await apiPage.createToken('admin', 'password123');
    let token = (await response.json()).token;

    // @ts-ignore
    response = await apiPage.partialUpdateBooking({firstname: 'other firstname', lastname: 'other lastname', id: 0, token: token});
    expect(response.status()).toBe(405);
  });

  test('It should delete booking with valid id', async ({request}) => {
    let apiPage = new ApiPage(request);

    let response = await apiPage.createToken('admin', 'password123');
    let token = (await response.json()).token;
    response = await apiPage.createBooking('firstname', 'lastname', 100, true, '2025-11-11', '2025-12-12', 'sightseeing');
    expect(response.ok()).toBeTruthy();
    let json = await response.json();
    let id = json.bookingid;
    response = await apiPage.deleteBooking(id, token);
    expect(response.ok()).toBeTruthy();
    response = await apiPage.getBooking(id);
    expect(response.status()).toBe(404);
  });

  test('It shouldn\'t delete booking without valid token', async ({request}) => {
    let apiPage = new ApiPage(request);

    let response = await apiPage.createBooking('firstname', 'lastname', 100, true, '2025-11-11', '2025-12-12', 'sightseeing');
    expect(response.ok()).toBeTruthy();
    let json = await response.json();
    let id = json.bookingid;
    response = await apiPage.deleteBooking(id, "wrongtoken");
    expect(response.status()).toBe(403);
  });

  test('It shouldn\'t delete booking with invalid id', async ({request}) => {
    let apiPage = new ApiPage(request);

    let response = await apiPage.createToken('admin', 'password123');
    let token = (await response.json()).token;
    response = await apiPage.deleteBooking(0, token);
    expect(response.status()).toBe(405);
  });
});