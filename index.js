var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3500,
    user: "root",
    password: "password",
    database: "employee_db"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadID);
    init();
});

function init() {
    inquirer.prompt(
        {
            type: "list",
            message: "What would you like to do?",
            choices: ["Add a department", "Add a role", "Add an employee", "Update employee roles", "Exit"],
            name: "init"
        }
    )
        .then(function (response) {
            console.log(response);

            if (response.init === "Add a department") {
                inquirer.prompt(
                    {
                        type: "input",
                        message: "What is the name of the department?",
                        name: "departmentName"
                    }
                )
                    .then(function (departmentAnswer) {
                        console.log(departmentAnswer);
                        connection.query(
                            "INSERT INTO department SET ?",
                            {
                                name: departmentAnswer.departmentName
                            },
                            function (err, res) {
                                if (err) throw err;
                                console.log(res.affectedRow + " department added!\n");
                            }
                        ); init();
                    })
            }
            else if (response.init === "Add a role") {
                inquirer.prompt(
                    [
                        {
                            type: "input",
                            message: "What is the title of the role?",
                            name: "roleTitle"
                        },
                        {
                            type: "input",
                            message: "What is the salary of the role?",
                            name: "roleSalary"
                        },
                        {
                            type: "input",
                            message: "What is the department ID that the role is being added to?",
                            name: "roleDepartment"
                        }
                    ]
                )
                    .then(function (roleAnswer) {
                        console.log(roleAnswer);
                        connection.query(
                            "INSERT INTO role SET ?",
                            {
                                title: roleAnswer.roleTitle,
                                salary: roleAnswer.roleSalary,
                                department_id: roleAnswer.roleDepartment
                            },
                            function (err, res) {
                                if (err) throw err;
                                console.log(res.affectedRow + " role added!\n");
                            }
                        ); init();
                    })
            }
            else if (response.init === "Add an employee") {
                inquirer.prompt(
                    [
                        {
                            type: "input",
                            message: "Please enter the employee's first name?",
                            name: "empFirstName"
                        },
                        {
                            type: "input",
                            message: "Please enter the employee's last name?",
                            name: "empLastName"
                        },
                        {
                            type: "input",
                            message: "Please enter the role ID of this employee?",
                            name: "empRole"
                        },
                        {
                            type: "input",
                            message: "Please enter this employee's manager's ID? If no manager, please type '0'",
                            name: "empManager"
                        }
                    ]
                )
                    .then(function (empAnswer) {
                        console.log(empAnswer);
                        connection.query(
                            "INSERT INTO employee SET ?",
                            {
                                first_name: empAnswer.empFirstName,
                                last_name: empAnswer.empLastName,
                                role_id: empAnswer.empRole,
                                manager_id: empAnswer.empManager
                            },
                            function (err, res) {
                                if (err) throw err;
                                console.log(res.affectedRow + " employee added!\n")
                            }
                        ); init();
                    })
            }
            else if (response.init === "Update employee roles") {
                inquirer.prompt(
                    [
                        {
                            type: "input",
                            message: "Please enter the title of the role you would like to update?",
                            name: "updateRole"
                        },
                        {
                            type: "input",
                            message: "Please enter the role's new salary?",
                            name: "updateRoleSalary"
                        }
                    ]
                )
                    .then(function (updateRoleAnswer) {
                        console.log(updateRoleAnswer)
                        connection.query(
                            "UPDATE role SET ? WHERE ?",
                            [
                                {
                                    title: updateRoleAnswer.updateRole
                                },
                                {
                                    salary: updateRoleAnswer.updateRoleSalary
                                }
                            ],
                            function (err, res) {
                                if (err) throw err;
                                console.log(res.affectedRows + " role updated!\n");
                                init();
                            }
                        )
                    })
            }
            else {
                console.log("Selecting all departments, roles and employees...\n");
                connection.query("SELECT * FROM department", function (err, res) {
                    if (err) throw err;
                    console.table(res);
                });
                connection.query("SELECT * FROM role", function (err, res) {
                    if (err) throw err;
                    console.table(res);
                });
                connection.query("SELECT * FROM employee", function (err, res) {
                    if (err) throw err;
                    console.table(res);
                })
                connection.end();
            }
        })
}