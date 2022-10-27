let request = require('supertest');

let Usuario = require('./usuarios.model');
let app = require('../../../index').app;
let server = require('../../../index').server;

describe('Usuarios', () => {

    beforeEach((done) => {
        Usuario.remove({}, (error) => done());
    });

    afterAll(() => {
        server.close();
    });

    describe('GET /usuarios', () => {
        test('Si no hay usuarios, debería retornar un array vacío', (done) => {
            request(app)
                .get('/usuarios')
                .end((error, res) => {
                    expect(res.status).toBe(200);
                    expect(res.body).toBeInstanceOf(Array);
                    expect(res.body).toHaveLength(0);
                    done();
                });
        });
    });
});