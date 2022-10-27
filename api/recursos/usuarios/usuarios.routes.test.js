let request = require('supertest');

let Usuario = require('./usuarios.model');
let app = require('../../../index').app;
let server = require('../../../index').server;

let dummyUsuarios = [
    {
        username: 'samuel',
        email: 'samuel@gmail.com',
        password: 'holaquetal',
    },
    {
        username: 'pablo',
        email: 'pablo@gmail.com',
        password: 'quepaso',
    },
    {
        username: 'diego',
        email: 'diego@gmail.com',
        password: 'nomedigas',
    },
];

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

        test('Si existen usuarios, debería retornarlos en un array', (done) => {
            Promise.all(dummyUsuarios.map(usuario => (new Usuario(usuario)).save()))
                .then(usuarios => {
                    request(app)
                        .get('/usuarios')
                        .end((error, res) => {
                            expect(res.status).toBe(200);
                            expect(res.body).toBeInstanceOf(Array);
                            expect(res.body).toHaveLength(3);
                            done();
                        })
                })
        })

    });

});