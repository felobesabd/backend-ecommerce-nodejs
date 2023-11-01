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
} = require('../services/userService');

const authService = require('../services/authService');

const router = express.Router();

router.route('/changePassword/:id').put(changePasswordValidator, changeUserPass)

router.route('/')
    .get(
        authService.protect,
        authService.allowedTo('admin', 'manager'),
        getUsers)
    .post(
        authService.protect,
        authService.allowedTo('admin', 'manager'),
        uploadUserImage, resizeImage, createUserValidator, createUser);
router.route('/:id')
    .get(
        authService.protect,
        authService.allowedTo('admin', 'manager'),
        getUserValidator, getUser)
    .put(
        authService.protect,
        authService.allowedTo('admin', 'manager'),
        uploadUserImage, resizeImage, updateUserValidator, updateUser)
    .delete(
        authService.protect,
        authService.allowedTo('admin', 'manager'),
        deleteUserValidator, deleteUser);

module.exports = router;