//Assignment 
//required files
require('dotenv').config({ path: '/etc/webapp.env' });
const { Assignment } = require('../Models');
const applicationLog = require('../log/logger');


//validate assignment data
const validateAssignmentData = (data) => {
    //name, points, deadline, etc.
    const { name, points, num_of_attempts, deadline } = data;

    //check if valid string for name
    if (typeof name !== 'string' || name.trim() === '') {
        return { valid: false, error: 'Name must be a valid string.' };
    }

    // check the deadline format is in YYYY-MM-DD
    const deadlinePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    //to check the deadline pattern
    //to check the date
    if (!deadlinePattern.test(deadline) || isNaN(new Date(deadline).getTime())) {
        //if not in the correct format 
        return { valid: false, error: 'Deadline must be a valid date in the format YYYY-MM-DDTHH:MM:SS.sssZ.' };
    }

    // points & attempts should be integer values
    if (!Number.isInteger(points) || !Number.isInteger(num_of_attempts)) {
        //if not valid display error
        return { valid: false, error: 'Points and number of attempts must be integers.' };
    }

    // validate num_of_attempts
    if (num_of_attempts <= 0 || num_of_attempts > 100) {
        //if not valid display error
        return { valid: false, error: 'Number of attempts min: 1 and max : 100' }
    }

    // extra parameters not allowed except in the model
    const allowedKeys = ['name', 'points', 'num_of_attempts', 'deadline'];
    for (let key in data) {
        //check for allowed keys
        if (!allowedKeys.includes(key)) {
            //if not valid display error
            return { valid: false, error: 'Invalid parameter provided.' };
        }
    }
    return { valid: true };
};


//serialize assignment
const serializeAssignment = (assignment) => {
    const { userId, ...rest } = assignment.dataValues;
    //return
    return rest;
};

//fetch all the assignments
const getAllAssignments = (req, res) => {
    Assignment.findAll()
        .then(assignments => {
            //map assignment
            const serializedAssignments = assignments.map(serializeAssignment);
            //status code as 200
            res.status(200).json(serializedAssignments);
        })
        .catch(err => {
            console.error(err);
            //if failed to retrieve, code 500
            applicationLog(`Failed to fetch assignments: ${err.message}`);
            res.status(500).json({ error: 'Failed to fetch assignments.' });
        });
};

//create an assignment
//with authenticated user
const createAssignment = (req, res) => {
    const { name, points, num_of_attempts, deadline } = req.body;
    //applicationLog('Authenticated user:', req.user);
    applicationLog(`Authenticated user ID: ${req.user.dataValues.id}`);
    const userId = req.user.dataValues.id;

    //delete req assignment created 
    delete req.body.assignment_created;
    //delete req assignment updated
    delete req.body.assignment_updated;


    //validate the assignment data
    const validation = validateAssignmentData(req.body);
    if (!validation.valid) {
        //return 400 if error in validating assignment data
        return res.status(400).json({ error: validation.error });
    }

    // validate points for the assignment between 1-10
    if (points < 1 || points > 10) {
        //check if its between 1 and 10
        return res.status(400).json({ error: 'Points must be between 1 and 10.' });
    }

    //check if user id is present or not
    if (!userId) {
        //if user id is not present
        //console.error("UserID is missing:", userId);
        applicationLog(`UserID is missing > Authenticated user ID: ${req.user.dataValues.id}`);
        //if not show errors
        return res.status(400).json({ error: 'User ID is missing' });
    }

    //create assignment with name, num_of_attempts, deadline, and userId
    Assignment.create({ name, points, num_of_attempts, deadline, userId })
        .then(assignment => {
            //status as 201
            res.status(201).json(serializeAssignment(assignment));
        })
        .catch(err => {
            //console.error(err);
            //if failed to create the assignment
            applicationLog(`Failed to create assignment > Error: ${err.message}`);
            res.status(500).json({ error: 'Failed to create assignment.' });
        });
};

//Update Assignment
const updateAssignment = (req, res) => {
    const { name, points, num_of_attempts, deadline } = req.body;

    // Check for authentication
    if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized. Please provide valid authentication credentials.' });
    }

    //delete req assignment cretaed 
    delete req.body.assignment_created;
    //delete req assignment updated 
    delete req.body.assignment_updated;

    //validate assignment data
    const validation = validateAssignmentData(req.body);
    if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
    }

    //check points between 1-10
    if (points < 1 || points > 10) {
        return res.status(400).json({ error: 'Points must be between 1 and 10.' });
    }

    //Check if assignment present or not
    Assignment.findOne({ where: { id: req.params.id } })
        .then(assignment => {
            if (!assignment) {
                //404 if assignment not found
                return res.status(404).json({ error: 'Assignment not found' });
            }
            //check if the user has the permission to update
            if (String(assignment.userId).trim() !== String(req.user.dataValues.id).trim()) {
                return res.status(403).json({ error: 'You do not have permission to update this assignment.' });
            }
            //update assignment
            assignment.update({ name, points, num_of_attempts, deadline })
                .then(updatedAssignment => {
                    //with status code 204
                    res.status(204).send();
                })
                .catch(err => {
                    //console.error(err);
                    //assignment updation failed
                    applicationLog(`Failed assignment updation with ID ${req.params.id} - Error: ${err.message}`);
                    res.status(500).json({ error: 'Failed to update assignment. An internal server error occurred.' });
                });
        })
        .catch(err => {
            //console.error(err);
            //error while accessing database
            applicationLog(`Database accessing error during operation on assignment with ID ${req.params.id} - Error: ${err.message}`);
            res.status(500).json({ error: 'Error occurred while accessing the database.' });
        });
};

//Delete Assignment
const deleteAssignment = (req, res) => {
    //Check if assignment present or not
    Assignment.findOne({ where: { id: req.params.id } })
        .then(assignment => {
            if (!assignment) {
                //404 if assignment not found
                return res.status(404).json({ error: 'Assignment not found' });
            }
            //if delete with body
            if (Object.keys(req.body).length !== 0) {
                return res.status(400).json({ error: 'Bad request: DELETE request should not include body.' });
            }
            //user does not have permission to delete the assignment
            if (String(assignment.userId).trim() !== String(req.user.dataValues.id).trim()) {
                //status code 401
                return res.status(401).json({ error: 'You do not have permission to delete this assignment.' });
            }
            //delete assignment
            assignment.destroy()
                .then(() => {
                    //status code 204 for deletion
                    res.status(204).send();
                })
                .catch(err => {
                    //console.error(err);
                    // failed to delete assignment
                    applicationLog(`Failed to delete assignment with ID ${req.params.id} - Error: ${err.message}`);
                    res.status(500).json({ error: 'Failed to delete assignment.' });
                });
        })
        .catch(err => {
            //console.error(err);
            //failed to find assignment
            applicationLog(`Failed to find assignment with ID ${req.params.id} - Error: ${err.message}`);
            res.status(500).json({ error: 'Failed to find assignment.' });
        });
};

//Fetch Assignment by ID
const getAssignmentDetails = (req, res) => {
    const assignmentId = req.params.id;

    //unauthorized user
    if (!req.user) {
        //status code 401 for unauthorized user
        return res.status(401).json({ error: 'Unauthorized. Please provide valid authentication credentials.' });
    }

    //Check if assignment present or not
    Assignment.findOne({ where: { id: assignmentId } })
        .then(assignment => {
            if (!assignment) {
                //404 if assignment not found
                return res.status(404).json({ error: 'Assignment not found' });
            }

            // Optionally, check for ownership if you want to restrict viewing
            if (String(assignment.userId).trim() !== String(req.user.dataValues.id).trim()) {
                //do not have the permission to view assignment
                return res.status(403).json({ error: 'You do not have permission to view this assignment.' });
            }
            //status code 200
            res.status(200).json(serializeAssignment(assignment));
        })
        .catch(err => {
            //console.error(err);
            //retrieve assignment failed, status code 500
            applicationLog(`Failed to retrieve assignment with ID ${req.params.id} - Error: ${err.message}`);
            res.status(500).json({ error: 'Failed to retrieve assignment.' });
        });
};


//export all the modules getAllAssignments,createAssignment, updateAssignment, deleteAssignment, getAssignmentDetails
module.exports = {
    getAllAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    getAssignmentDetails
};
