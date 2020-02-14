var io = require('socket.io')();
var dbService = require('../db/service');
var { WS_EMIT_INTERVAL_MS } = require('../settings');

var clients = [];
var purchase_ids = [];

setInterval(() => {
  if(clients.length === 0) return;
  var mp = {};
  purchase_ids.forEach((purchase_id, i) => {
    if(mp[purchase_id] === undefined) {
      mp[purchase_id] = [];
    }
    mp[purchase_id].push(i);
  })
  Object.keys(mp).forEach(pid => {
    var ids = mp[pid];
    dbService(`
      SELECT w.user_id, w.purchase_id, w.wish_id, wp.quantity, wp.product_id
      FROM wish w
      JOIN wish_product wp ON wp.wish_id = w.wish_id
      WHERE w.purchase_id = ${pid}
      ORDER BY w.wish_id
    `).then(function(rows) {
      ids.forEach(id => {
        var client = clients[id];
        client.emit('data', { products: rows });
      });
    })
  });
}, WS_EMIT_INTERVAL_MS);

io.on('connection', (client) => {
  
  client.on('subscribeToData', (purchase_id) => {
    var index = clients.indexOf(client);
    if (index !== -1) {
      purchase_ids[index] = purchase_id;
    } else {
      clients.push(client);
      purchase_ids.push(purchase_id);
    }
  });

});

const port = 3037;
io.listen(port);
console.log('listening on port ', port);

module.exports = io;
