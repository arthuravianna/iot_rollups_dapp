var express = require('express');

var homeController = require('../controllers/home');

var router = express.Router();

// index page(dashboard)
router.get('/', homeController.homePage);
router.post('/', homeController.homePageFilter);
//router.post('/dashboard-form', homeController.dashboard_form);

// form page
router.get('/form', homeController.formPage);

// submit data
router.post("/submit", homeController.submit);


module.exports = router