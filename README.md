# RESTful API with Node.js, Express and Postgres running in Docker

Create, read and update in a Node.js app with an Express server and Postgres database.
The app is running in Docker container.

## Getting Started 

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

## Prerequisites

To run this project, you need to have:

```
  Docker for Desktop
```
You can download here: https://www.docker.com/

## Installing and Running

* `git clone git@github.com:SoutisV/RESTful_api_Docker.git`
* `cd root_directory_of_project`
* `sudo docker-compose up --build`

The `sudo docker-compose up --build` will bring up the RESTful API and the Postgres database.

## Building details

In `docker-compose.yml` we set up two services named `api` and `postgres`.
The `api` is dependent on `postgres`.

In `docker-compose.yml` we also use a volume named `my_dbdata` for storing the database data.
Even if the container and image are deleted, the volume will remain unless explicitly deleted using
`sudo docker system prune --volumes`.

Also, during this very first build of the application, an initialization script is used for the db.
It is located again in `docker-compose.yml`, it is called `init.sql` and it runs only during the first build.
If you want to re-populate the Postgres db you have to delete the volume with
`sudo docker system prune --volumes` and bring up the project again with
`sudo docker-compose up`.

The state of the db after the `init.sql` looks like this:
[initial_state](https://github.com/SoutisV/RESTful_api_Docker/blob/master/init_db.png)

## GET Routes

* visit http://localhost:3000 , where also the README file is present.
  * `/nodes` , lists all available nodes
  * `/node/:id` , list info of specified node
  * `/children/:id` , list children of specified node
  * `/descendants/:id` , list all descendants of specified node

## Running GET requests

For my GET requests i used `postman` : https://www.getpostman.com/downloads/ .
Alternatively, you can visit in the web browser also the following URLs:
* `http://localhost:3000/nodes` , lists all available nodes
* `http://localhost:3000/node/9` , lists info regarding node 9
* `http://localhost:3000/children/3` , lists all children of node 3 (node6 and node7 of the initialized db)
* `http://localhost:3000/descendants/3` , lists all descendants of
 node3 (node3,node6,node7,node8,node9,node10,node11 and node12 of the initialized db).

The difference between `GET /children/:id` and `GET /descendants/:id` is that the first one returns
only the children of the specified node whereas the second one returns the children of a node together with all the descendants of the children of a node.  

You can also curl the requests from the terminal:
* `curl -v http://localhost:3000/nodes`
* `curl -v http://localhost:3000/node/9`
* `curl -v http://localhost:3000/children/3`
* `curl -v http://localhost:3000/descendants/3`

## PUT Route

* `/nodes/:id` , update an existing node and put it under a new parent.

It is worth noting that `PUT` is idempotent, meaning the exact same call can be made over and will
produce the same result. This is different that `POST`, in which the exact same call repeated will continuously
create new nodes.

Also, when a node is updated and moved under a new parent, it's descendants are also moved and dynamically
adjusted with new height.
Let's do our first update...

## Running our first PUT request

In case you want to use `postman`:
* URL: `http://localhost:3000/nodes/7`
* Method: `PUT`
* Body: `x-www-form-urlencoded`
* Body Key: `new_parent`
* Body Key Value: `8`

In case you want to use curl from terminal:
* `curl -v -X PUT -d "new_parent=8" http://localhost:3000/nodes/7`

This method will move node 7 and all it's descendants under node 8.
Heights will be adjusted.
Here is how it looks like now: [update_state](https://github.com/SoutisV/RESTful_api_Docker/blob/master/update_db.png)

You can check it:
* `curl -v http://localhost:3000/descendants/8`

## POST Route

* `/nodes` , will create a new node under an existing parent. If a new parent is not provided then,
the new node will be added as root.

## Running our first POST request

In case you want to use `postman`:
* URL: `http://localhost:3000/nodes`
* Method: `POST`
* Body: `x-www-form-urlencoded`
* Body Key: `new_node`
* Body Key Value for new_node: `13`
* Body Key: `new_parent`
* Body Key Value for new_parent: `8`

In case you want to use curl from terminal:
* `curl -v -d "new_node=13" -d "new_parent=8" http://localhost:3000/nodes`

This method will add a new node 13 under existing node 8.
Here is how it looks like now: [post_state](https://github.com/SoutisV/RESTful_api_Docker/blob/master/post_db.png)

You can check it:
* `curl -v http://localhost:3000/descendants/8`

## Running POST request for adding a new root

In case you want to use `postman`:
* URL: `http://localhost:3000/nodes`
* Method: `POST`
* Body: `x-www-form-urlencoded`
* Body Key: `new_node`
* Body Key Value for new_node: `55`

In case you want to use curl from terminal:
* `curl -v -d "new_node=55" http://localhost:3000/nodes`

As you can notice there is no body key `new_parent`. That means a new node 55 is added as root!

This method will add a new node 55 as root.
Here is how it looks like now: [root_state](https://github.com/SoutisV/RESTful_api_Docker/blob/master/root_db.png)

You can check it:
* `curl -v http://localhost:3000/descendants/55`  , which is the same as
* `curl -v http://localhost:3000/nodes`


## Docker commands that might come handy
All docker commands must be executed from the project directory.

* `sudo docker-compose up --build`  , run the project and build a new image
* `sudo docker-compose up `  , run the project without building a new image
* `sudo docker system prune --volumes` , deletes all volumes. Useful when you want to run the `init.sql` and re-populate the db with initial data.
* `sudo docker image prune -a`, remove all docker images
* `sudo docker container ls -a`, list all docker containers
* `sudo docker images -a`, list all docker images

Each time you want to run the project:
* `sudo docker-compose up `  , inside the project directory
