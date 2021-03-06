var mysql = require("mysql");
var inquirer = require("inquirer");
// Login info to create mySQL connection
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "employees_db"
});
// Error function, if error occurs
connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadID);
    init();
});

// function to initialize the prompts
function init() {
    inquirer.prompt(
        {
            type: "list",
            message: "What would you like to do?",
            choices: ["Add a department", "Add a role", "Add an employee", "Update employee roles", "View departments", "View roles", "View employees", "Exit"],
            name: "init"
        }
    )
        .then(function (response) {
            console.log(response);
            // First prompt: add a department
            if (response.init === "Add a department") {
                inquirer.prompt(
                    {
                        type: "input",
                        message: "Please enter the name of the department?",
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
            // Second prompt: add a role
            else if (response.init === "Add a role") {
                connection.query("SELECT * FROM department", function (err, res) {
                    if (err) throw err
                    const myDepartments = res.map(function (dep) {
                        return ({
                            name: dep.name,
                            value: dep.id
                        })
                    })
                    inquirer.prompt(
                        [
                            {
                                type: "input",
                                message: "Please enter the title of the role?",
                                name: "roleTitle"
                            },
                            {
                                type: "input",
                                message: "Please enter the salary of the role?",
                                name: "roleSalary"
                            },
                            {
                                type: "list",
                                message: "Please enter the department ID that the role is being added to?",
                                name: "roleDepartment",
                                choices: myDepartments
                            }
                        ]
                    )
                        // Iserts the user entry into roleAnswer DB set
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
                })
            }
            // Third Prompt: add an employee
            else if (response.init === "Add an employee") {
                connection.query("SELECT * FROM role", function (err, res) {
                    if (err) throw err;
                    const myRole = res.map(function (role) {
                        return ({
                            name: role.title,
                            value: role.id
                        })
                    })
                    connection.query("SELECT * FROM employee", function (error, result) {
                        if (error) throw error;
                        const myManager = result.map(function (employee) {
                            return ({
                                name: `${employee.first_name} ${employee.last_name}`,
                                value: employee.id
                            })
                        })
                        myManager.unshift({
                            name: "None",
                            value: 0
                        })
                        // Subsequent questions about employee(s)
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
                                    type: "list",
                                    message: "Please enter the role ID of this employee?",
                                    name: "empRole",
                                    choices: myRole
                                },
                                {
                                    type: "list",
                                    message: "Who is this employee's manager?",
                                    name: "empManager",
                                    choices: myManager
                                }
                            ]
                        )
                            // Inserts user input into SQL database
                            .then(function (empAnswer) {
                                console.log(empAnswer);
                                if (empAnswer.empManager === 0) {
                                    connection.query(
                                        "INSERT INTO employee SET ?",
                                        {
                                            first_name: empAnswer.empFirstName,
                                            last_name: empAnswer.empLastName,
                                            role_id: empAnswer.empRole,
                                        },
                                        function (err, res) {
                                            if (err) throw err;
                                            console.log(res.affectedRow + " employee added!\n")
                                        }
                                    ); init();
                                }
                                else {
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
                                }
                            })
                    })
                })
            }
            // Option to update existing employee roles
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
                                    salary: updateRoleAnswer.updateRoleSalary
                                },
                                {
                                    title: updateRoleAnswer.updateRole
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
            // Prompt option to view departments with existing user input
            else if (response.init === "View departments") {
                connection.query("SELECT * FROM department", function (err, res) {
                    if (err) throw err;
                    console.table(res);
                    init();
                });
            }
            // Prompt option to view employee roles with existing user input
            else if (response.init === "View roles") {
                connection.query("SELECT * FROM role", function (err, res) {
                    if (err) throw err;
                    console.table(res);
                    init();
                });
            }
            // Prompt option to view employees with existing user input
            else if (response.init === "View employees") {
                connection.query("SELECT * FROM employee", function (err, res) {
                    if (err) throw err;
                    console.table(res);
                    init();
                });
            }
            else {
                connection.end();
            }
        })
}

// FIN!