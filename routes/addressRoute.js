const express = require('express');

const {} = require('../utils/validator/userValidator');

const { addAddresses, deleteAddress, getAddressesOfLoggedUser } = require('../services/addressService');

const authService = require('../services/authService');

const router = express.Router();

router.use( authService.protect, authService.allowedTo('user'))

router.route('/')
    .post(addAddresses)
    .get(getAddressesOfLoggedUser)

router.route('/:addressId')
    .delete(deleteAddress)

module.exports = router;