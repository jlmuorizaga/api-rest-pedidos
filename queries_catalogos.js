const Pool = require('pg').Pool;

const DB_HOST = process.env.DB_HOST || 'database-1.cgujpjkz4fsl.us-west-1.rds.amazonaws.com'
const DB_USER = process.env.DB_USER || 'cheesepizzauser'
const DB_PASSWORD = process.env.DB_PASSWORD || 'cheesepizza2001'
const DB_NAME = process.env.DB_NAME || 'chppreciosespecprodpromocdb'
const DB_PORT = process.env.DB_PORT || 5432

//Pool de conexiones a base de datos
const pool = new Pool({
    user: DB_USER,
    host: DB_HOST,
    database: DB_NAME,
    password: DB_PASSWORD,
    port: DB_PORT,
	ssl:{
            rejectUnauthorized:false,
        },
        
})



const getSucursales = (request, response) => {
    pool.query(
        'SELECT distinct clave, nombre_sucursal as "nombreSucursal",domicilio,hora_inicio as "horaInicio",hora_fin as "horaFin", '
        +'latitud, longitud, id_lugar as "idLugar", venta_activa as "ventaActiva", pk as "stripePublicKey" '
        +'FROM preesppropro.sucursal as suc, '
        +'preesppropro.relacion_especialidad_tamanio_precio_sucursal as relespec,'
        +'preesppropro.relacion_producto_sucursal as relprod '
        +'WHERE suc.id=relespec.id_sucursal or suc.id=relprod.id_sucursal '
        +'order by clave',
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        }
    )
}

const getEspecialidadesBySucursal = (request, response) => {
    const cve_sucursal = request.params.cve_sucursal
    pool.query(
        'SELECT DISTINCT ep.id as "idEspecialidad",ep.nombre,ep.ingredientes,ep.img_url as "imgUrl",'
        +'ep.aplica_2x1 as "aplica2x1",ep.aplica_p1 as "aplicaP1" '
        +'FROM preesppropro.especialidad_pizza as ep, '
        +'preesppropro.relacion_especialidad_tamanio_precio_sucursal as re,'
        +'preesppropro.sucursal as s '
        +'WHERE ep.id=re.id_especialidad_pizza '
        +'AND s.id=re.id_sucursal and s.clave=$1 '
        +'ORDER BY ep.nombre',
        [cve_sucursal], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        }
    )
}

const getTamaniosBySucursal = (request, response) => {
    const cve_sucursal = request.params.cve_sucursal
    const id_especialidad = request.params.id_especialidad
    pool.query(
        'SELECT id_especialidad_pizza as "idEspecialidadPizza",r.id_tamanio_pizza as "idTamanioPizza",t.nombre,r.precio,r.aplica_2x1 as "aplica2x1", ' 
        + 'r.aplica_p1 as "aplicaP1", r.precio_p1 as "precioP1", r.aplica_bebida_chica_gratis as "aplicaBebidaChicaGratis" '
        +'FROM preesppropro.relacion_especialidad_tamanio_precio_sucursal AS r,'
        +'preesppropro.sucursal as s, preesppropro.tamanio_pizza as t '
        +'WHERE s.id=r.id_sucursal and r.id_tamanio_pizza=t.id ' 
        +'AND s.clave=$1 '
        +'AND id_especialidad_pizza=$2',
        [cve_sucursal,id_especialidad], (error, results) => {
            if (error) {
                throw error
            }
            results.rows.forEach(element => {
                element.precio = Number(element.precio);
                element.precioP1 = Number(element.precioP1);
            });
            response.status(200).json(results.rows)
        }
    )
}


const getProductosBySucursal = (request, response) => {
    const cve_sucursal = request.params.cve_sucursal
    pool.query(
        'SELECT pro.id, descripcion, tamanio,usa_salsa as "usaSalsa", rs.precio_normal as "precioNormal" '
        +'FROM preesppropro.producto as pro,'
        +'preesppropro.relacion_producto_sucursal as rs,'
        +'preesppropro.sucursal as s '
        +'WHERE pro.id=rs.id_producto AND rs.id_sucursal=s.id '
        +'AND s.clave=$1 ' 
        +'ORDER BY descripcion,tamanio',
        [cve_sucursal], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        }
    )
}

const getTipoProductosBySucursal = (request, response) => {
    const cve_sucursal = request.params.cve_sucursal
    pool.query(
        'SELECT distinct pt.id,pt.descripcion,pt.img_url as "imgUrl" '
        +'FROM preesppropro.relacion_producto_sucursal as rps, '
        +'preesppropro.sucursal as s,'
        +'preesppropro.producto as p,'
        +'preesppropro.producto_tipo as pt '
        +'where rps.id_sucursal=s.id and s.clave=$1 '
        +'and rps.id_producto=p.id '
        +'and p.id_tipo_producto=pt.id '
        +'ORDER BY descripcion',
        [cve_sucursal], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        }
    )
}

const getProductosByTipoProductoBySucursal = (request, response) => {
    const cve_sucursal = request.params.cve_sucursal
    const id_tipo_producto = request.params.id_tipo_producto
    pool.query(
        'SELECT p.id, p.descripcion,p.tamanio,p.usa_salsa as "usaSalsa", '
        +'rps.precio_normal as "precioNormal", rps.aplica_bebida_chica_gratis as "aplicaBebidaChicaGratis" '
        +'FROM preesppropro.producto as p,'
        +'preesppropro.producto_tipo as pt,'
        +'preesppropro.sucursal as s,'
        +'preesppropro.relacion_producto_sucursal as rps '
        +'WHERE p.id_tipo_producto=pt.id '
        +'and rps.id_sucursal=s.id and s.clave=$1 '
        +'and rps.id_producto=p.id '
        +' and pt.id=$2',
        [cve_sucursal,id_tipo_producto], (error, results) => {
            if (error) {
                throw error
            }
            results.rows.forEach(element => {
                element.precioNormal = Number(element.precioNormal);
            });
            response.status(200).json(results.rows)
        }
    )
}

const getSucursalesAll = (request, response) => {
    pool.query(
        'SELECT *  '
        +'FROM preesppropro.sucursal '
        +'order by clave',
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        }
    )
}

const getPromocionesBySucursal = (request, response) => {
    const cve_sucursal = request.params.cve_sucursal
    pool.query(
        'SELECT DISTINCT cpe.id as "idPromocionEspecial",cpe.definicion '
        +'FROM preesppropro.catalogo_promocion_especial as cpe, '
        +'preesppropro.relacion_promocion_especial_sucursal as re, '
        +'preesppropro.sucursal as s '
        +'WHERE cpe.id=re.id_promocion '
        +'AND s.id=re.id_sucursal and s.clave=$1 and re.activa=\'S\' '
        +'ORDER BY cpe.definicion',

        [cve_sucursal], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        }
    )
}

const getSalsasBySucursal = (request, response) => {
    const cve_sucursal = request.params.cve_sucursal
    pool.query(
        'SELECT salsa.id, salsa.descripcion '
        +'FROM preesppropro.salsa as salsa,'
        +'preesppropro.relacion_salsa_sucursal as rs,'
        +'preesppropro.sucursal as s '
        +'WHERE salsa.id=rs.id_salsa AND rs.id_sucursal=s.id '
        +'AND s.clave=$1 ' 
        +'ORDER BY descripcion',
        [cve_sucursal], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        }
    )
}


const getLugaresAll = (request, response) => {
    pool.query(
        'SELECT DISTINCT(l.id), nombre '
	    +'FROM preesppropro.lugar as l, preesppropro.sucursal as s '
	    +'WHERE l.id=s.id_lugar '
	    +'ORDER BY nombre ASC',
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        }
    )
}

module.exports = {
    getSucursales,
    getEspecialidadesBySucursal,
    getTamaniosBySucursal,
    getProductosBySucursal,
    getTipoProductosBySucursal,
    getProductosByTipoProductoBySucursal,
    getSucursalesAll,
    getPromocionesBySucursal,
    getSalsasBySucursal,
    getLugaresAll
}
