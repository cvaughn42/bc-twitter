
// Import file system library
var fs = require('fs-extra');
var stringUtil = require('string');

// Import SQLite 3 
var sqlite3 = require("sqlite3").verbose();

function DAO(fileName, forceNew)
{
    if (!fileName)
    {
        this.fileName = ":memory:";
        this.fileExists = true;
    }
    else
    {
        this.fileName = fileName;
        this.fileExists = fs.existsSync(fileName);

        if (forceNew === true && this.fileExists)
        {
            fs.removeSync(fileName);
            this.fileExists = false;
        }

        this._initializeDatabase();
    }
}

// all DB prepare statements
DAO.INSERT_USER_PRE_STMT = "INSERT INTO user (user_name, password, first_name, middle_name, last_name) VALUES (?, ?, ?, ?, ?)";
DAO.FIND_USER_BY_USERNAME_PRE_STMT = "SELECT rowid FROM user WHERE user_name = ?";
DAO.FIND_USER_BY_USERNAME_PWD_PRE_STMT = "SELECT user_name, first_name, middle_name, last_name FROM user WHERE user_name = ? and password = ?";
DAO.LIST_USERS_PRE_STMT = "SELECT user_name, first_name, middle_name, last_name FROM user WHERE user_name != ?";
/**
 * cb callback(err, success);
 */
DAO.prototype.authenticate = function(userName, password, cb) {
    
    this.db.get(DAO.FIND_USER_BY_USERNAME_PWD_PRE_STMT, userName, password, function (err, row) {

        if (err) {
            cb('Unable to authenticate: ' + err, false);
        }
        else
        {
            if (row) {
                cb(null, {
                    userName: row.user_name,
                    firstName: row.first_name,
                    middleName: row.middle_name,
                    lastName: row.last_name
                });
            } else {
                cb(null, null);
            }
        }
    });   
}
/**
 * Returns a list of users
 */
DAO.prototype.listUsers = function(userName, cb) {

    if (!userName)
    {
        cb('Cannot list users: current user required', null);
    }
    else
    {
        this.db.all(DAO.LIST_USERS_PRE_STMT, userName, function(err, rows) {

            if (err)
            {
                cb("Unable to list users: " + err);
            }
            else
            {
                var users = [];

                for (var row of rows)
                {
                    users.push({
                        userName: row.user_name,
                        firstName: row.first_name,
                        middleName: row.middle_name,
                        lastName: row.last_name
                    });
                }

                cb(null, users);
            }
        });
    }
};

/**
 * Create user
 * @argument user User object 
 *      {
 *          userName: "",
 *          password: "",
 *          firstName: "",
 *          middleName: "",
 *          lastName: ""
 *      }
 */
DAO.prototype.createUser = function(user, cb) {

    try {
        if (!user)
        {
            throw 'User is required';
        }
        
        if (stringUtil(user.userName).isEmpty())
        {
            throw 'User.userName is required';
        }

        if (stringUtil(user.password).isEmpty())
        {
            throw 'User.password is required';
        }

        if (stringUtil(user.firstName).isEmpty())
        {
            throw 'User.firstName is required';
        }

        if (stringUtil(user.lastName).isEmpty())
        {
            throw 'User.lastName is required';
        }
    } catch (err) {
        cb(err, false);
        return;
    }

    var self = this;

    // does the user already exist?
    this.db.get(DAO.FIND_USER_BY_USERNAME_PRE_STMT, user.userName, function (err, row) {

        if (err) {
            cb('Unable to add user: ' + err, false);
            return;
        }

        if (row) {
            cb('User name is already in use', false);
            return;
        }
                
        // If not, add the user
        var stmt = self.db.prepare(DAO.INSERT_USER_PRE_STMT);
        
        stmt.run(user.userName, user.password, user.firstName, user.middleName, user.lastName);
        
        stmt.finalize();

        cb(null, true);
        return;
    });
};
/*
 * Initialize the database
 */
DAO.prototype._initializeDatabase = function() {

    if (!this.fileExists) {
        console.log("Creating DB file " + this.fileName + ".");
        fs.openSync(this.fileName, "w");
    }

    this.db = new sqlite3.Database(this.fileName);

    var self = this;

    this.db.serialize(function () {

        if (!self.fileExists) {
            var sql = fs.readFileSync("create_tables.sql", "utf8");

            self.db.exec(sql);

            var stmt = self.db.prepare(DAO.INSERT_USER_PRE_STMT);

            //Insert users
            stmt.run("cvaughan", "abc", "Chris", null, "Vaughan");
            stmt.run("jku", "abc", "Jing", null, "Ku");

            stmt.finalize();
        }

        self.db.each("SELECT rowid AS id, user_name FROM user", function (err, row) {
            console.log(row.id + ": " + row.user_name);
        });
    });
};


var dbFileName = "bc-twitter-db.sqlite";

//module.exports = new DAO(dbFileName, true);
module.exports = new DAO(dbFileName);