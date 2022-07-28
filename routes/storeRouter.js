const express = require("express");
const router = express.Router();
const storeCtrl = require("../controllers/storeCtrl");

router.route("/").get(storeCtrl.getStores).post(storeCtrl.addStore);
router.get("/:north/:west/:south/:east/", storeCtrl.queryByCoordinates);

module.exports = router;
