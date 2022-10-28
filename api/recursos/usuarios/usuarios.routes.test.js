let bcrypt = require('bcrypt');
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

function usuarioExisteYAtributosSonCorrectos(usuario, done) {
    Usuario.find({ username: usuario.username })
        .then(usuarios => {
            expect(usuarios).toBeInstanceOf(Array);
            expect(usuarios).toHaveLength(1);
            expect(usuarios[0].username).toEqual(usuario.username);
            expect(usuarios[0].email).toEqual(usuario.email);

            let iguales = bcrypt.compareSync(usuario.password, usuarios[0].password);
            expect(iguales).toBeTruthy();
            done();
        })
        .catch(error => done(error));
}

async function usuarioNoExiste(usuario, done) {
    try {
        let usuarios = await Usuario.find().or([
            { username: usuario.username },
            { email: usuario.email }]);
        expect(usuarios).toHaveLength(0);
        done();
    } catch (error) {
        done(error);
    }
}

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
                        });
                });
        });

    });

    describe('POST /usuarios', () => {

        test('Un usuario que cumple las condiciones debería ser creado', (done) => {
            request(app)
                .post('/usuarios')
                .send(dummyUsuarios[0])
                .end((error, res) => {
                    expect(res.status).toBe(201)
                    expect(typeof res.text).toBe('string')
                    expect(res.text).toEqual('Usuario creado exitósamente.')

                    usuarioExisteYAtributosSonCorrectos(dummyUsuarios[0], done);
                });
        });

        test('Crear un usuario con un username ya registrado debería fallar', (done) => {
            Promise.all(dummyUsuarios.map(usuario => (new Usuario(usuario)).save()))
                .then(usuarios => {
                    request(app)
                        .post('/usuarios')
                        .send({
                            username: 'samuel',
                            email: 'samuel_nuevo_email@gmail.com',
                            password: 'cuidadoarriba',
                        })
                        .end((error, res) => {
                            expect(res.status).toBe(409);
                            expect(typeof res.text).toBe('string');
                            done();
                        })
                });
        });

        test('Crear un usuario con un email ya registrado debería fallar', (done) => {
            Promise.all(dummyUsuarios.map(usuario => (new Usuario(usuario)).save()))
                .then(usuarios => {
                    request(app)
                        .post('/usuarios')
                        .send({
                            username: 'nuevoSamuel',
                            email: 'samuel@gmail.com',
                            password: 'cuidadoarriba',
                        })
                        .end((error, res) => {
                            expect(res.status).toBe(409);
                            expect(typeof res.text).toBe('string');
                            done();
                        });
                });
        });

        test('Un usuario sin username no debería ser creado', (done) => {
            request(app)
                .post('/usuarios')
                .send({
                    email: 'samuel@gmail.com',
                    password: 'contraseña',
                })
                .end((err, res) => {
                    expect(res.status).toBe(400);
                    expect(typeof res.text).toBe('string');
                    done();
                })
        });

        test('Usuario sin contraseña no debería ser creado', (done) => {
            let usuario = {
                username: 'samuel',
                email: 'samuel@gmail.com',
            };

            request(app)
                .post('/usuarios')
                .send(usuario)
                .end((err, res) => {
                    expect(res.status).toBe(400);
                    expect(typeof res.text).toBe('string');
                    done();
                })
        });

        test('Usuario sin email no debería ser creado', (done) => {

            let usuario = {
                username: 'samuel',
                password: 'contraseña',
            };

            request(app)
                .post('/usuarios')
                .send(usuario)
                .end((err, res) => {
                    expect(res.status).toBe(400);
                    expect(typeof res.text).toBe('string');
                    done();
                });

        });

        test('Usuario con un email inválido no debería ser creado', (done) => {
            let usuario = {
                username: 'samuel',
                email: '@gmail.com',
                password: 'contraseña',
            };

            request(app)
                .post('/usuarios')
                .send(usuario)
                .end((err, res) => {
                    expect(res.status).toBe(400);
                    expect(typeof res.text).toBe('string');
                    usuarioNoExiste(usuario, done);
                });
        });

        test('Usuario con un username con menos de 3 caracteres no debería ser creado', (done) => {
            let usuario = {
                username: 'da',
                email: 'sierra034@gmail.com',
                password: 'contraseña',
            };

            request(app)
                .post('/usuarios')
                .send(usuario)
                .end((err, res) => {
                    expect(res.status).toBe(400);
                    expect(typeof res.text).toBe('string');
                    usuarioNoExiste(usuario, done);
                });
        });

        test('Usuario con un username con más de 30 caracteres no debería ser creado', (done) => {
            let usuario = {
                username: 'samuel'.repeat(10),
                email: 'samuel@gmail.com',
                password: 'contraseña',
            };

            request(app)
                .post('/usuarios')
                .send(usuario)
                .end((err, res) => {
                    expect(res.status).toBe(400);
                    expect(typeof res.text).toBe('string');
                    usuarioNoExiste(usuario, done);
                });
        });

        test('Usuario cuya contraseña tenga menos de 6 caracteres no debería ser creado', (done) => {
            let usuario = {
                username: 'samuel',
                email: 'samuel@gmail.com',
                password: 'abc',
            };

            request(app)
                .post('/usuarios')
                .send(usuario)
                .end((err, res) => {
                    expect(res.status).toBe(400);
                    expect(typeof res.text).toBe('string');
                    usuarioNoExiste(usuario, done);
                });
        });

        test('Usuario cuya contraseña contenga más de 200 caracteres no debería ser creado', (done) => {
            let usuario = {
                username: 'samuel',
                email: 'samuel@gmail.com',
                password: 'contraseña'.repeat(40),
            };

            request(app)
                .post('/usuarios')
                .send(usuario)
                .end((err, res) => {
                    expect(res.status).toBe(400);
                    expect(typeof res.text).toBe('string');
                    usuarioNoExiste(usuario, done);
                });
        });

        test('El username y email de un usuario válido deben ser guardados en lowercase', (done) => {
            let usuario = {
                username: 'SamUEL',
                email: 'SIierRa@gmail.com',
                password: 'pruebapruebaprueba',
            };

            request(app)
                .post('/usuarios')
                .send(usuario)
                .end((err, res) => {
                    expect(res.status).toBe(201);
                    expect(typeof res.text).toBe('string');
                    expect(res.text).toEqual('Usuario creado exitósamente.');
                    usuarioExisteYAtributosSonCorrectos({
                        username: usuario.username.toLocaleLowerCase(),
                        email: usuario.email.toLocaleLowerCase(),
                        password: usuario.password,
                    }, done);
                });
        })

    });

});