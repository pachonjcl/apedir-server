APEDIR
======

Database SQLite3 Schema
***********************

~~~
CREATE TABLE user(
  user_id integer primary key,
  email varchar(30),
  password varchar(64)
);
CREATE TABLE product (
  product_id integer primary key,
  name varchar(30),
  unit_price real
);
CREATE TABLE wish(
  wish_id integer primary key,
  user_id integer not null,
  purchase_id integer not null,
  FOREIGN KEY(user_id) REFERENCES user(user_id),
  FOREIGN KEY(purchase_id) REFERENCES purchase(purchase_id)
);
CREATE TABLE wish_product (
  quantity integer,
  product_id integer not null,
  wish_id integer not null,
  FOREIGN KEY(product_id) REFERENCES product(product_id),
  FOREIGN KEY(wish_id) REFERENCES wish(wish_id)
);
CREATE TABLE purchase_type (
  purchase_type_id integer primary key,
  name varchar(30)
);
CREATE TABLE purchase (
  purchase_id integer primary key,
  end_time date,
  initiator_id integer not null,
  purchase_type_id integer not null,
  FOREIGN KEY(initiator_id) REFERENCES user(user_id),
  FOREIGN KEY(purchase_type_id) REFERENCES purchase_type(purchase_type_id)
);
CREATE TABLE purchase_type_product (
  purchase_type_id integer not null,
  product_id integer not null,
  FOREIGN KEY(purchase_type_id) REFERENCES purchase_type(purchase_type_id),
  FOREIGN KEY(product_id) REFERENCES product(product_id)
);
~~~