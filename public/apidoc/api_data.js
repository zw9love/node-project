define({ "api": [
  {
    "type": "post",
    "url": "/demo/addHeader",
    "title": "测试添加请求头",
    "description": "<p>测试添加请求头</p>",
    "name": "_______",
    "group": "demo",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>请求头token值</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "name",
            "defaultValue": "xxx",
            "description": "<p>用户名</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "passwd",
            "defaultValue": "123",
            "description": "<p>密码</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "data",
            "description": "<p>返回值</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    \"code\": 200,\n    \"message\": \"hello world\",\n    \"data\": 'xxx'\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "http://localhost:8080/demo/addHeader"
      }
    ],
    "version": "1.0.0",
    "filename": "src/routes/demo.js",
    "groupTitle": "demo"
  },
  {
    "type": "post",
    "url": "/demo/:id/:name",
    "title": "测试接口带参数id",
    "description": "<p>测试接口带参数id</p>",
    "name": "_demo__ids",
    "group": "demo",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>id值.</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>name值.</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "data",
            "description": "<p>返回值</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    \"code\": 200,\n    \"message\": \"hello world\",\n    \"data\": {}\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "http://localhost:8080/demo/:id/:name"
      }
    ],
    "version": "1.0.0",
    "filename": "src/routes/demo.js",
    "groupTitle": "demo"
  },
  {
    "type": "post",
    "url": "/demo",
    "title": "测试",
    "description": "<p>测试</p>",
    "name": "demo",
    "group": "demo",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "name",
            "defaultValue": "xxx",
            "description": "<p>用户名</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "passwd",
            "defaultValue": "123",
            "description": "<p>密码</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "data",
            "description": "<p>返回值</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    \"code\": 200,\n    \"message\": \"hello world\",\n    \"data\": {}\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "http://localhost:8080/demo"
      }
    ],
    "version": "1.0.0",
    "filename": "src/routes/demo.js",
    "groupTitle": "demo"
  },
  {
    "type": "get",
    "url": "/user/pagination",
    "title": "测试分页",
    "description": "<p>测试分页</p>",
    "name": "_pagination",
    "group": "user",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "number",
            "optional": false,
            "field": "pageNumber",
            "defaultValue": "1",
            "description": "<p>第几页</p>"
          },
          {
            "group": "Parameter",
            "type": "number",
            "optional": false,
            "field": "pageSize",
            "defaultValue": "10",
            "description": "<p>每页多少条数据</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "data",
            "description": "<p>返回值</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    \"code\": 200,\n    \"message\": \"hello world\",\n    \"data\": {}\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "http://localhost:8080/user/pagination"
      }
    ],
    "version": "1.0.0",
    "filename": "src/routes/user.js",
    "groupTitle": "user"
  },
  {
    "type": "post",
    "url": "/user/transaction",
    "title": "测试事务",
    "description": "<p>测试事务</p>",
    "name": "_transaction",
    "group": "user",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "number",
            "optional": false,
            "field": "money",
            "defaultValue": "0",
            "description": "<p>转钱数值</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "data",
            "description": "<p>返回值</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    \"code\": 200,\n    \"message\": \"hello world\",\n    \"data\": \"\"\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "http://localhost:8080/user/transaction"
      }
    ],
    "version": "1.0.0",
    "filename": "src/routes/user.js",
    "groupTitle": "user"
  },
  {
    "type": "post",
    "url": "/user/add",
    "title": "增加用户",
    "description": "<p>增加用户</p>",
    "name": "_user_add",
    "group": "user",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "name",
            "description": "<p>用户名</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "age",
            "defaultValue": "0",
            "description": "<p>年龄</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "money",
            "defaultValue": "0",
            "description": "<p>年龄</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "data",
            "description": "<p>返回值</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    \"code\": 200,\n    \"message\": \"hello world\",\n    \"data\": {}\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "http://localhost:8080/user/add"
      }
    ],
    "version": "1.0.0",
    "filename": "src/routes/user.js",
    "groupTitle": "user"
  },
  {
    "type": "get",
    "url": "/user/getList",
    "title": "获取用户列表",
    "description": "<p>获取用户列表</p>",
    "name": "_user_getList",
    "group": "user",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "name",
            "description": "<p>用户名</p>"
          },
          {
            "group": "Parameter",
            "type": "string",
            "optional": false,
            "field": "passwd",
            "description": "<p>密码</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "data",
            "description": "<p>返回值</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    \"code\": 200,\n    \"message\": \"hello world\",\n    \"data\": {}\n}",
          "type": "json"
        }
      ]
    },
    "sampleRequest": [
      {
        "url": "http://localhost:8080/user/getList"
      }
    ],
    "version": "1.0.0",
    "filename": "src/routes/user.js",
    "groupTitle": "user"
  }
] });
