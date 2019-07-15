const Pool = require('pg').Pool
const pool = new Pool({
  user: 'user',
  database: 'db',
  password: 'pass',
  host: 'postgres',
  port: 5432
})

const length = 'array_length(path,1)-1'  //length of the actual path -1, to identify the parent and also the actual height

//GET method to list all nodes
const getNodes = (request, response) => {
  pool.query('SELECT id, path[1] AS root, path['+length+'] as parent, '+length+' as height FROM nodes;', (error, results) => {
    if (error) {
      throw error
    }
      response.status(200).json(results.rows)
  })
}

//GET method to get the info of a node
const getNodeById = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('SELECT id, path[1] AS root, path['+length+'] as parent, '+length+' as height FROM nodes WHERE id=$1;', [id], (error, results) => {
    if (error) {
      throw error
    }else{
      if(results.rows.length > 0){
        response.status(200).json(results.rows)
      }else{
        response.status(200).send('Given node does not exist! Please provide an existing one!!')
      }
    }
  })
}

//GET method to list all children of specific node
const getChildrenById = (request, response) => {
  const id = parseInt(request.params.id)
  var depth;

  pool.query('SELECT array_length(path,1) as depth FROM nodes WHERE id = $1;', [id], (error, results) => {
    if (error) {
      throw error
    }else{
      if(results.rows.length > 0){
        depth = results.rows[0].depth + 1 // we know there is only one match  - children would be in +1 position and only!!!!
        pool.query( 'SELECT id, path[1] AS root, path['+length+'] as parent, '+length+' height FROM nodes WHERE ((path && ARRAY[$1]::integer[]) AND (array_length(path,1) = $2));',[id,depth],function(error,results) {
          if(error){
            throw error
          }else{
            response.status(200).json(results.rows)
          }
        })
      }else{
        response.status(200).send('Given node does not exist! Please provide an existing one!!')
      }
    }
  })
}

//GET method to list all descendants of specific node
const getDescendantsById = (request, response) => {
  const id = parseInt(request.params.id)

  pool.query('SELECT id, path[1] AS root, path['+length+'] as parent, '+length+' as height FROM nodes WHERE path && ARRAY[$1]::integer[];', [id], (error, results) => {
    if (error) {
      throw error
    }else{
      if(results.rows.length > 0){
        response.status(200).json(results.rows)
      }else{
        response.status(200).send('Given node does not exist! Please provide an existing one!!')
      }
    }
  })
}

//PUT method to update existing node and move it under new parent
const updateNode = (request, response) => {
  const id = parseInt(request.params.id)
  const { new_parent } = request.body
  var new_parent_path,given_node_depth

  //get the path of the new parent
  pool.query('SELECT path FROM nodes WHERE id = $1;',[new_parent],function(error,results) {
    if(error){
      throw error
    }else{
      if(results.rows.length > 0){
        new_parent_path = results.rows[0].path; // there is only one match
        //get the depth of the given_node
        pool.query('SELECT array_length(path,1) as depth FROM nodes WHERE id = $1;',[id],function(error,results) {
          if(error){
            throw error
          }else{
            if(results.rows.length > 0){
              given_node_depth = results.rows[0].depth; // there is only one match
              //path of new parent and depth of given node are used to update
              pool.query('UPDATE nodes SET path = ARRAY['+new_parent_path+'] || path['+given_node_depth+':array_length(path,1)]::integer[] WHERE path && ARRAY[$1]::integer[];',[id],function(error,results) {
                if(error){
                  throw error
                }else{
                  console.log(`Node with ID: ${id} moved under parent with ID: ${new_parent}`)
                  response.status(200).send(`Node with ID: ${id} moved under parent with ID: ${new_parent}. You can check here: curl http://localhost:3000/node/${id}`)
                }
              })
            }else{
              console.log('Given node does not exist! Please provide an existing one!!')
              response.status(200).send('Given node does not exist! Please provide an existing one!!')
            }
          }
        })
      }else{
        console.log('Given parent node does not exist! Please provide an existing one!!')
        response.status(200).send('Given parent node does not exist! Please provide an existing one!!')
      }
    }
  })
}

//POST method to insert a new node
const createNode = (request, response) => {
  const { new_node, new_parent } = request.body

  if(new_parent == null){
    // insert  as root
    pool.query('INSERT INTO nodes VALUES ($1, ARRAY[$1]::integer[]) ON CONFLICT (id) DO NOTHING;',[new_node],function(error,results) {
      if(error){
        throw error
      }else{
        //new root node is added and we need to updade the rest of nodes
        pool.query( 'UPDATE nodes SET path = ARRAY[$1]::integer[] || path WHERE  $1 != ALL(path);',[new_node],function(error,results) {
          if(error){
            throw error
          }else{
            console.log('Insert successful!!')
            //the status of 201 is meant for the successful insert and NOT for the update of the rest of the nodes!!!!
            response.status(201).send(`Root Node with ID: ${new_node} is successfuly inserted.If you tried to insert an existing node, then the INSERT is not executed.ON CONFLICT we do nothing. You can check here: curl http://localhost:3000/node/${new_node}`)
          }
        })
      }
    })
  }else {
    //find the path of the father
    pool.query('SELECT path FROM nodes WHERE id = $1;',[new_parent],function(error,results) {
      if(error){
        throw error
      }else{
        if(results.rows.length > 0){
          parent_path = results.rows[0].path ;
          //insert as child to a parent
          pool.query('INSERT INTO nodes VALUES ($1, ARRAY['+parent_path+'] || ARRAY[$1]::integer[]) ON CONFLICT (id) DO NOTHING;',[new_node],function(error,results) {
            if(error){
              throw error
            }else{
              //new node is added
              console.log('Insert successful!!')
              response.status(201).send(`New Node with ID: ${new_node} is successfuly inserted.If you tried to insert an existing node, then the INSERT is not executed.ON CONFLICT we do nothing. You can check here: curl http://localhost:3000/node/${new_node}`)
            }
          })
        }else{
          console.log('Given parent node does not exist! Please provide an existing one!!')
          response.status(200).send('Given parent node does not exist! Please provide an existing one!!')
        }
      }
    })
  }
}

module.exports = {
  getNodes,
  getNodeById,
  getChildrenById,
  getDescendantsById,
  updateNode,
  createNode,
}
