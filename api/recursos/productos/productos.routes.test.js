let bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
let request = require('supertest');

let config = require('../../../config');
let Producto = require('./productos.model');
let Usuario = require('../usuarios/usuarios.model');
let app = require('../../../index').app;
let server = require('../../../index').server;

let productoYaEnBaseDeDatos = {
    titulo: 'Macbook Pro 13 Inches',
    precio: 1300,
    moneda: 'USD',
    dueño: 'samuel',
};

let nuevoProducto = {
    titulo: 'Cuerda Mammut 60 metros',
    precio: 200,
    moneda: 'USD',
};

let idInexistente = '5ab8dbcc6539f91c2288b0c1';

let testUsuario = {
    username: 'samuel',
    email: 'sierra034@gmail.com',
    password: 'holaquetal',
};

let authToken;
let tokenInvalido =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhYmEzMjJiZGQ2NTRhN2RiZmNjNGUzMCIsImlhdCI6MTUyMjE1MTk3OSwiZXhwIjoxNTIyMjM4Mzc5fQ.AAtAAAAkYuAAAy9O-AA0sAkcAAAAqfXskJZxhGJuTIk';

function obtenerToken(done) {
    // Antes de este bloque de tests creamos un usuario y obtenemos
    // su JWT token. Esto nos permitirá testear rutas que requieren autenticación.
    Usuario.remove({}, err => {
        if (err) done(err)
        request(app)
            .post('/usuarios')
            .send(testUsuario)
            .end((err, res) => {
                expect(res.status).toBe(201)
                request(app)
                    .post('/usuarios/login')
                    .send({
                        username: testUsuario.username,
                        password: testUsuario.password,
                    })
                    .end((err, res) => {
                        expect(res.status).toBe(200)
                        authToken = res.body.token;
                        done();
                    });
            })
    })
}

describe('Productos', () => {
    beforeEach((done) => {
        Producto.remove({}, err => done());
    });

    afterAll(() => {
        server.close();
    });

    describe('GET /productos/:id', () => {
        test('Tratar de obtener un producto con un id inválido debería retornar 400', done => {
            request(app)
                .get('/productos/123')
                .end((error, res) => {
                    expect(res.status).toBe(400);
                    done();
                });
        });

        test('Tratar de obtener un producto que no existe debería retornar 404', done => {
            request(app)
                .get(`/productos/${idInexistente}`)
                .end((error, res) => {
                    expect(res.status).toBe(404);
                    done();
                });
        });

        test('Debería retornar un producto que si existe exitósamente', done => {
            Producto(productoYaEnBaseDeDatos).save()
                .then(producto => {
                    request(app)
                        .get(`/productos/${producto._id}`)
                        .end((error, res) => {
                            expect(res.status).toBe(200);
                            expect(res.body).toBeInstanceOf(Object);
                            expect(res.body.titulo).toEqual(producto.titulo);
                            expect(res.body.precio).toEqual(producto.precio);
                            expect(res.body.moneda).toEqual(producto.moneda);
                            expect(res.body.dueño).toEqual(producto.dueño);
                            done();
                        });
                })
                .catch(err => done(err));
        });
    });

    describe('POST /productos', () => {

        beforeAll(obtenerToken);

        test('Si el usuario provee un token válido y el producto también es válido, debería ser creado', done => {
            request(app)
                .post('/productos')
                .set('Authorization', `Bearer ${authToken}`)
                .send(nuevoProducto)
                .end((err, res) => {
                    expect(res.status).toBe(201);
                    expect(res.body.titulo).toEqual(nuevoProducto.titulo);
                    expect(res.body.moneda).toEqual(nuevoProducto.moneda);
                    expect(res.body.precio).toEqual(nuevoProducto.precio);
                    expect(res.body.dueño).toEqual(testUsuario.username);
                    done();
                });
        });

        test('Si el usuario no prevee un token de autenticación, debería retornar 401', done => {
            request(app)
                .post('/productos')
                .set('Authorization', `Bearer ${tokenInvalido}`)
                .send(nuevoProducto)
                .end((err, res) => {
                    expect(res.status).toBe(401);
                    done();
                });
        });

        test('Si al producto le falta el título, no debería ser creado', done => {
            request(app)
                .post('/productos')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    moneda: nuevoProducto.moneda,
                    precio: nuevoProducto.precio,
                })
                .end((err, res) => {
                    expect(res.status).toBe(400);
                    done();
                });
        });

        test('Si al producto le falta el precio, no debaría ser creado', done => {
            request(app)
                .post('/productos')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    titulo: nuevoProducto.titulo,
                    moneda: nuevoProducto.moneda,
                })
                .end((err, res) => {
                    expect(res.status).toBe(400);
                    done();
                })
        });

        test('Si al producto le falta la moneda, no debería ser creado', done => {
            request(app)
                .post('/productos')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    titulo: nuevoProducto.titulo,
                    precio: nuevoProducto.precio,
                })
                .end((err, res) => {
                    expect(res.status).toBe(400);
                    done();
                })
        });
    });
});