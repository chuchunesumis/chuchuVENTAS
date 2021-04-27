const Usuario = require('../models/Usuario');
const Empresa = require('../models/Empresa');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');
const Pedido = require('../models/Pedido');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config({ path: 'variables.env' });

const crearToken = (usuario, secreta, expiresIn) => {
    
    const { id, email, nombre, apellido, empresa, habilitado, tipo } = usuario; 

    // console.log(usuario)
    
    /**
     * Los campos agregados al jwt.sign, serán añadidos al token,
     * por ende, esa será la info que se pasará por el context
     */ 
    return jwt.sign( { 
        id, 
        nombre, 
        apellido, 
        empresa, 
        habilitado, 
        tipo, 
        expira: Math.floor((Date.now() / 1000) + 86400)
    }, secreta, { expiresIn } );
    
}



// Resolvers
const resolvers = {
    Query: {
        obtenerUsuario: async (_, {}, ctx) => {            
            return ctx.usuario;
        },
        obtenerUsuarioCompleto: async (_, {}, ctx) => {
            try {
                const usuario = await Usuario.findById(ctx.usuario.id).populate('empresa');
                return usuario;
            } catch (error) {
                console.log(error);
            }
        },
        obtenerUsuarios: async (_, {}) => {
            try {
                const usuarios = await Usuario.find({}).populate('empresa');
                return usuarios;
            } catch (error) {
                console.log(error);
            }
        },
        obtenerUsuariosConEmpresa: async (_, {}) => {
            try {
                const usuarios = await Usuario.find({ empresa: { $exists: true } }).populate('empresa');
                return usuarios;
            } catch (error) {
                console.log(error);
            }
        },
        obtenerUsuariosSinEmpresa: async (_, {}) => {
            try {
                const usuarios = await Usuario.find({ $or: [
                                                            {empresa: { $exists: false }}, 
                                                            {empresa: { $type: 10 } }
                                                        ]});
                return usuarios;
            } catch (error) {
                console.log(error);
            }
        },
        obtenerUsuarioPorId: async (_, { id }) => {
            const usuario = await Usuario.findById(id);

            if(!usuario) {
                throw new Error('Usuario no encontrado');
            }

            return usuario;
        },
        obtenerEmpresas: async () => {
            try {
                const empresas = await Empresa.find({});
                return empresas;
            } catch (error) {
                console.log(error);
            }
        },
        obtenerEmpresa: async (_, { id }) => {            
            const empresa = await Empresa.findById(id);
            
            if(!empresa) {
                throw new Error('Empresa no encontrada');
            }

            return empresa;
        },
        obtenerProductos: async () => {
            try {
                const productos = await Producto.find({})
                return productos;
            } catch (error) {
                console.log(error);
            }
        },
        obtenerProducto: async (_, { id }, ctx) => {
            // revisar si el producto existe o no
            const producto = await Producto.findById(id);

            if(!producto) {
                throw new Error('Producto no encontrado');
            }

            /**
             * A FUTURO, sólo los vendedores que formen parte
             * de la empresa relacionada con el producto
             * podrán consultarlo
             * 
            // Quién lo creó, puede verlo
            if(producto.empresa.toString() !== ctx.usuario.empresa ) {
                throw new Error('No tiene las credenciales para acceder a esa información');
            }
            
            */

            return producto;
        },        
        totalProductosEmpresa: async (_, {}, ctx ) => {
            // Query para saber cuántos elementos hay en la tabla Cliente
            const productos = await Producto.countDocuments({empresa: ctx.usuario.empresa.toString()})

            return productos;
        },
        obtenerProductosEmpresa: async (_, {limite, offset}, ctx) => {
            try {
                /**
                 * Modifiqué el filtro de la consulta para que se traiga
                 * los productos que estén relacionados con una empresa
                 * en común. El nombre anterior era "obtenerProductosVendedor"
                 */

                const productos = await Producto.find({ empresa: ctx.usuario.empresa.toString() })
                                                .limit(limite)
                                                .skip(offset);
                return productos;
            } catch (error) {
                console.log(error);
            }
        },
        obtenerClientes: async (_, {limite, offset}, ctx) => {
            try {
                const clientes = await Cliente.find({})
                                              .limit(limite)
                                              .skip(offset);
                return clientes;
            } catch (error) {
                console.log(error);
            }
        },
        obtenerClientesVendedor: async (_, {}, ctx ) => {
            try {
                const clientes = await Cliente.find({ vendedor: ctx.usuario.id.toString() });
                return clientes;
            } catch (error) {
                console.log(error);
            }
        },
        obtenerClientesEmpresa: async (_, {limite, offset}, ctx ) => {
            try {
                const clientes = await Cliente.find({ empresa: ctx.usuario.empresa.toString() })
                                              .limit(limite)
                                              .skip(offset);
                return clientes;
            } catch (error) {
                console.log(error);
            }
        },
        obtenerCliente: async (_, { id }, ctx ) => {
            // Revisar si el cliente existe o no
            const cliente = await Cliente.findById(id);

            if(!cliente) {
                throw new Error('Cliente no encontrado');
            }

            /**
             * Sólo los vendedores que forman parte de la misma
             * empresa donde fue creado el cliente, podrán tener
             * acceso al mismo
             */
            if(cliente.empresa.toString() !== ctx.usuario.empresa ) {
                throw new Error('No tiene las credenciales para acceder a esa información');
            }

            return cliente;
        },
        totalClientesEmpresa: async (_, {}, ctx ) => {
            // Query para saber cuántos elementos hay en la tabla Cliente
            const clientes = await Cliente.countDocuments({empresa: ctx.usuario.empresa.toString()})

            return clientes;
        },
        obtenerPedidos: async () => {
            try {
                const pedidos = await Pedido.find({});
                return pedidos;
            } catch (error) {
                console.log(error);
            }
        },
        obtenerPedidosVendedor: async (_, {}, ctx) => {
            try {
                const pedidos = await Pedido.find({ vendedor: ctx.usuario.id}).populate('cliente');

                // console.log(pedidos);
                return pedidos;
            } catch (error) {
                console.log(error);
            }
        },
        obtenerPedidosEmpresa: async (_, {limite, offset}, ctx) => {
            try {
                const pedidos = await Pedido.find({ empresa: ctx.usuario.empresa})
                                .populate('cliente')
                                .sort( { creado: -1 } )
                                .limit(limite)
                                .skip(offset);
                
                // console.log(pedidos);
                return pedidos;
            } catch (error) {
                console.log(error);
            }
        },
        // obtenerPedidosEmpresaCompleto: async (_, {}, ctx) => {
        //     try {
        //         const pedidos = await Pedido.find({ empresa: ctx.usuario.empresa})
        //                         .populate('cliente')
        //                         .populate('vendedor')
        //                         .sort( { creado: -1 } );
                
        //         // console.log(pedidos);
        //         return pedidos;
        //     } catch (error) {
        //         console.log(error);
        //     }
        // },
        obtenerPedido: async (_, {id}, ctx) => {
            // Si el pedido existe o no
            const pedido = await Pedido.findById(id);
            if(!pedido) {
                throw new Error('Pedido no encontrado');
            }

            // Verificar que sólo las personas que sean de la misma empresa que el lo creó puedan verlo
            if(pedido.empresa.toString() !== ctx.usuario.empresa) {                
                throw new Error('No tiene las credenciales para acceder a esa información');                
            }

            // retornar el resultado
            return pedido;
        },
        obtenerPedidosEstado: async (_, { estado }, ctx) => {
            const pedidos = await Pedido.find({ vendedor: ctx.usuario.id, estado });

            return pedidos;
        },
        obtenerPedidosCliente: async (_, {id}) => {

            /**
             * este resolver consulta todos los pedidos
             * que tenga un cliente en particular
             * a través del ID
             */

            const pedidos = await Pedido.find({ cliente: id });

            return pedidos;
        },
        totalPedidosEmpresa: async (_, {}, ctx ) => {
            // Query para saber cuántos elementos hay en la tabla Cliente
            const clientes = await Pedido.countDocuments({empresa: ctx.usuario.empresa.toString()})

            return clientes;
        },
        mejoresClientes: async (_, {}, ctx) => {
            const clientes = await Pedido.aggregate([
                { $match : { estado : "COMPLETADO" }},
                { $group : {
                    _id : "$cliente",
                    total: { $sum: '$total' }
                }},
                {
                    $lookup: {
                        from: 'clientes',
                        localField: '_id',
                        foreignField: "_id",
                        as: "cliente"
                    }
                },
                // {
                //     $limit: 10
                // },
                {
                    $sort : {total : -1}
                }
            ]);

            // verificar si el usuario tiene los privilegios
            if(ctx.usuario.tipo == 1) {
                throw new Error('No tiene las credenciales para acceder a esa información');
            }
            
            if(ctx.usuario.tipo == 2 || ctx.usuario.tipo == 3) {
                return clientes;
            } 
        },
        mejoresClientesEmpresa: async (_, {}, ctx) => {
            
            /**
             * Resolver para graficar los mejores clientes 
             * sólo de la empresa a la cual el vendedor 
             * forma parte
             * 
             * NOTA: se usa el "mongoose.Types.ObjectId" porque
             *       el campo "empresa" es un ObjectId, no
             *       funcionó el hacer uso de la función 
             *       "toString()"
             */
            
            const clientes = await Pedido.aggregate([
                { $match : 
                    { $and: [ 
                        { empresa: mongoose.Types.ObjectId(ctx.usuario.empresa) }, 
                        { estado: "COMPLETADO" } 
                    ] } 
                },
                { $group : {  
                    _id : "$cliente",
                    total: { $sum: '$total'}
                }},
                {
                    $lookup: {
                        from: 'clientes',
                        localField: '_id',
                        foreignField: '_id',
                        as: "cliente"
                    }
                },
                // {
                //     $limit: 10
                // },
                {
                    $sort : { total : -1 }
                }
            ]);

            // verificar si el usuario tiene los privilegios
            if(ctx.usuario.tipo == 1) {
                throw new Error('No tiene las credenciales para acceder a esa información');
            }
            
            if(ctx.usuario.tipo == 2 || ctx.usuario.tipo == 3) {
                return clientes;
            } 
        },
        mejoresVendedores: async (_, {}, ctx) => {
            const vendedores = await Pedido.aggregate([
                { $match : { estado: "COMPLETADO"} },
                { $group : {
                    _id : "$vendedor",
                    total: {$sum : '$total'}
                }},
                {
                    $lookup: {
                        from: 'usuarios',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'vendedor'
                    }
                },
                // {
                //     $limit: 10
                // },
                {
                    $sort: { total: -1 }
                }
            ]);

            // verificar si el usuario tiene los privilegios
            if(ctx.usuario.tipo == 1) {
                throw new Error('No tiene las credenciales para acceder a esa información');
            }
            
            if(ctx.usuario.tipo == 2 || ctx.usuario.tipo == 3) {
                return vendedores;
            }
        },
        mejoresVendedoresEmpresa: async (_, {}, ctx) => {
            const vendedores = await Pedido.aggregate([
                { $match : 
                    { $and: [ 
                        { empresa: mongoose.Types.ObjectId(ctx.usuario.empresa) }, 
                        { estado: "COMPLETADO" } 
                    ] } 
                },
                { $group : {
                    _id : "$vendedor",
                    total: {$sum: '$total'}
                }},
                {
                    $lookup: {
                        from: 'usuarios',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'vendedor'
                    }
                },
                // {
                //     $limit: 10
                // },
                {
                    $sort: { total : -1}
                }
            ]);

            // verificar si el usuario tiene los privilegios
            if(ctx.usuario.tipo == 1) {
                throw new Error('No tiene las credenciales para acceder a esa información');
            }
            
            if(ctx.usuario.tipo == 2 || ctx.usuario.tipo == 3) {
                return vendedores;
            }
        },
        buscarProducto: async (_, { texto }) => {
            const productos = await Producto.find({ $text: { $search: texto } }).limit(10);

            return productos;
        }
    },
    Mutation: {
        nuevoUsuario: async (_, { input } ) => {
            
            const { email, password } = input;

            // Revisar si el usuario ya está registrado
            const existeUsuario = await Usuario.findOne({email});
            if (existeUsuario) {
                throw new Error('El usuario ya está registrado');
            }

            // Hashear su password
            const salt = await bcryptjs.genSalt(10);
            input.password = await bcryptjs.hash(password, salt);

            try {
                // Guardarlo en la DB
                const usuario = new Usuario(input);
                usuario.save(); // guardarlo
                return usuario;
            } catch (error) {
                console.log(error);
            }
        },
        autenticarUsuario: async (_, {input}) => {

            const { email, password } = input
            // Si el usuario existe
            const existeUsuario = await Usuario.findOne({email});
            if (!existeUsuario) {
                throw new Error('El usuario no existe');
            }

            // Revisar si el password es correcto
            const passwordCorrecto = await bcryptjs.compare(password, existeUsuario.password );
            if(!passwordCorrecto) {
                throw new Error('El password es incorrecto')
            }

            // const expira = {expira: Math.floor(Date.now() / 1000)}

            // await Usuario.findOneAndUpdate({ _id : existeUsuario._id }, expira, { new: true})
            
            // Crear el token
            return {
                token: crearToken(existeUsuario, process.env.SECRETA, '24h' )
            }
        },
        actualizarUsuario: async (_, {id, input}) => { // Función agregada por mí

            // Revisar si el usuario que se desea editar, existe
            let existeUsuario = await Usuario.findById(id);

            if (!existeUsuario) {
                throw new Error('Usuario no encontrado');
            }

            // guardarlo en la DB
            usuario = await Usuario.findOneAndUpdate({ _id : id }, input, { new: true });

            return usuario;
        },
        actualizarUsuarioPassword: async (_, {id, input}) => { // Función agregada por mí

            const { password } = input;

            // Revisar si el usuario que desea cambiar el password existe
            let existeUsuario = await Usuario.findById(id);

            if (!existeUsuario) {
                throw new Error('Usuario no encontrado');
            }

            // Hashear su password
            const salt = await bcryptjs.genSalt(10);
            input.password = await bcryptjs.hash(password, salt);

            // guardarlo en la DB
            await Usuario.findOneAndUpdate({ _id : id }, input, { new: true });

            return "Contraseña modificada con éxito";

        },
        actualizarUsuarioEmail: async (_, {id, input}) => { // Función agregada por mí
            
            const { email } = input;

            // Revisar si el usuario que desea cambiar el email existe
            let existeUsuario = await Usuario.findById(id);
            if (!existeUsuario) {
                throw new Error('Usuario no encontrado');
            }

            // Revisar si el correo que se introducirá ya está en uso            
            const existeEmail = await Usuario.findOne({email});
            if (existeEmail) {
                throw new Error('Este email ya está en uso');
            }

            // guarlarlo en la DB
            await Usuario.findOneAndUpdate({ _id : id }, input, { new: true })

            return "Email modificado con éxito";
        },
        eliminarUsuario: async (_, {id}, ctx) => {
            // Verificar si existe o no
            let usuario = await Usuario.findById(id);

            if(!usuario) {
                throw new Error('Usuario no encontrado');
            }
            
            // Verificar si quien elimina es administrador
            if(ctx.usuario.tipo != 3 ) {
                throw new Error('No tiene las credenciales para acceder a esa información')
            }

            // Verificar si el usuario a eliminar no es el mismo que está logueado
            if(usuario.id.toString() === ctx.usuario.id) {
                throw new Error('No puedes eliminar tu propio usuario');
            }

            // Verificar si el usuario tiene pedidos
            let usuarioPedido = await Pedido.find({ vendedor: usuario.id })

            if(usuarioPedido.length !== 0) {
                throw new Error('Usuario asociado a un pedido. Elimine dicho pedido antes de eliminar al usuario');
            }

            // Eliminar Usuario
            await Usuario.findOneAndDelete({_id : id});
            return "Usuario Eliminado";
        },
        nuevaEmpresa: async (_, { input }) => {  

            try {
                const empresa = new Empresa(input);

                // Guardarlo en la DB
                const resultado = await empresa.save();
                return resultado;
                
            } catch (error) {
                console.log(error);
            }
        },
        actualizarEmpresa: async (_, {id, input}, ctx) => {
            // Verificar si existe o no
            let empresa = await Empresa.findById(id);

            if(!empresa) {
                throw new Error('Empresa no encontrada');
            }

            // Verificar si el vendedor pertenece a esa empresa o si es administrador
            if(empresa.id.toString() !== ctx.usuario.empresa && ctx.usuario.tipo != 3){
                throw new Error('No tiene las credenciales para acceder a esa información');
            }

            // guardar cambios en la DB
            empresa = await Empresa.findOneAndUpdate({_id : id}, input, {new: true});
            return empresa;
        },
        eliminarEmpresa: async (_, {id}, ctx) => {
            // Verificar si existe o no
            let empresa = await Empresa.findById(id);

            if(!empresa) {
                throw new Error('Empresa no encontrada');
            }

            // Verificar si quien elimina es administrador
            if(ctx.usuario.tipo != 3) {
                throw new Error('No tiene las credenciales para acceder a esa información')
            }

            // Verificar si la empresa tiene pedidos
            let empresaPedido = await Pedido.find({ empresa: empresa.id })

            if(empresaPedido.length !== 0) {
                throw new Error('Empresa asociada a un pedido. Elimine dicho pedido antes de eliminar la empresa');
            }

            // Verificar si la empresa tiene clientes
            let empresaCliente = await Cliente.find({ empresa: empresa.id })

            if(empresaCliente.length !== 0) {
                throw new Error('Empresa asociada a un cliente. Elimine dicho cliente antes de eliminar la empresa');
            }

            // Verificar si la empresa tiene productos
            let empresaProducto = await Producto.find({ empresa: empresa.id })

            if(empresaProducto.length !== 0) {
                throw new Error('Empresa asociada a un producto. Elimine dicho producto antes de eliminar la empresa');
            }

            // Verificar si la empresa tiene vendedores
            let empresaUsuario = await Usuario.find({ empresa: empresa.id })

            if(empresaUsuario.length !== 0) {
                throw new Error('Empresa asociada a un vendedor. Elimine dicho vendedor antes de eliminar la empresa');
            }

            // Eliminar empresa
            await Empresa.findOneAndDelete({_id : id});
            return "Empresa Eliminada";
        },
        nuevoProducto: async (_, {input}, ctx) => {
            try {
                const producto = new Producto(input);

                producto.empresa = ctx.usuario.empresa;                

                // almacenar en la BD
                const resultado = await producto.save();
                return resultado;

            } catch (error) {
                console.log(error);
            }
        },
        actualizarProducto: async (_, {id, input}) => {
            // revisar si el producto existe o no
            let producto = await Producto.findById(id);

            if(!producto) {
                throw new Error('Producto no encontrado');
            }

            // guardarlo en la DB
            producto = await Producto.findOneAndUpdate({ _id : id }, input, { new: true });

            return producto;
        },
        eliminarProducto: async (_, {id}) => {
            // revisar si el producto existe o no
            let producto = await Producto.findById(id);
            
            if(!producto) {
                throw new Error('Producto no encontrado');
            }

            // Verificar si el producto está asociado a algún pedido
            // Sintaxis para buscar un elemento dentro de un objeto que esté en un arreglo
            let productoPedido = await Pedido.find({ "pedido.id": producto.id.toString() });

            if(productoPedido.length !== 0) {
                throw new Error('Producto asociado a un pedido. Elimine dicho pedido antes de eliminar el producto');
            }

            // Eliminar
            await Producto.findOneAndDelete({_id : id});

            return "Producto Eliminado";
        },
        nuevoCliente: async (_, { input }, ctx) => {

            const { email } = input;
            // Verificar si el cliente ya está registrado
            // console.log(input);

            /**
            
            const cliente = await Cliente.findOne({ email });
            if(cliente) {
                throw new Error('Este correo ya está en uso');
            }

            */

            const nuevoCliente = new Cliente(input);

            // asignar el vendedor
            nuevoCliente.vendedor = ctx.usuario.id;

            // asignar la empresa a la que el vendedor forma parte
            nuevoCliente.empresa = ctx.usuario.empresa;

            // guardarlo en la DB
            
            try {
                const resultado = await nuevoCliente.save();
                return resultado;
            } catch (error) {
                console.log(error);
            }
        },
        actualizarCliente: async (_, {id, input}, ctx) => {
            // Verificar si existe o no
            let cliente = await Cliente.findById(id);

            if(!cliente) {
                throw new Error('Este cliente no existe');
            }

            // Verificar si el vendedor que lo creó es quien edita
            /**
            if(cliente.vendedor.toString() !== ctx.usuario.id ) {
                throw new Error('No tiene las credenciales para acceder a esa información');
            }
             */

            // guardar el cliente
            cliente = await Cliente.findOneAndUpdate({_id : id}, input, {new: true} );
            return cliente;
        },
        eliminarCliente : async (_, {id}, ctx) => {
            // Verificar si existe o no
            let cliente = await Cliente.findById(id);

            if(!cliente) {
                throw new Error('Este cliente no existe');
            }

            // Verificar si el cliente pertenece a la misma empresa que el vendedor            
            if(cliente.empresa.toString() !== ctx.usuario.empresa ) {
                throw new Error('No tiene las credenciales para acceder a esa información');
            }

            // Verificar si el cliente está asociado a algún pedido
            let clientePedido = await Pedido.find({ cliente: cliente.id.toString() });

            if(clientePedido.length !== 0) {
                throw new Error('Cliente asociado a un pedido. Elimine dicho pedido antes de eliminar al cliente');
            }

            // Eliminar Cliente
            await Cliente.findOneAndDelete({_id: id});
            return "Cliente Eliminado";
        },
        nuevoPedido: async (_, {input}, ctx) => {

            const { cliente } = input
            
            // Verificar si el cliente existe o no
            let clienteExiste = await Cliente.findById(cliente);

            if(!clienteExiste) {
                throw new Error('Ese cliente no existe');
            }

            // Verificar si el cliente es del vendedor

                /*
                    No verificaré si el cliente es del vendedor,
                    para que a futuro, yo pueda realizar filtrado
                    en el front-end según el vendedor que creó al 
                    cliente, o la empresa que a la cual pertenece
                    el vendedor            
                
                if(clienteExiste.vendedor.toString() !== ctx.usuario.id ) {
                    throw new Error('No tienes las credenciales para acceder a esa información');
                }
                
                */

            // Revisar que el stock esté disponible
            for await ( const articulo of input.pedido ) {
                const { id } = articulo;

                const producto = await Producto.findById(id);                

                if(articulo.cantidad > producto.existencia) {
                    throw new Error(`El artículo "${producto.nombre}" excede la cantidad disponible`);
                    
                } else {
                    // Restar la cantidad a lo disponible
                    producto.existencia = producto.existencia - articulo.cantidad

                    await producto.save();
                }
            }

            // Crear un nuevo pedido
            const nuevoPedido = new Pedido(input);

            // Asignarle un vendedor
            nuevoPedido.vendedor = ctx.usuario.id;

            // Asignarle la empresa a la cual pertenece el vendedor
            nuevoPedido.empresa = ctx.usuario.empresa;

            // Guardarlo en la DB
            const resultado = await nuevoPedido.save();
            return resultado;
        },
        actualizarPedido: async(_, {id, input}, ctx) => {

            const { cliente } = input;
            // console.log(input)

            // Si el pedido existe
            let existePedido = await Pedido.findById(id);
            if(!existePedido) {
                throw new Error('El pedido no existe');
            }

            // Si el cliente existe
            const existeCliente = await Cliente.findById(cliente);
            if(!existeCliente) {
                throw new Error('El cliente no existe');
            }
                
            // Si el cliente y pedido pertenece a la empresa     
            if(existeCliente.empresa.toString() !== ctx.usuario.empresa ) {
                throw new Error('No tiene las credenciales para acceder a esa información');
            }

            // Revisar el stock de productos
            if( input.pedido ) {
                for await ( const articulo of input.pedido ) {
                    const { id } = articulo;
                    
                    const producto = await Producto.findById(id);
    
                    if(articulo.cantidad > producto.existencia) {
                        throw new Error(`El articulo: '${producto.nombre}' excede la cantidad disponible`);
                    } else {

                        /**
                         * sintaxis modificada en el cálculo de la existencia 
                         * de stock según los artículos añadidos al pedido
                         */
                        // Restar la cantidad a lo disponible
                        const cantidadAnterior = pedido.pedido.find(item => item.id === id).cantidad;
                        
                        producto.existencia = producto.existencia + cantidadAnterior - articulo.cantidad;
    
                        await producto.save();
                    }
                }
            } 

            if(input.estado === 'ANULADO') {

                let pedido = await Pedido.findById(id);
                for await ( const articulo of pedido.pedido ) {

                    const producto = await Producto.findById(articulo.id);
                    // console.log(articulo)
                    
                    if(!pedido) {
                        throw new Error('El pedido no existe');
                    }
                    
                    const cantidadAnterior = pedido.pedido.find(item => item.id === articulo.id).cantidad;

                    producto.existencia = producto.existencia + cantidadAnterior;

                    await producto.save();
                }
            }
            

            // Guardar el pedido
            const resultado = await Pedido.findOneAndUpdate({_id: id}, input, { new: true });
            return resultado;
        },
        actualizarNotaPedido: async (_, {id, input}, ctx) => {
            // Verificar si el pedido existe o no
            const pedido = await Pedido.findById(id);
            if(!pedido) {
                throw new Error('El pedido no existe')
            }

            // Verificar si el vendedor que lo creó es quien intenta editar, también si es supervisor o administrador
            if(pedido.vendedor.toString() !== ctx.usuario.id) {
                if(ctx.usuario.tipo != 2 || ctx.usuario.tipo != 3) {
                    throw new Error('No tienes las credenciales para acceder a esa información')
                }
            }

            // Actualizar nota del pedido seleccionado
            await Pedido.findOneAndUpdate({ _id : id }, input, { new: true });
        },
        eliminarPedido: async (_, {id}, ctx) => {
            // Verificamos si el pedido existe o no
            let pedido = await Pedido.findById(id);
            if(!pedido) {
                throw new Error('El pedido no existe')
            }

            // Verificar si el vendedor posee privilegios para eliminar pedidos
            if(ctx.usuario.tipo == 1 ) {
                throw new Error('No tienes las credenciales para acceder a esa información')
            }

            // Eliminar de la DB
            await Pedido.findOneAndDelete({_id: id});
            return "Pedido eliminado";
        }
    }
}

module.exports = resolvers;