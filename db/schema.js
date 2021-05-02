const { gql } = require('apollo-server');

// Schema
const typeDefs = gql`

    type Usuario {
        id: ID
        nombre: String
        apellido: String
        email: String
        empresa: Empresa
        creado: Float
        habilitado: String
        tipo: String
        expira: Float
    }

    #
    # Type para el resolver "obtenerUsuario", utilizado para
    # mostrar la información en el token
    #
    type UsuarioSimple {
        id: ID
        nombre: String
        apellido: String
        email: String
        empresa: ID
        creado: Float
        habilitado: String
        tipo: String
        expira: Float
    }

    type Token {
        token: String
    }

    type Empresa {
        id: ID
        nombre: String
        rif: String
        direccion: String
        telefono: String
        email: String        
        creado: Float
    }

    type Producto {
        id: ID
        nombre: String
        existencia: Int
        precio: Float
        empresa: ID
        creado: Float
    }

    type Cliente {
        id: ID
        nombre: String
        apellido: String
        ci: String
        direccion: String        
        email: String
        telefono: String
        empresa: ID
        vendedor: ID
    }

    type Pedido {
        id: ID
        pedido: [PedidoGrupo]
        total: Float
        nota: String
        creado: Float
        cliente: Cliente
        vendedor: ID
        empresa: ID
        fecha: String
        estado: EstadoPedido
    }

    # type Pedido {
    #     id: ID
    #     pedido: [PedidoGrupo]
    #     total: Float
    #     nota: String
    #     creado: Float
    #     cliente: Cliente
    #     vendedor: Usuario
    #     empresa: ID
    #     fecha: String
    #     estado: EstadoPedido
    # }

    type PedidoGrupo {
        id: ID
        cantidad: Int
        nombre: String
        precio: Float
    }

    type TopCliente {
        total: Float
        cliente: [Cliente]
    }

    type TopVendedor {
        total: Float
        vendedor: [UsuarioSimple]
    }

    input UsuarioInput {
        nombre: String!
        apellido: String!
        email: String!
        password: String!
    }
    
    input UsuarioInputActualizar {
        nombre: String
        apellido: String
        empresa: ID
        tipo: String
        habilitado: String
        
    }

    input UsuarioInputPassword {
        password: String!
    }

    input UsuarioInputEmail {
        email: String!
    }

    input AutenticarInput {
        email: String!
        password: String!
    }

    input EmpresaInput {
        nombre: String!
        rif: String
        direccion: String
        telefono: String
        email: String
    }

    input ProductoInput {
        nombre: String!
        existencia: Int!
        precio: Float!
    }

    input ClienteInput {
        nombre: String!
        apellido: String!
        ci: String
        direccion: String
        email: String
        telefono: String
        empresa: ID
    }

    input PedidoProductoInput {
        id: ID
        cantidad: Int
        nombre: String
        precio: Float
    }

    input PedidoInput {
        pedido: [PedidoProductoInput]
        total: Float
        nota: String
        cliente: ID
        estado: EstadoPedido
    }

    input PedidoInputActualizar {        
        nota: String
    }

    enum EstadoPedido {
        PENDIENTE
        COMPLETADO
        ANULADO
    }

    type Query {
        # Usuarios
        obtenerUsuario: UsuarioSimple
        obtenerUsuarioCompleto: Usuario
        obtenerUsuarios: [Usuario]
        obtenerUsuariosConEmpresa: [Usuario]
        obtenerUsuariosSinEmpresa: [Usuario]
        obtenerUsuarioPorId(id: ID!) : UsuarioSimple

        # Empresa
        obtenerEmpresas: [Empresa]
        obtenerEmpresa(id: ID!) : Empresa

        # Productos
        obtenerProductos: [Producto]        
        obtenerProductosEmpresa: [Producto]
        obtenerProducto(id: ID!) : Producto
        totalProductosEmpresa: String

        # Clientes
        obtenerClientes(limite: Int, offset: Int): [Cliente]
        obtenerClientesVendedor: [Cliente]
        obtenerClientesEmpresa: [Cliente]
        obtenerCliente(id: ID!): Cliente
        totalClientesEmpresa: String

        # Pedidos
        obtenerPedidos: [Pedido]
        obtenerPedidosVendedor: [Pedido]
        obtenerPedidosEmpresa: [Pedido]
        obtenerPedido(id: ID!) : Pedido
        obtenerPedidosEstado(estado: String!): [Pedido]
        obtenerPedidosCliente(id: ID!) : [Pedido]
        totalPedidosEmpresa: String

        # Búsquedas Avanzadas
        mejoresClientes: [TopCliente]
        mejoresClientesEmpresa: [TopCliente]
        mejoresDeudoresEmpresa: [TopCliente]
        mejoresVendedores: [TopVendedor]
        mejoresVendedoresEmpresa: [TopVendedor]
        buscarProducto(texto: String!) : [Producto]
    }

    type Mutation {
        # Usuarios
        nuevoUsuario(input: UsuarioInput) : Usuario
        autenticarUsuario(input: AutenticarInput) : Token
        actualizarUsuario( id: ID!, input: UsuarioInputActualizar ): UsuarioSimple # agregado por mí
        actualizarUsuarioPassword( id: ID!, input: UsuarioInputPassword ): String # agregado por mí
        actualizarUsuarioEmail( id: ID!, input: UsuarioInputEmail ): String # agregado por mí
        eliminarUsuario(id: ID!) : String

        # Empresas
        nuevaEmpresa(input: EmpresaInput) : Empresa
        actualizarEmpresa(id: ID!, input: EmpresaInput) : Empresa
        eliminarEmpresa(id: ID!) : String

        # Productos
        nuevoProducto(input: ProductoInput) : Producto
        actualizarProducto( id: ID!, input: ProductoInput) : Producto
        eliminarProducto( id: ID! ) : String

        # Clientes
        nuevoCliente(input: ClienteInput) : Cliente
        actualizarCliente(id: ID!, input: ClienteInput): Cliente
        eliminarCliente(id: ID!) : String

        # Pedidos
        nuevoPedido(input: PedidoInput): Pedido
        actualizarPedido(id: ID!, input: PedidoInput ) : Pedido
        actualizarNotaPedido(id: ID!, input: PedidoInputActualizar ) : Pedido
        eliminarPedido(id: ID!) : String        
    }
`;

module.exports = typeDefs;