const Pool = require('pg').Pool

const DB_HOST = process.env.DB_HOST || 'chp202304db.c2fc27t7knic.us-east-2.rds.amazonaws.com'
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
        'SELECT distinct clave, nombre_sucursal '
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
        'SELECT DISTINCT ep.id as idEspecialidad,ep.nombre,ep.ingredientes '
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
        'SELECT id_especialidad_pizza,r.id_tamanio_pizza,t.nombre,r.precio '
        +'FROM preesppropro.relacion_especialidad_tamanio_precio_sucursal AS r,'
        +'preesppropro.sucursal as s, preesppropro.tamanio_pizza as t '
        +'WHERE s.id=r.id_sucursal and r.id_tamanio_pizza=t.id ' 
        +'AND s.clave=$1 '
        +'AND id_especialidad_pizza=$2',
        [cve_sucursal,id_especialidad], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        }
    )
}


const getProductosBySucursal = (request, response) => {
    const cve_sucursal = request.params.cve_sucursal
    pool.query(
        'SELECT pro.id, descripcion, tamanio,rs.precio_normal '
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
        'SELECT distinct pt.id,pt.descripcion '
        +'FROM preesppropro.relacion_producto_sucursal as rps,'
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
        'SELECT p.descripcion,p.tamanio,rps.precio_normal '
        +'FROM preesppropro.producto as p,'
        +'preesppropro.producto_tipo as pt,'
        +'preesppropro.sucursal as s,'
        +'preesppropro.relacion_producto_sucursal as rps '
        +'WHERE p.id_tipo_producto=pt.id '
        +'and rps.id_sucursal=s.id and s.clave=$1 '
        +'and rps.id_producto=p.id '
        +' and pt.id=$2',
        [cve_sucursal], (error, results) => {
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
    getProductosByTipoProductoBySucursal
}
