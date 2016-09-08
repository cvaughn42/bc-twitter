
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
DAO.prototype.createUser = function(user) {

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

    var self = this;

    // does the user already exist?
    this.db.get(DAO.FIND_USER_BY_USERNAME_PRE_STMT, user.userName, function (err, row) {

        if (err) {
            throw 'Unable to add user: ' + err;
        }

        if (row) {
            throw 'User name is already in use';
        }
                
        // If not, add the user
        var stmt = self.db.prepare(DAO.INSERT_USER_PRE_STMT);
        
        stmt.run(user.userName, user.password, user.firstName, user.middleName, user.lastName);
        
        stmt.finalize();

        return true;
    });

    return false;
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

// module.exports = new DAO(dbFileName, true);
module.exports = new DAO(dbFileName);