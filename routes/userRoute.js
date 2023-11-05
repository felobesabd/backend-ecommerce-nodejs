const express = require('express');

const {
    getUserValidator,
    createUserValidator,
    updateUserValidator,
    deleteUserValidator,
    changePasswordValidator,
    updateLoggedUserValidator,
} = require('../utils/validator/userValidator');

const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    uploadUserImage,
    resizeImage,
    changeUserPass,
    getLoggedUserData,
    updateLoggedUserPass,
    updateLoggedUserData,
    deleteLoggedUserData
} = require('../services/userService');

const authService = require('../services/authService');

const router = express.Router();

router.use(authService.protect)

router.route('/getMe').get(getLoggedUserData, getUser)
router.route('/updateMyPassword').put(updateLoggedUserPass)
router.route('/updateMe').put(updateLoggedUserValidator, updateLoggedUserData)
router.route('/deleteMe').delete(deleteLoggedUserData)

router.use(authService.allowedTo('admin', 'manager'))

router.route('/changePassword/:id').put(changePasswordValidator, changeUserPass)

router.route('/')
    .get(getUsers)
    .post(uploadUserImage, resizeImage, createUserValidator, createUser);
router.route('/:id')
    .get(getUserValidator, getUser)
    .put(uploadUserImage, resizeImage, updateUserValidator, updateUser)
    .delete(deleteUserValidator, deleteUser);

module.exports = router;