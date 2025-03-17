exports.ApiPage =
class ApiPage {
    constructor(request) {
        this.request = request;
    }

    async createToken(username, password) {
        return await this.request.post(`/auth`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            data: {
                "username": username,
                "password": password
            }
        });
    }

    async getBookingsId() {
        return await this.request.get(`/booking`);
    }

    async getBooking(id) {
        return await this.request.get(`/booking/${id}`);
    }

    async createBooking(firstname, lastname, price, deposit, checkin, checkout, additionalneeds) {
        return await this.request.post(`/booking`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            data: {
                "firstname": firstname,
                "lastname": lastname,
                "totalprice": price,
                "depositpaid": deposit,
                "bookingdates": {
                    "checkin": checkin,
                    "checkout": checkout
                },
                "additionalneeds": additionalneeds
            }
        });
    }

    async updateBooking(firstname, lastname, price, deposit, checkin, checkout, additionalneeds, id, token) {
        return await this.request.put(`/booking/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Cookie': `token=${token}`
            },
            data: {
                "firstname": firstname,
                "lastname": lastname,
                "totalprice": price,
                "depositpaid": deposit,
                "bookingdates": {
                    "checkin": checkin,
                    "checkout": checkout
                },
                "additionalneeds": additionalneeds
            }
        });
    }

    async partialUpdateBooking({ firstname, lastname, price, deposit, checkin, checkout, additionalneeds, id, token }) {
        const data = {};
        if (firstname !== undefined) data.firstname = firstname;
        if (lastname !== undefined) data.lastname = lastname;
        if (price !== undefined) data.totalprice = price;
        if (deposit !== undefined) data.depositpaid = deposit;
        if (checkin !== undefined || checkout !== undefined) {
            data.bookingdates = {};
            if (checkin !== undefined) data.bookingdates.checkin = checkin;
            if (checkout !== undefined) data.bookingdates.checkout = checkout;
        }
        if (additionalneeds !== undefined) data.additionalneeds = additionalneeds;
    
        return await this.request.patch(`/booking/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Cookie': `token=${token}`
            },
            data: data
        });
    }
    

    async deleteBooking(id, token) {
        return await this.request.delete(`/booking/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Cookie': `token=${token}`
            }
        });
    }
}