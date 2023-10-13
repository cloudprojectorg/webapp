const { Assignment } = require('../models');

const validateAssignmentData = (data) => {
    const { name, points, num_of_attempts, deadline } = data;

    if (typeof name !== 'string' || name.trim() === '') {
        return { valid: false, error: 'Name must be a valid string.' };
    }

    // Deadline should be a date
    if (isNaN(new Date(deadline).getTime())) {
        return { valid: false, error: 'Deadline must be a valid date.' };
    }

    // Points and number of attempts should be integers
    if (!Number.isInteger(points) || !Number.isInteger(num_of_attempts)) {
        return { valid: false, error: 'Points and number of attempts must be integers.' };
    }

    // No extra parameters except in the model
    const allowedKeys = ['name', 'points', 'num_of_attempts', 'deadline'];
    for (let key in data) {
        if (!allowedKeys.includes(key)) {
            return { valid: false, error: 'Invalid parameter provided.' };
        }
    }
    return { valid: true };
};

//Fetch all Assignments
const getAllAssignments = (req, res) => {
    Assignment.findAll()
        .then(assignments => {
            res.status(200).json(assignments);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Failed to retrieve assignments.' });
        });
};

//Create Assignment
const createAssignment = (req, res) => {
    const { name, points, num_of_attempts, deadline } = req.body;
    console.log('Authenticated user:', req.user);
    const userId = req.user.dataValues.id;

    delete req.body.assignment_created;
    delete req.body.assignment_updated;

    const validation = validateAssignmentData(req.body);
    if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
    }

    // Validation for points
    if (points < 1 || points > 10) {
        return res.status(400).json({ error: 'Points must be between 1 and 10.' });
    }

    if (!userId) {
        console.error("UserID is missing:", userId);
        return res.status(500).json({ error: 'User ID is missing' });
    }

    Assignment.create({ name, points, num_of_attempts, deadline, userId })
        .then(assignment => {
            res.status(201).json(assignment);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Failed to create assignment.' });
        });
};

//Update Assignment
const updateAssignment = (req, res) => {
    const { name, points, num_of_attempts, deadline } = req.body;

    delete req.body.assignment_created;
    delete req.body.assignment_updated;

    const validation = validateAssignmentData(req.body);
    if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
    }

    if (points < 1 || points > 10) {
        return res.status(400).json({ error: 'Points must be between 1 and 10.' });
    }

    Assignment.findOne({ where: { id: req.params.id } })
        .then(assignment => {
            if (!assignment) {
                return res.status(404).json({ error: 'Assignment not found' });
            }
            if (String(assignment.userId).trim() !== String(req.user.dataValues.id).trim()) {
                return res.status(403).json({ error: 'You do not have permission to update this assignment.' });
            }
            assignment.update({ name, points, num_of_attempts, deadline })
                .then(updatedAssignment => {
                    res.json(updatedAssignment);
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).json({ error: 'Failed to update assignment.' });
                });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Failed to find assignment.' });
        });
};

//Delete Assignment
const deleteAssignment = (req, res) => {
    Assignment.findOne({ where: { id: req.params.id } })
        .then(assignment => {
            if (!assignment) {
                return res.status(404).json({ error: 'Assignment not found' });
            }
            if (String(assignment.userId).trim() !== String(req.user.dataValues.id).trim()) {
                return res.status(403).json({ error: 'You do not have permission to delete this assignment.' });
            }
            assignment.destroy()
                .then(() => {
                    res.status(204).send();
                })
                .catch(err => {
                    console.error(err);
                    res.status(500).json({ error: 'Failed to delete assignment.' });
                });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Failed to find assignment.' });
        });
};

//Fetch Assignment by ID
const getAssignmentDetails = (req, res) => {
    const assignmentId = req.params.id;

    Assignment.findOne({ where: { id: assignmentId } })
        .then(assignment => {
            if (!assignment) {
                return res.status(404).json({ error: 'Assignment not found' });
            }
            res.status(200).json(assignment);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Failed to retrieve assignment.' });
        });
};

module.exports = {
    getAllAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    getAssignmentDetails
};
