# sequelize的基础用法

> 自己的博客接口用sequelize重构，总结下sequelize的基础用法

## 安装

数据库以mysql为例

```
// npm

npm install --save sequelize
npm install --save mysql2

// yarn

yarn add sequelize
yarn add mysql2
```

## 建立连接

Sequelize的连接需要传入参数，并且可以配置开启线程池、读写分库等操作。

简单的写法是这样的: `new Sequelize("表名","用户名","密码",配置)`

正常使用中很少使用到所有的参数，这里提供一个常用的模板，只需要修改自己使用的值即可。

```js
const sequelize = new Sequelize('database', 'username', 'password',  {
  host: 'localhost',    //数据库地址,默认本机
  port:'3306',
  dialect: 'mysql',
  pool: {   //连接池设置
    max: 5, //最大连接数
    min: 0, //最小连接数
    idle: 10000,
  },
});

```

详细配置参数

```js
const sequelize = new Sequelize('database', 'username', 'password', {
  // 数据库类型，支持: 'mysql', 'sqlite', 'postgres', 'mssql'
  dialect: 'mysql',
  // 自定义链接地址，可以是ip或者域名，默认本机：localhost
  host: 'my.server.tld',
  // 自定义端口，默认3306
  port: 12345,
  // postgres使用的参数,连接类型，默认：tcp
  protocol: null,
  // 是否开始日志，默认是用console.log
  // 建议开启，方便对照生成的sql语句
  logging: true,
  // 默认是空
  // 支持: 'mysql', 'postgres', 'mssql'
  dialectOptions: {
    socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock',
    supportBigNumbers: true,
    bigNumberStrings: true
  },
  // sqlite的存储位置,仅sqlite有用
  // - 默认 ':memory:'
  storage: 'path/to/database.sqlite',

  // 是否将undefined转化为NULL
  // - 默认: false
  omitNull: true,
  // pg中开启ssl支持
  // - 默认: false
  native: true,
  // 数据库默认参数,全局参数
  define: {
    underscored: false
    freezeTableName: false,
    charset: 'utf8',
    dialectOptions: {
      collate: 'utf8_general_ci'
    },
    timestamps: true
  },
  // 是否同步
  sync: { force: true },
  // 连接池配置
  pool: {
    max: 5,
    idle: 30000,
    acquire: 60000,
  },
  isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ
})
```

可以使用 `.authenticate()` 函数来测试连接

```js
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
```

## 定义模型对象

在使用之前一定要先创建模型对象。就是数据库中表的名称、使用到的字段、字段类型等。

如果数据库中已经建好了表，并且不能删除，这个时候就不能自动创建了，因为创建的时候会删除掉旧的数据。

模型使用 `sequelize.define('name', {attributes}, {options})` 来定义.

```js
const users = db.define('blog'/*自定义表名*/, {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,       //主键
      autoIncrement: true,    //自增
      comment: "自增id"       //注释:只在代码中有效
    },
    //用户名
    username: {
      type: Sequelize.STRING,
      validate:{
        isEmail: true,   //类型检测,是否是邮箱格式
      }
    },
    //密码
    pwd: {
      type: Sequelize.STRING(10),
      allowNull: false,//不允许为null
    },
    //状态
    status: {
      type: Sequelize.INTEGER,
      defaultValue: 0,//默认值是0
    },
    //昵称
    nickname: {
      type: Sequelize.STRING
    },
    //token
    token: {
      type: Sequelize.UUID
    },
    create_time: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
}, {
    //使用自定义表名
    freezeTableName: true,
    //去掉默认的添加时间和更新时间
    timestamps: false,
    indexes:[
	    //普通索引,默认BTREE
      {
        unique: true,
        fields: ['pid']
      },
    ]
});

//同步:没有就新建,有就不变
// users.sync();
//先删除后同步
users.sync({
    force: true
});
```

模型的数据类型

```js
Sequelize.STRING                      // VARCHAR(255)
Sequelize.STRING(1234)                // VARCHAR(1234)
Sequelize.STRING.BINARY               // VARCHAR BINARY
Sequelize.TEXT                        // TEXT
Sequelize.TEXT('tiny')                // TINYTEXT

Sequelize.INTEGER                     // INTEGER
Sequelize.BIGINT                      // BIGINT
Sequelize.BIGINT(11)                  // BIGINT(11)

Sequelize.FLOAT                       // FLOAT
Sequelize.FLOAT(11)                   // FLOAT(11)
Sequelize.FLOAT(11, 12)               // FLOAT(11,12)

Sequelize.REAL                        // REAL         仅限于PostgreSQL.
Sequelize.REAL(11)                    // REAL(11)     仅限于PostgreSQL.
Sequelize.REAL(11, 12)                // REAL(11,12)  仅限于PostgreSQL.

Sequelize.DOUBLE                      // DOUBLE
Sequelize.DOUBLE(11)                  // DOUBLE(11)
Sequelize.DOUBLE(11, 12)              // DOUBLE(11,12)

Sequelize.DECIMAL                     // DECIMAL
Sequelize.DECIMAL(10, 2)              // DECIMAL(10,2)

Sequelize.DATE                        // DATETIME 针对 mysql / sqlite, TIMESTAMP WITH TIME ZONE 针对 postgres
Sequelize.DATE(6)                     // DATETIME(6) 针对 mysql 5.6.4+. 小数秒支持多达6位精度
Sequelize.DATEONLY                    // DATE 不带时间.
Sequelize.BOOLEAN                     // TINYINT(1)

Sequelize.ENUM('value 1', 'value 2')  // 一个允许具有 “value 1” 和 “value 2” 的 ENUM
Sequelize.ARRAY(Sequelize.TEXT)       // 定义一个数组。 仅限于 PostgreSQL。
Sequelize.ARRAY(Sequelize.ENUM)       // 定义一个 ENUM 数组. 仅限于 PostgreSQL。

Sequelize.JSON                        // JSON 列. 仅限于 PostgreSQL, SQLite and MySQL.
Sequelize.JSONB                       // JSONB 列. 仅限于 PostgreSQL .

Sequelize.BLOB                        // BLOB (PostgreSQL 二进制)
Sequelize.BLOB('tiny')                // TINYBLOB (PostgreSQL 二进制. 其他参数是 medium 和 long)

Sequelize.UUID                        // PostgreSQL 和 SQLite 的 UUID 数据类型, CHAR(36) BINARY 针对于 MySQL (使用默认值: Sequelize.UUIDV1 或 Sequelize.UUIDV4 来让 sequelize 自动生成 ID)

Sequelize.CIDR                        // PostgreSQL 的 CIDR 数据类型
Sequelize.INET                        // PostgreSQL 的 INET 数据类型
Sequelize.MACADDR                     // PostgreSQL 的 MACADDR

Sequelize.RANGE(Sequelize.INTEGER)    // 定义 int4range 范围. 仅限于 PostgreSQL.
Sequelize.RANGE(Sequelize.BIGINT)     // 定义 int8range 范围. 仅限于 PostgreSQL.
Sequelize.RANGE(Sequelize.DATE)       // 定义 tstzrange 范围. 仅限于 PostgreSQL.
Sequelize.RANGE(Sequelize.DATEONLY)   // 定义 daterange 范围. 仅限于 PostgreSQL.
Sequelize.RANGE(Sequelize.DECIMAL)    // 定义 numrange 范围. 仅限于 PostgreSQL.

Sequelize.ARRAY(Sequelize.RANGE(Sequelize.DATE)) // 定义 tstzrange 范围的数组. 仅限于 PostgreSQL.

Sequelize.GEOMETRY                    // 空间列.  仅限于 PostgreSQL (具有 PostGIS) 或 MySQL.
Sequelize.GEOMETRY('POINT')           // 具有几何类型的空间列.  仅限于 PostgreSQL (具有 PostGIS) 或 MySQL.
Sequelize.GEOMETRY('POINT', 4326)     // 具有几何类型和SRID的空间列.  仅限于 PostgreSQL (具有 PostGIS) 或 MySQL.
```

## 查询

### 属性

想要只选择某些属性，可以使用 `attributes` 选项。 通常是传递一个数组

```js
Model.findAll({
  attributes: ['foo', 'bar']
});

// SELECT foo, bar FROM ...
```

属性可以使用嵌套数组来重命名:

```js
Model.findAll({
  attributes: ['foo', ['bar', 'baz']]
});

// SELECT foo, bar AS baz FROM ...
```

### 条件

传入一个 `where` 对象来过滤查询

```js
const Op = Sequelize.Op;

Post.findAll({
  where: {
    authorId: 2
  }
});
// SELECT * FROM post WHERE authorId = 2

Post.findAll({
  where: {
    authorId: 12,
    status: 'active'
  }
});
// SELECT * FROM post WHERE authorId = 12 AND status = 'active';

Post.findAll({
  where: {
    [Op.or]: [{authorId: 12}, {authorId: 13}]
  }
});
// SELECT * FROM post WHERE authorId = 12 OR authorId = 13;

Post.findAll({
  where: {
    authorId: {
      [Op.or]: [12, 13]
    }
  }
});
// SELECT * FROM post WHERE authorId = 12 OR authorId = 13;

Post.destroy({
  where: {
    status: 'inactive'
  }
});
// DELETE FROM post WHERE status = 'inactive';

Post.update({
  updatedAt: null,
}, {
  where: {
    deletedAt: {
      [Op.ne]: null
    }
  }
});
// UPDATE post SET updatedAt = null WHERE deletedAt NOT NULL;

Post.findAll({
  where: sequelize.where(sequelize.fn('char_length', sequelize.col('status')), 6)
});
// SELECT * FROM post WHERE char_length(status) = 6;
```

Sequelize 可用于创建更复杂比较的符号运算符

```js
const Op = Sequelize.Op

[Op.and]: {a: 5}           // 且 (a = 5)
[Op.or]: [{a: 5}, {a: 6}]  // (a = 5 或 a = 6)
[Op.gt]: 6,                // id > 6
[Op.gte]: 6,               // id >= 6
[Op.lt]: 10,               // id < 10
[Op.lte]: 10,              // id <= 10
[Op.ne]: 20,               // id != 20
[Op.eq]: 3,                // = 3
[Op.not]: true,            // 不是 TRUE
[Op.between]: [6, 10],     // 在 6 和 10 之间
[Op.notBetween]: [11, 15], // 不在 11 和 15 之间
[Op.in]: [1, 2],           // 在 [1, 2] 之中
[Op.notIn]: [1, 2],        // 不在 [1, 2] 之中
[Op.like]: '%hat',         // 包含 '%hat'
[Op.notLike]: '%hat'       // 不包含 '%hat'
[Op.iLike]: '%hat'         // 包含 '%hat' (不区分大小写)  (仅限 PG)
[Op.notILike]: '%hat'      // 不包含 '%hat'  (仅限 PG)
[Op.regexp]: '^[h|a|t]'    // 匹配正则表达式/~ '^[h|a|t]' (仅限 MySQL/PG)
[Op.notRegexp]: '^[h|a|t]' // 不匹配正则表达式/!~ '^[h|a|t]' (仅限 MySQL/PG)
[Op.iRegexp]: '^[h|a|t]'    // ~* '^[h|a|t]' (仅限 PG)
[Op.notIRegexp]: '^[h|a|t]' // !~* '^[h|a|t]' (仅限 PG)
[Op.like]: { [Op.any]: ['cat', 'hat']} // 包含任何数组['cat', 'hat'] - 同样适用于 iLike 和 notLike
[Op.overlap]: [1, 2]       // && [1, 2] (PG数组重叠运算符)
[Op.contains]: [1, 2]      // @> [1, 2] (PG数组包含运算符)
[Op.contained]: [1, 2]     // <@ [1, 2] (PG数组包含于运算符)
[Op.any]: [2,3]            // 任何数组[2, 3]::INTEGER (仅限PG)

[Op.col]: 'user.organization_id' // = 'user'.'organization_id', 使用数据库语言特定的列标识符, 本例使用 PG
```

### 分页

```js
// 获取10个实例/行
Project.findAll({ limit: 10 })

// 跳过8个实例/行
Project.findAll({ offset: 8 })

// 跳过5个实例，然后取5个
Project.findAll({ offset: 5, limit: 5 })
```

### 排序

`order` 需要一个条目的数组来排序查询或者一个 sequelize 方法。一般来说，你将要使用任一属性的 `tuple/array`，并确定排序的正反方向。

```js
Subtask.findAll({
  order: [
    // 将转义标题，并根据有效的方向参数列表验证DESC
    ['title', 'DESC'],

    // 将按最大值排序(age)
    sequelize.fn('max', sequelize.col('age')),

    // 将按最大顺序(age) DESC
    [sequelize.fn('max', sequelize.col('age')), 'DESC'],

    // 将按 otherfunction 排序(`col1`, 12, 'lalala') DESC
    [sequelize.fn('otherfunction', sequelize.col('col1'), 12, 'lalala'), 'DESC'],

    // 将使用模型名称作为关联的名称排序关联模型的 created_at。
    [Task, 'createdAt', 'DESC'],

    // Will order through an associated model's created_at using the model names as the associations' names.
    [Task, Project, 'createdAt', 'DESC'],

    // 将使用关联的名称由关联模型的created_at排序。
    ['Task', 'createdAt', 'DESC'],

    // Will order by a nested associated model's created_at using the names of the associations.
    ['Task', 'Project', 'createdAt', 'DESC'],

    // Will order by an associated model's created_at using an association object. (优选方法)
    [Subtask.associations.Task, 'createdAt', 'DESC'],

    // Will order by a nested associated model's created_at using association objects. (优选方法)
    [Subtask.associations.Task, Task.associations.Project, 'createdAt', 'DESC'],

    // Will order by an associated model's created_at using a simple association object.
    [{model: Task, as: 'Task'}, 'createdAt', 'DESC'],

    // 嵌套关联模型的 created_at 简单关联对象排序
    [{model: Task, as: 'Task'}, {model: Project, as: 'Project'}, 'createdAt', 'DESC']
  ]
  
  // 将按年龄最大值降序排列
  order: sequelize.literal('max(age) DESC')

  // 按最年龄大值升序排列，当省略排序条件时默认是升序排列
  order: sequelize.fn('max', sequelize.col('age'))

  // 按升序排列是省略排序条件的默认顺序
  order: sequelize.col('age')
  
  // 将根据方言随机排序 (而不是 fn('RAND') 或 fn('RANDOM'))
  order: sequelize.random()
})
```

### 各类查询api

#### 查询多条 findAll(opts) 或者 all(opts)

```js
let list = await model.findAll({
	where:{
		id:{$gt:10},//id大于10的
		name:"test"  //name等于test
	},
	order:[
		"id",   //根据id排序
		["id","desc"]//根据id倒序
	],
	limit:10,//返回个数
	offset:20,//起始位置,跳过数量
	attributes:["attr1","attr2"], //返回的字段
});
```

#### 通过id查询 findById(id,opts)

这里默认数据的主键是id，查询的时候直接通过id查询数据。这里推荐在新建数据库的时候可以添加id作为唯一主键。

```js
let model = await model.findById(12);
```

#### 查询一条记录 findOne(opts)

```js
let model = await model.findOne({
	where:{id:12}
});
```

#### 分页查询 findAndCount(opts) 或者 findAndCountAll

```js
let data = await model.findAndCount({
	limit:10,//每页10条
	offset:0*10,//第x页*每页个数
	where:{}
});
let list = data.rows;
let count = data.count;
```

#### 添加新数据 create(model,opts)

```js
let model = {
	name:"test",
	token:"123"
}
await model.create(model);
```

#### 更新记录 update(model,opts)

```js

await model.update({
  name: '123',
}, {
  where: {
    id: 1
  }
});

```

#### 删除记录 destroy(opts)

```js
await model.destroy({
  where: {
    id: 1
});
```

## 多表联查

### 外键知识点

外键的定制作用----三种约束模式：

1. district：严格模式(默认), 父表不能删除或更新一个被子表引用的记录。
2. cascade：级联模式, 父表操作后，子表关联的数据也跟着一起操作。也是Sequelize的默认模式。
3. set null：置空模式,前提外键字段允许为NLL,  父表操作后，子表对应的字段被置空。

### 使用外键的前提

在Sequelize中使用外键需要提前检查一下下面的这些选项，里面有一条出错就会导致设置失败。

1. 表储存引擎必须是innodb，否则创建的外键无约束效果。
2. 外键的列类型必须与父表的主键类型完全一致。
3. 外键的名字不能重复。
4. 已经存在数据的字段被设为外键时，必须保证字段中的数据与父表的主键数据对应起来。

### 使用示例---默认

默认情况下，主键使用的是主表的id字段，外键是使用的按照table+字段的方式建立的外键。一般情况下需要手动指定。

```js
//主表指定关系
 test1.hasMany(test2, {
     foreignKey: "pid",//外键名称
 });
 //子表指定关系
 test2.belongsTo(test1, {
     foreignKey: "pid",//外键名称
 });
```

默认就会在子表中添加一条外键记录，指向的就是主表的id。一般情况下这样就能够满足正常的使用了。比如一个主表记录商品信息，一个子表记录多个评论消息。

### 使用示例---自定义

如果主表使用的主键id并不能满足正常的使用，还可以指定某一个固定的字段作为主表中的约束关系。

> tips：主表中如果不是使用id作为主要关系，自定义的字段必须添加索引等条件，作为依赖中的关系。

```js
test1.hasMany(test2, {
     foreignKey: "pid",//外键字段名
     sourceKey: "pid",//主键字段名
 });
 test2.belongsTo(test1, {
     foreignKey: "pid",//关联名
     targetKey:"pid"//自定义外键字段
 });
 //等待主键建立成功再建立子表的外键关系
 setTimeout(() => {
    test2.sync({
        force: true
    });
}, 2500);
```

### 使用示例---伪关系

实际使用的时候我还是倾向于这种关系。即表中关系已定的情况下仅仅指定外键关系。同步的时候仅仅同步表内容，不同步这个外键关系。

> 真正的建立可以使用手动建表的时候添加。或者也可以在自动建表结束后异步再执行一次外键关系的添加。

```js
test1.hasMany(test2, {
     foreignKey: "pid",
     sourceKey: "pid",
     constraints: false //不同步建立外键关系
 });
 test2.belongsTo(test1, {
     foreignKey: "pid",
     targetKey:"pid",
     constraints: false //不同步建立外键关系
 });
```